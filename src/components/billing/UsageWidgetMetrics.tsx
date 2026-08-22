"use client";

import { UsageWidgetMetric } from "@/components/billing/UsageWidgetStates";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Caption } from "@/components/ui/typography";
import { USAGE_WIDGET_COPY, type UsageWidgetTier } from "@/config/usage-widget";
import { usageWidgetAnalytics } from "@/lib/analytics/usage-widget-events";
import { formatUsageNumber } from "@/utils/usage-widget";
import { cn } from "@/utils/cn";

export type UsageWidgetMetricsProps = {
  tier: UsageWidgetTier;
  used: number;
  grant: number;
  reportsGenerated: number | null;
  storage: { value: number; max: number; label: string } | null;
  showApiCallsPlaceholder: boolean;
  apiCallsUsed: number | null;
  compact: boolean;
  showBuy: boolean;
  showUpgradeCta: boolean;
  isWarning: boolean;
  isExhausted: boolean;
  onBuyCredits?: () => void;
  onUpgrade?: () => void;
};

/**
 * COMPONENT-034 — metrics grid + optional CTAs.
 */
export function UsageWidgetMetrics({
  tier,
  used,
  grant,
  reportsGenerated,
  storage,
  showApiCallsPlaceholder,
  apiCallsUsed,
  compact,
  showBuy,
  showUpgradeCta,
  isWarning,
  isExhausted,
  onBuyCredits,
  onUpgrade,
}: UsageWidgetMetricsProps) {
  return (
    <>
      <div
        className={cn(
          "mt-md grid gap-md",
          compact ? "grid-cols-1" : "sm:grid-cols-2",
        )}
      >
        <UsageWidgetMetric
          label={USAGE_WIDGET_COPY.creditsUsed}
          value={formatUsageNumber(used)}
          hint={`${USAGE_WIDGET_COPY.ofGrant} ${formatUsageNumber(grant)}`}
        />
        {reportsGenerated != null ? (
          <UsageWidgetMetric
            label={USAGE_WIDGET_COPY.reportsGenerated}
            value={formatUsageNumber(reportsGenerated)}
            hint="This billing period"
          />
        ) : null}
        {storage ? (
          <div className="rounded-md border border-border bg-background p-md sm:col-span-2">
            <Caption className="text-muted-foreground">
              {USAGE_WIDGET_COPY.storageUsed}
            </Caption>
            <p className="mt-sm text-h3 font-bold tabular-nums text-foreground">
              {storage.label}
            </p>
            <Progress
              className="mt-md"
              value={storage.value}
              max={storage.max}
              label={USAGE_WIDGET_COPY.progressStorage}
            />
          </div>
        ) : null}
        {showApiCallsPlaceholder && apiCallsUsed == null ? (
          <UsageWidgetMetric
            label={USAGE_WIDGET_COPY.apiCalls}
            value={USAGE_WIDGET_COPY.apiCallsComingSoon}
            hint="Business roadmap"
          />
        ) : null}
      </div>

      {(showBuy || showUpgradeCta) && (onBuyCredits || onUpgrade) ? (
        <div className="mt-md flex flex-col gap-sm sm:flex-row sm:flex-wrap">
          {showUpgradeCta && onUpgrade ? (
            <Button
              type="button"
              variant={isExhausted || isWarning ? "primary" : "outline"}
              size="sm"
              className={
                isExhausted || isWarning
                  ? "w-full text-primary-foreground sm:w-auto"
                  : "w-full sm:w-auto"
              }
              onClick={() => {
                usageWidgetAnalytics.upgradeClicked({ tier });
                onUpgrade();
              }}
            >
              {USAGE_WIDGET_COPY.upgrade}
            </Button>
          ) : null}
          {showBuy && onBuyCredits ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => {
                usageWidgetAnalytics.buyCreditsClicked({ tier });
                onBuyCredits();
              }}
            >
              {USAGE_WIDGET_COPY.buyCredits}
            </Button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
