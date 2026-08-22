"use client";

import * as React from "react";
import {
  BellOff,
  Coins,
  FileSearch,
  History,
  Inbox,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { BodySmall } from "@/components/ui/typography";
import {
  EMPTY_STATE_DEFAULTS,
  type EmptyStateSize,
  type EmptyStateTier,
  type EmptyStateVariant,
} from "@/config/empty-state";
import { emptyStateAnalytics } from "@/lib/analytics/empty-state-events";
import { cn } from "@/utils/cn";

export type EmptyStateProps = {
  variant: EmptyStateVariant;
  headline?: string;
  description?: string;
  /** Override default illustration (decorative). */
  illustration?: React.ReactNode;
  primaryLabel?: string | null;
  secondaryLabel?: string | null;
  onPrimary?: () => void;
  onSecondary?: () => void;
  size?: EmptyStateSize;
  tier?: EmptyStateTier;
  headingLevel?: "h2" | "h3" | "h4";
  className?: string;
};

const VARIANT_ICONS: Record<
  Exclude<EmptyStateVariant, "custom">,
  LucideIcon
> = {
  no_audits: Inbox,
  no_reports: FileSearch,
  no_notifications: BellOff,
  no_history: History,
  no_credits: Coins,
};

/**
 * COMPONENT-020 — Empty State.
 * Illustration · headline · description · primary/secondary CTAs.
 */
export function EmptyState({
  variant,
  headline: headlineProp,
  description: descriptionProp,
  illustration,
  primaryLabel: primaryLabelProp,
  secondaryLabel: secondaryLabelProp,
  onPrimary,
  onSecondary,
  size = "section",
  tier = "free",
  headingLevel = "h3",
  className,
}: EmptyStateProps) {
  const impressed = React.useRef(false);
  const defaults =
    variant === "custom" ? null : EMPTY_STATE_DEFAULTS[variant];

  const headline = headlineProp ?? defaults?.headline ?? "Nothing here yet.";
  const description =
    descriptionProp ??
    defaults?.description ??
    "When there’s content to show, it will appear in this space.";
  const primaryLabel =
    primaryLabelProp === undefined
      ? (defaults?.primaryLabel ?? null)
      : primaryLabelProp;
  const secondaryLabel =
    secondaryLabelProp === undefined
      ? (defaults?.secondaryLabel ?? null)
      : secondaryLabelProp;

  React.useEffect(() => {
    if (impressed.current) return;
    impressed.current = true;
    emptyStateAnalytics.impressed({ variant, tier });
  }, [variant, tier]);

  const HeadingTag = headingLevel;
  const Icon =
    variant === "custom" ? Inbox : VARIANT_ICONS[variant];

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center text-center",
        size === "page"
          ? "mx-auto max-w-md gap-md px-md py-xl sm:py-2xl"
          : "gap-md rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg",
        className,
      )}
      role="status"
      aria-label={headline}
    >
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-md bg-muted text-muted-foreground",
          size === "page" ? "size-16 sm:size-20" : "size-14",
        )}
        aria-hidden
      >
        {illustration ?? (
          <Icon className={size === "page" ? "size-8" : "size-7"} />
        )}
      </div>

      <div className="flex max-w-md flex-col gap-sm">
        <HeadingTag
          className={cn(
            "font-bold text-foreground",
            size === "page"
              ? "text-body sm:text-body-lg"
              : "text-body-sm sm:text-body",
          )}
        >
          {headline}
        </HeadingTag>
        <BodySmall className="text-muted-foreground">{description}</BodySmall>
      </div>

      {(primaryLabel && onPrimary) || (secondaryLabel && onSecondary) ? (
        <div className="flex w-full flex-col gap-sm sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center">
          {primaryLabel && onPrimary ? (
            <Button
              type="button"
              variant="primary"
              fullWidth
              className="text-primary-foreground sm:w-auto"
              onClick={() => {
                emptyStateAnalytics.primaryClicked({ variant, tier });
                onPrimary();
              }}
            >
              {primaryLabel}
            </Button>
          ) : null}
          {secondaryLabel && onSecondary ? (
            <Button
              type="button"
              variant="outline"
              fullWidth
              className="sm:w-auto"
              onClick={() => {
                emptyStateAnalytics.secondaryClicked({ variant, tier });
                onSecondary();
              }}
            >
              {secondaryLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
