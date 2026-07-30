"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import {
  dialogContentVariants,
  type DialogSize,
  type DialogVariant,
} from "@/components/ui/dialog-variants";
import { cn } from "@/utils/cn";

/**
 * Audient Dialog primitives — `components/ui/dialog`
 * (COMPONENT_MAPPING Modal / Dialog). Radix provides focus trap, Esc,
 * `aria-modal`, labelled title, and focus restore.
 */

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-overlay bg-foreground/40",
      "data-[state=open]:animate-fade-in",
      "motion-reduce:animate-none",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

type DialogContentProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> & {
  size?: DialogSize;
  variant?: DialogVariant;
  scrollable?: boolean;
  showCloseButton?: boolean;
  /** Block Esc / outside click (e.g. while submitting). */
  preventDismiss?: boolean;
};

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(
  (
    {
      className,
      children,
      size = "md",
      variant = "default",
      scrollable = false,
      showCloseButton = true,
      preventDismiss = false,
      onEscapeKeyDown,
      onPointerDownOutside,
      onInteractOutside,
      ...props
    },
    ref,
  ) => {
    const blockDismiss = (event: Event) => {
      if (preventDismiss) event.preventDefault();
    };

    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            dialogContentVariants({ size, variant, scrollable }),
            size === "fullscreen"
              ? "fixed inset-0 z-modal h-[100dvh] w-full"
              : [
                  "fixed inset-x-0 bottom-0 z-modal w-full",
                  "sm:inset-auto sm:left-1/2 sm:top-1/2 sm:bottom-auto",
                  "sm:w-full sm:-translate-x-1/2 sm:-translate-y-1/2",
                  "rounded-t-lg sm:rounded-lg",
                ].join(" "),
            className,
          )}
          onEscapeKeyDown={(event) => {
            if (preventDismiss) event.preventDefault();
            onEscapeKeyDown?.(event);
          }}
          onPointerDownOutside={(event) => {
            blockDismiss(event);
            onPointerDownOutside?.(event);
          }}
          onInteractOutside={(event) => {
            blockDismiss(event);
            onInteractOutside?.(event);
          }}
          {...props}
        >
          {children}
          {showCloseButton ? (
            <DialogPrimitive.Close
              className={cn(
                "absolute right-sm top-sm inline-flex size-11 items-center justify-center",
                "rounded-md text-muted-foreground transition-colors",
                "hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
              aria-label="Close"
            >
              <X className="size-5" aria-hidden="true" />
            </DialogPrimitive.Close>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  },
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col gap-sm pr-12 text-left sm:pr-14",
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "mt-md flex flex-col-reverse gap-sm sm:flex-row sm:justify-end",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-body-sm font-semibold leading-tight text-foreground sm:text-body",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      "text-info text-muted-foreground sm:text-body-sm",
      className,
    )}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

const DialogBody = ({
  className,
  scrollable = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { scrollable?: boolean }) => (
  <div
    className={cn(
      "py-md",
      scrollable && "min-h-0 flex-1 overflow-y-auto overscroll-contain",
      className,
    )}
    {...props}
  />
);
DialogBody.displayName = "DialogBody";

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
