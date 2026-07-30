"use client";

import * as React from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
} from "lucide-react";
import {
  Toaster as Sonner,
  toast as sonnerToast,
  type ExternalToast,
} from "sonner";

import { cn } from "@/utils/cn";

/**
 * Audient Toast — `components/ui/toast` (COMPONENT_MAPPING → Sonner)
 *
 * Global transient feedback: success / warning / info / error / loading.
 * Queue, auto-dismiss, manual close, animations, live regions via Sonner.
 * Token surfaces → dark-mode ready when `.dark` overrides exist.
 */

const TOAST_DURATION_DEFAULT = 5_000;
const TOAST_DURATION_ERROR = 8_000;
const TOAST_DURATION_LOADING = Number.POSITIVE_INFINITY;

export type ToastOptions = ExternalToast;

function Toaster({ ...props }: React.ComponentProps<typeof Sonner>) {
  return (
    <Sonner
      theme="light"
      // Top placement avoids sticky bottom CTAs (WCAG 2.4.11 Focus Not Obscured)
      position="top-center"
      offset={16}
      mobileOffset={16}
      gap={8}
      visibleToasts={4}
      expand
      closeButton
      duration={TOAST_DURATION_DEFAULT}
      richColors={false}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: cn(
            "group flex w-[min(100%,24rem)] items-start gap-sm rounded-lg border p-md",
            "bg-card text-card-foreground font-sans shadow-lg",
            "data-[type=success]:border-success/40",
            "data-[type=warning]:border-warning/40",
            "data-[type=info]:border-secondary/40",
            "data-[type=error]:border-error/50",
            "data-[type=loading]:border-border",
          ),
          title: "text-body-sm font-semibold text-foreground",
          description: "text-info text-muted-foreground sm:text-body-sm",
          actionButton: cn(
            "rounded-md bg-primary px-sm py-1 text-info font-semibold",
            "text-primary-foreground",
          ),
          cancelButton: cn(
            "rounded-md bg-muted px-sm py-1 text-info font-semibold",
            "text-muted-foreground",
          ),
          closeButton: cn(
            "left-auto right-0 size-11 rounded-md border-0 bg-transparent",
            "text-muted-foreground hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          ),
          icon: "mt-0.5",
        },
      }}
      icons={{
        success: (
          <CheckCircle2 className="size-5 text-success" aria-hidden="true" />
        ),
        warning: (
          <AlertTriangle className="size-5 text-foreground" aria-hidden="true" />
        ),
        info: <Info className="size-5 text-secondary" aria-hidden="true" />,
        error: <AlertCircle className="size-5 text-error" aria-hidden="true" />,
        loading: (
          <Loader2
            className="size-5 animate-spin text-muted-foreground motion-reduce:animate-none"
            aria-hidden="true"
          />
        ),
      }}
      className={cn(
        "toaster group",
        "[&_[data-sonner-toast]]:motion-reduce:transition-none",
        props.className,
      )}
      {...props}
    />
  );
}

Toaster.displayName = "Toaster";

type ToastMessage = string | React.ReactNode;

const toast = {
  success: (message: ToastMessage, options?: ToastOptions) =>
    sonnerToast.success(message, {
      duration: TOAST_DURATION_DEFAULT,
      ...options,
    }),

  warning: (message: ToastMessage, options?: ToastOptions) =>
    sonnerToast.warning(message, {
      duration: TOAST_DURATION_DEFAULT,
      ...options,
    }),

  info: (message: ToastMessage, options?: ToastOptions) =>
    sonnerToast.info(message, {
      duration: TOAST_DURATION_DEFAULT,
      ...options,
    }),

  /** Longer default duration; Sonner uses alert semantics for errors. */
  error: (message: ToastMessage, options?: ToastOptions) =>
    sonnerToast.error(message, {
      duration: TOAST_DURATION_ERROR,
      ...options,
    }),

  /** Stays until dismissed or updated (e.g. promise settle). */
  loading: (message: ToastMessage, options?: ToastOptions) =>
    sonnerToast.loading(message, {
      duration: TOAST_DURATION_LOADING,
      ...options,
    }),

  message: (message: ToastMessage, options?: ToastOptions) =>
    sonnerToast(message, {
      duration: TOAST_DURATION_DEFAULT,
      ...options,
    }),

  promise: sonnerToast.promise,
  custom: sonnerToast.custom,
  dismiss: sonnerToast.dismiss,
};

export { Toaster, toast, TOAST_DURATION_DEFAULT, TOAST_DURATION_ERROR };
