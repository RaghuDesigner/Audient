"use client";

import * as React from "react";
import Link from "next/link";

import { ErrorActions } from "@/components/common/ErrorActions";
import { ErrorIllustration } from "@/components/common/ErrorIllustration";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  MAINTENANCE_STATE_ACTIONS,
  resolveMaintenanceStateContent,
  type MaintenanceStateSize,
} from "@/config/maintenance-state";
import { cn } from "@/utils/cn";

export type MaintenanceStateProps = {
  heading?: string;
  description?: string;
  /** Public ETA copy only — omit when unknown. */
  expectedAvailability?: string | null;
  statusActionLabel?: string | null;
  statusActionHref?: string | null;
  onStatusAction?: () => void;
  primaryLabel?: string;
  secondaryLabel?: string;
  onRetry?: () => void;
  onBackToDashboard?: () => void;
  loading?: boolean;
  disabled?: boolean;
  size?: MaintenanceStateSize;
  className?: string;
};

/**
 * COMPONENT-076 — Maintenance State.
 * Illustration · heading · description · optional availability · Retry / Dashboard.
 */
export function MaintenanceState({
  heading: headingProp,
  description: descriptionProp,
  expectedAvailability: expectedAvailabilityProp,
  statusActionLabel = null,
  statusActionHref = null,
  onStatusAction,
  primaryLabel: primaryLabelProp,
  secondaryLabel: secondaryLabelProp,
  onRetry,
  onBackToDashboard,
  loading = false,
  disabled = false,
  size = "page",
  className,
}: MaintenanceStateProps) {
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const content = resolveMaintenanceStateContent({
    heading: headingProp,
    description: descriptionProp,
    expectedAvailability: expectedAvailabilityProp,
    primaryLabel: primaryLabelProp,
    secondaryLabel: secondaryLabelProp,
  });

  const HeadingTag = size === "page" ? "h1" : "h2";

  React.useEffect(() => {
    if (size === "page") {
      headingRef.current?.focus();
    }
  }, [size, content.heading]);

  const showStatusAction =
    Boolean(statusActionLabel) &&
    Boolean(onStatusAction || statusActionHref);

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center text-center",
        size === "page"
          ? "mx-auto max-w-md gap-md px-md py-xl sm:py-2xl"
          : "gap-md rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg",
        className,
      )}
      role="alert"
      aria-live="polite"
    >
      <ErrorIllustration type="maintenance" size={size} decorative />

      <div className="flex max-w-md flex-col gap-sm">
        <HeadingTag
          ref={headingRef}
          tabIndex={size === "page" ? -1 : undefined}
          className={cn(
            "font-bold text-foreground outline-none",
            size === "page"
              ? "text-body sm:text-body-lg"
              : "text-body-sm sm:text-body",
          )}
        >
          {content.heading}
        </HeadingTag>
        <BodySmall className="text-muted-foreground">
          {content.description}
        </BodySmall>
        {content.expectedAvailability ? (
          <Caption className="text-muted-foreground">
            {content.expectedAvailability}
          </Caption>
        ) : null}
      </div>

      {showStatusAction ? (
        statusActionHref ? (
          <Link
            href={statusActionHref}
            className={cn(
              "min-h-11 inline-flex items-center justify-center text-body-sm font-semibold",
              "text-primary underline-offset-4 hover:underline",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            {statusActionLabel}
          </Link>
        ) : (
          <button
            type="button"
            className={cn(
              "min-h-11 text-body-sm font-semibold text-primary underline-offset-4",
              "hover:underline",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
            onClick={onStatusAction}
          >
            {statusActionLabel}
          </button>
        )
      ) : null}

      <ErrorActions
        primaryAction={MAINTENANCE_STATE_ACTIONS.primary}
        secondaryAction={MAINTENANCE_STATE_ACTIONS.secondary}
        primaryLabel={content.primaryLabel}
        secondaryLabel={content.secondaryLabel}
        onPrimary={onRetry ? () => onRetry() : undefined}
        onSecondary={onBackToDashboard ? () => onBackToDashboard() : undefined}
        loading={loading}
        disabled={disabled}
      />
    </div>
  );
}
