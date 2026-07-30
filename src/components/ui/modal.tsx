"use client";

import * as React from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DialogSize, DialogVariant } from "@/components/ui/dialog-variants";
import { cn } from "@/utils/cn";

type ModalTone = Exclude<DialogVariant, "default"> | "confirmation";

const toneIcon: Record<ModalTone, React.ReactNode> = {
  confirmation: <HelpCircle className="size-5" aria-hidden="true" />,
  warning: <AlertTriangle className="size-5" aria-hidden="true" />,
  error: <AlertCircle className="size-5" aria-hidden="true" />,
  success: <CheckCircle2 className="size-5" aria-hidden="true" />,
};

const toneIconClassName: Record<ModalTone, string> = {
  confirmation: "bg-muted text-foreground",
  warning: "bg-warning/25 text-foreground",
  error: "bg-error/15 text-error",
  success: "bg-success/15 text-success",
};

export interface ModalProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Intent chrome — confirmation / warning / error / success. */
  variant?: ModalTone | "default";
  /** sm · md · lg · fullscreen */
  size?: DialogSize;
  /** Body scrolls inside the panel when content overflows. */
  scrollable?: boolean;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
  /** Block Esc and outside dismiss (e.g. payment submitting). */
  preventDismiss?: boolean;
  className?: string;
  contentClassName?: string;
}

/**
 * Audient Modal — convenience Dialog for MDL-* surfaces.
 * Uses Radix Dialog: focus trap, Esc, ARIA, keyboard, focus restore.
 */
function Modal({
  open,
  defaultOpen,
  onOpenChange,
  variant = "default",
  size = "md",
  scrollable = false,
  title,
  description,
  children,
  footer,
  showCloseButton = true,
  preventDismiss = false,
  className,
  contentClassName,
}: ModalProps) {
  const tone: ModalTone | null =
    variant === "default" ? null : (variant as ModalTone);
  const dialogVariant: DialogVariant =
    variant === "confirmation" ? "confirmation" : variant;

  return (
    <Dialog
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        size={size}
        variant={dialogVariant}
        scrollable={scrollable || size === "fullscreen"}
        showCloseButton={showCloseButton}
        preventDismiss={preventDismiss}
        className={cn(className, contentClassName)}
      >
        <DialogHeader>
          <div className="flex items-start gap-sm">
            {tone ? (
              <span
                className={cn(
                  "mt-0.5 inline-flex size-11 shrink-0 items-center justify-center rounded-md",
                  toneIconClassName[tone],
                )}
                aria-hidden="true"
              >
                {toneIcon[tone]}
              </span>
            ) : null}
            <div className="min-w-0 flex-1 space-y-sm">
              <DialogTitle>{title}</DialogTitle>
              {description ? (
                <DialogDescription>{description}</DialogDescription>
              ) : null}
            </div>
          </div>
        </DialogHeader>

        {children ? (
          <DialogBody scrollable={scrollable || size === "fullscreen"}>
            {children}
          </DialogBody>
        ) : null}

        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  );
}

Modal.displayName = "Modal";

export { Modal };
