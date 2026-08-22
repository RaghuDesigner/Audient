"use client";

import * as React from "react";
import { Bell, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BodySmall } from "@/components/ui/typography";
import {
  NOTIFICATION_EMPTY_STATE_COPY,
  type NotificationEmptyStateVariant,
} from "@/config/notification-empty-state";
import { cn } from "@/utils/cn";

export type NotificationEmptyStateProps = {
  variant: NotificationEmptyStateVariant;
  /** Resets NotificationFilter to All — required for filtered variant. */
  onClearFilter?: () => void;
  /** Optional CTA on default empty (e.g. Dashboard). */
  onPrimaryAction?: () => void;
  primaryLabel?: string;
  /** Dropdown / compact preview density. */
  compact?: boolean;
  headingLevel?: "h2" | "h3" | "h4";
  className?: string;
};

/**
 * COMPONENT-041 — Notification Empty State.
 * Default caught-up vs filtered-no-results — mock only.
 */
export function NotificationEmptyState({
  variant,
  onClearFilter,
  onPrimaryAction,
  primaryLabel,
  compact = false,
  headingLevel = "h3",
  className,
}: NotificationEmptyStateProps) {
  const copy = NOTIFICATION_EMPTY_STATE_COPY[variant];
  const HeadingTag = headingLevel;
  const Icon = variant === "filtered" ? SearchX : Bell;

  const showClearFilter = variant === "filtered" && onClearFilter != null;
  const showPrimary =
    variant === "default" &&
    primaryLabel != null &&
    onPrimaryAction != null;

  return (
    <section
      className={cn(
        "flex w-full flex-col items-center text-center",
        compact
          ? "gap-sm px-sm py-md"
          : "gap-md rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg",
        !compact && "mx-auto max-w-md",
        className,
      )}
      role="status"
      aria-label={NOTIFICATION_EMPTY_STATE_COPY.regionLabel}
    >
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-md bg-muted text-muted-foreground",
          compact ? "size-10" : "size-14 sm:size-16",
        )}
        aria-hidden
      >
        <Icon className={compact ? "size-5" : "size-7 sm:size-8"} />
      </div>

      <div className="flex max-w-md flex-col gap-sm">
        <HeadingTag
          className={cn(
            "font-bold text-foreground",
            compact ? "text-body-sm" : "text-body-sm sm:text-body",
          )}
        >
          {copy.headline}
        </HeadingTag>
        <BodySmall className="text-muted-foreground">{copy.description}</BodySmall>
      </div>

      {showClearFilter || showPrimary ? (
        <div
          className={cn(
            "flex w-full flex-col gap-sm",
            !compact && "sm:w-auto sm:flex-row sm:justify-center",
          )}
        >
          {showClearFilter ? (
            <Button
              type="button"
              variant="primary"
              fullWidth={!compact}
              className={cn(
                "text-primary-foreground",
                !compact && "sm:w-auto",
              )}
              onClick={onClearFilter}
            >
              {NOTIFICATION_EMPTY_STATE_COPY.filtered.clearFilter}
            </Button>
          ) : null}
          {showPrimary ? (
            <Button
              type="button"
              variant={showClearFilter ? "outline" : "primary"}
              fullWidth={!compact}
              className={cn(!compact && "sm:w-auto")}
              onClick={onPrimaryAction}
            >
              {primaryLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
