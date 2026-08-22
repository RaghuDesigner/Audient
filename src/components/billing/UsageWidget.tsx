"use client";

import * as React from "react";

import { UsageWidgetMetrics } from "@/components/billing/UsageWidgetMetrics";
import {
  UsageWidgetError,
  UsageWidgetLoading,
  usageWidgetChrome,
} from "@/components/billing/UsageWidgetStates";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  USAGE_WIDGET_COPY,
  type UsageWidgetState,
  type UsageWidgetTier,
  type UsageWidgetVariant,
} from "@/config/usage-widget";
import { usageWidgetAnalytics } from "@/lib/analytics/usage-widget-events";
import {
  USAGE_NEAR_LIMIT_RATIO,
  deriveUsageWidgetState,
  formatUsageBillingCycleLabel,
  formatUsageNumber,
  shouldShowUsageBuyCredits,
  shouldShowUsageUpgrade,
  usageCreditsProgress,
  usageStorageProgress,
  usageWidgetMonthlyGrant,
  usageWidgetStateLabel,
  usageWidgetSummary,
} from "@/utils/usage-widget";
import { cn } from "@/utils/cn";

export type UsageWidgetProps = {
  state?: UsageWidgetState;
  tier?: UsageWidgetTier;
  creditsUsed?: number | null;
  creditsRemaining?: number | null;
  monthlyGrant?: number | null;
  reportsGenerated?: number | null;
  storageUsed?: string | number | null;
  storageLimit?: string | number | null;
  apiCallsUsed?: number | null;
  billingCycleLabel?: string | null;
  renewalDate?: string | Date | null;
  showApiCallsPlaceholder?: boolean;
  showBuyCredits?: boolean;
  showUpgrade?: boolean;
  variant?: UsageWidgetVariant;
  onRetry?: () => void;
  onBuyCredits?: () => void;
  onUpgrade?: () => void;
  className?: string;
  /** Optional DOM id for the outer section (e.g. screen deep-link). */
  id?: string;
};

/**
 * COMPONENT-034 — Usage Widget.
 * Period usage: credits · reports · storage · progress — mock only.
 */
export function UsageWidget({
  state: stateProp,
  tier = "free",
  creditsUsed = null,
  creditsRemaining = null,
  monthlyGrant = null,
  reportsGenerated = null,
  storageUsed = null,
  storageLimit = null,
  apiCallsUsed = null,
  billingCycleLabel = null,
  renewalDate = null,
  showApiCallsPlaceholder = false,
  showBuyCredits,
  showUpgrade,
  variant = "default",
  onRetry,
  onBuyCredits,
  onUpgrade,
  className,
  id,
}: UsageWidgetProps) {
  const grant = monthlyGrant ?? usageWidgetMonthlyGrant(tier);
  const remaining = creditsRemaining ?? 0;
  const used =
    creditsUsed != null ? creditsUsed : Math.max(0, grant - remaining);

  const derived =
    stateProp === "loading" || stateProp === "error"
      ? stateProp
      : (stateProp ??
        deriveUsageWidgetState({
          creditsRemaining: remaining,
          monthlyGrant: grant,
          tier,
        }));

  const viewed = React.useRef(false);
  const lowTracked = React.useRef(false);
  const titleId = React.useId();

  React.useEffect(() => {
    if (derived === "loading" || derived === "error" || viewed.current) return;
    viewed.current = true;
    usageWidgetAnalytics.viewed({
      tier,
      state: derived,
      creditsRemaining: remaining,
      variant,
    });
  }, [derived, remaining, tier, variant]);

  React.useEffect(() => {
    if (derived !== "near_limit" && derived !== "limit_reached") return;
    if (lowTracked.current) return;
    lowTracked.current = true;
    usageWidgetAnalytics.creditsLow({
      tier,
      creditsRemaining: remaining,
      threshold: `${USAGE_NEAR_LIMIT_RATIO}`,
      state: derived,
    });
  }, [derived, remaining, tier]);

  if (derived === "loading") {
    return <UsageWidgetLoading className={className} />;
  }

  if (derived === "error") {
    return (
      <UsageWidgetError tier={tier} onRetry={onRetry} className={className} />
    );
  }

  const progress = usageCreditsProgress(used, grant);
  const storage = usageStorageProgress(storageUsed, storageLimit);
  const cycleLabel = formatUsageBillingCycleLabel({
    billingCycleLabel,
    renewalDate,
  });
  const statusLabel = usageWidgetStateLabel(derived);
  const showBuy = shouldShowUsageBuyCredits({
    tier,
    state: derived,
    showBuyCredits,
  });
  const showUpgradeCta = shouldShowUsageUpgrade({
    tier,
    state: derived,
    showUpgrade,
  });
  const isWarning = derived === "near_limit";
  const isExhausted = derived === "limit_reached";
  const summary = usageWidgetSummary({
    creditsRemaining: remaining,
    monthlyGrant: grant,
    creditsUsed: used,
    reportsGenerated,
    state: derived,
  });

  return (
    <section
      id={id}
      className={cn(
        usageWidgetChrome,
        isWarning && "border-warning/50",
        isExhausted && "border-error/40",
        className,
      )}
      aria-labelledby={titleId}
      aria-label={summary}
    >
      <div className="flex flex-wrap items-start justify-between gap-sm">
        <h2
          id={titleId}
          className="text-body-sm font-bold text-foreground sm:text-body"
        >
          {USAGE_WIDGET_COPY.title}
        </h2>
        {isWarning || isExhausted ? (
          <Badge
            variant={isExhausted ? "error" : "warning"}
            size="sm"
            shape="rounded"
          >
            {statusLabel}
          </Badge>
        ) : null}
      </div>

      {cycleLabel ? (
        <Caption className="mt-sm text-muted-foreground">{cycleLabel}</Caption>
      ) : null}

      <div className="mt-md">
        <div className="flex flex-wrap items-baseline justify-between gap-sm">
          <BodySmall className="font-semibold text-foreground">
            {formatUsageNumber(remaining)}{" "}
            <span className="font-regular text-muted-foreground">
              {USAGE_WIDGET_COPY.creditsRemaining.toLowerCase()}
            </span>
          </BodySmall>
          <Caption className="tabular-nums text-muted-foreground">
            {formatUsageNumber(used)} / {formatUsageNumber(grant)}{" "}
            {USAGE_WIDGET_COPY.ofGrant}
          </Caption>
        </div>
        <Progress
          className="mt-sm"
          value={progress.value}
          max={progress.max}
          label={USAGE_WIDGET_COPY.progressCredits}
          indicatorClassName={
            isExhausted ? "bg-error" : isWarning ? "bg-warning" : undefined
          }
        />
      </div>

      <UsageWidgetMetrics
        tier={tier}
        used={used}
        grant={grant}
        reportsGenerated={reportsGenerated}
        storage={storage}
        showApiCallsPlaceholder={showApiCallsPlaceholder}
        apiCallsUsed={apiCallsUsed}
        compact={variant === "compact"}
        showBuy={showBuy}
        showUpgradeCta={showUpgradeCta}
        isWarning={isWarning}
        isExhausted={isExhausted}
        onBuyCredits={onBuyCredits}
        onUpgrade={onUpgrade}
      />
    </section>
  );
}
