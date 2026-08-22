"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { BodySmall } from "@/components/ui/typography";
import {
  MARK_ALL_READ_BUTTON_COPY,
  type MarkAllReadButtonState,
} from "@/config/mark-all-read-button";
import { markAllReadButtonAnalytics } from "@/lib/analytics/mark-all-read-button-events";
import { cn } from "@/utils/cn";

export type MarkAllReadButtonProps = {
  /** Total unread in inbox — disables when 0. */
  unreadCount: number;
  /** Parent updates mock notification store (sync or async). */
  onMarkAllRead: () => void | Promise<void>;
  disabled?: boolean;
  variant?: "outline" | "ghost" | "secondary";
  fullWidth?: boolean;
  className?: string;
  id?: string;
};

/**
 * COMPONENT-043 — Mark All Read Button.
 * Marks entire mock inbox read — parent owns list + badge count.
 */
export function MarkAllReadButton({
  unreadCount,
  onMarkAllRead,
  disabled = false,
  variant = "outline",
  fullWidth = false,
  className,
  id,
}: MarkAllReadButtonProps) {
  const [status, setStatus] = React.useState<MarkAllReadButtonState>("idle");
  const isLoading = status === "loading";
  const isError = status === "error";
  const noUnread = unreadCount <= 0;
  const isDisabled = disabled || (noUnread && !isError) || isLoading;

  const run = React.useCallback(async () => {
    if (disabled || isLoading) return;
    if (noUnread && !isError) return;

    const unreadBefore = unreadCount;
    markAllReadButtonAnalytics.clicked({ unreadCountBefore: unreadBefore });
    setStatus("loading");

    try {
      await onMarkAllRead();
      toast.success(MARK_ALL_READ_BUTTON_COPY.success);
      markAllReadButtonAnalytics.completed({
        unreadCountBefore: unreadBefore,
        changed: unreadBefore,
      });
      setStatus("idle");
    } catch {
      setStatus("error");
      toast.error(MARK_ALL_READ_BUTTON_COPY.error);
    }
  }, [disabled, isError, isLoading, noUnread, onMarkAllRead, unreadCount]);

  const buttonLabel = isError
    ? MARK_ALL_READ_BUTTON_COPY.retry
    : MARK_ALL_READ_BUTTON_COPY.label;

  const ariaLabel =
    noUnread && !isError
      ? MARK_ALL_READ_BUTTON_COPY.labelDisabled
      : isLoading
        ? MARK_ALL_READ_BUTTON_COPY.labelLoading
        : buttonLabel;

  return (
    <div
      className={cn(
        "flex flex-col gap-sm",
        fullWidth && "w-full sm:w-auto",
        className,
      )}
    >
      <Button
        id={id}
        type="button"
        variant={variant}
        size="md"
        fullWidth={fullWidth}
        isLoading={isLoading}
        disabled={isDisabled}
        aria-label={ariaLabel}
        className={cn(!fullWidth && "w-full sm:w-auto")}
        onClick={() => void run()}
      >
        {buttonLabel}
      </Button>

      {isError ? (
        <BodySmall role="alert" className="text-error">
          {MARK_ALL_READ_BUTTON_COPY.error}
        </BodySmall>
      ) : null}
    </div>
  );
}
