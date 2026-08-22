"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, Caption } from "@/components/ui/typography";
import { creditsWidgetAnalytics } from "@/lib/analytics/credits-widget-events";
import {
  creditsUsageForProgress,
  defaultCreditsCtaLabel,
  deriveCreditsWidgetState,
  formatCreditsRenewal,
  shouldShowCreditsCta,
  type CreditsWidgetState,
  type CreditsWidgetTier,
} from "@/utils/credits-widget";
import { cn } from "@/utils/cn";

export type CreditsWidgetProps = {
  state?: CreditsWidgetState;
  remaining?: number | null;
  monthlyCredits?: number | null;
  used?: number | null;
  renewalDate?: string | Date | null;
  tier: CreditsWidgetTier;
  ctaLabel?: string;
  showCta?: boolean;
  onUpgrade?: () => void;
  onViewDetails?: () => void;
  className?: string;
};

/**
 * COMPONENT-017 — Credits Widget.
 * Remaining · monthly grant · used · progress · renewal · Upgrade / Buy CTA.
 */
export function CreditsWidget({
  state: stateProp,
  remaining = null,
  monthlyCredits = null,
  used = null,
  renewalDate = null,
  tier,
  ctaLabel,
  showCta,
  onUpgrade,
  onViewDetails,
  className,
}: CreditsWidgetProps) {
  const impressed = React.useRef(false);

  const resolvedRemaining = remaining ?? 0;
  const resolvedMonthly = monthlyCredits ?? 0;
  const resolvedUsed =
    used != null
      ? used
      : resolvedMonthly > 0
        ? Math.max(0, resolvedMonthly - resolvedRemaining)
        : 0;

  const derived =
    stateProp && stateProp !== "loading"
      ? stateProp
      : deriveCreditsWidgetState({
          remaining: resolvedRemaining,
          monthlyCredits: resolvedMonthly,
          tier,
        });

  const state: CreditsWidgetState =
    stateProp === "loading" ? "loading" : derived;

  React.useEffect(() => {
    if (state === "loading" || impressed.current) return;
    impressed.current = true;
    creditsWidgetAnalytics.viewed({
      tier,
      remaining: resolvedRemaining,
      state,
    });
  }, [state, tier, resolvedRemaining]);

  if (state === "loading") {
    return (
      <section
        className={cn(cardChrome, className)}
        aria-busy="true"
        aria-label="Loading credits"
      >
        <Skeleton className="h-5 w-28" />
        <Skeleton className="mt-sm h-8 w-24" />
        <Skeleton className="mt-md h-2 w-full rounded-full" />
        <Skeleton className="mt-md h-4 w-40" />
        <Skeleton className="mt-md h-11 w-32" />
      </section>
    );
  }

  const { value: progressValue, max: progressMax } = creditsUsageForProgress(
    resolvedUsed,
    resolvedMonthly,
  );
  const renewalLabel = formatCreditsRenewal(renewalDate);
  const showUpgrade = shouldShowCreditsCta({ tier, state, showCta });
  const buttonLabel = ctaLabel ?? defaultCreditsCtaLabel(tier);
  const isWarning = state === "warning";
  const isExhausted = state === "exhausted";

  const summary = [
    `${resolvedRemaining.toLocaleString()} of ${resolvedMonthly.toLocaleString()} monthly credits remaining`,
    `${resolvedUsed.toLocaleString()} used`,
    renewalLabel ? `renews ${renewalLabel}` : null,
    isExhausted ? "Credits exhausted" : isWarning ? "Credits running low" : null,
  ]
    .filter(Boolean)
    .join("; ");

  return (
    <section
      className={cn(
        cardChrome,
        isWarning && "border-warning/50",
        isExhausted && "border-error/50",
        className,
      )}
      aria-label={summary}
    >
      <div className="flex flex-wrap items-start justify-between gap-sm">
        <Caption className="font-semibold uppercase tracking-wide text-muted-foreground">
          Credits
        </Caption>
        {isWarning || isExhausted ? (
          <span
            className={cn(
              "inline-flex items-center gap-sm rounded-md px-sm py-sm",
              "text-info font-semibold",
              isExhausted
                ? "bg-error/15 text-error"
                : "bg-warning/25 text-foreground",
            )}
            role={isExhausted ? "alert" : "status"}
          >
            <AlertTriangle className="size-4 shrink-0" aria-hidden />
            {isExhausted ? "Credits exhausted" : "Running low"}
          </span>
        ) : null}
      </div>

      <p className="mt-sm text-body font-bold tabular-nums text-primary sm:text-body-lg">
        {resolvedRemaining.toLocaleString()}
        <span className="text-info font-regular text-muted-foreground">
          {" "}
          / {resolvedMonthly.toLocaleString()}
        </span>
      </p>
      <BodySmall className="mt-sm text-muted-foreground">
        {resolvedUsed.toLocaleString()} used this period
        {resolvedRemaining > resolvedMonthly
          ? " · Includes purchased top-ups"
          : null}
      </BodySmall>

      <Progress
        className="mt-md"
        value={progressValue}
        max={progressMax}
        size="md"
        label={`Credits used ${progressValue.toLocaleString()} of ${resolvedMonthly.toLocaleString()}`}
        indicatorClassName={
          isExhausted
            ? "bg-error"
            : isWarning
              ? "bg-warning"
              : undefined
        }
      />

      {renewalLabel ? (
        <Caption className="mt-md text-muted-foreground">
          Renews {renewalLabel}
        </Caption>
      ) : null}

      <div className="mt-md flex flex-col gap-sm sm:flex-row sm:flex-wrap">
        {showUpgrade ? (
          <Button
            type="button"
            variant={isExhausted || isWarning ? "primary" : "outline"}
            className={
              isExhausted || isWarning
                ? "text-primary-foreground"
                : undefined
            }
            onClick={() => {
              creditsWidgetAnalytics.upgradeClicked({ tier, state });
              onUpgrade?.();
            }}
          >
            {buttonLabel}
          </Button>
        ) : null}
        {onViewDetails ? (
          <Button type="button" variant="ghost" onClick={onViewDetails}>
            View details
          </Button>
        ) : null}
      </div>
    </section>
  );
}

const cardChrome =
  "w-full rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg";
