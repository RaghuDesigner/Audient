"use client";

import { Button } from "@/components/ui/button";
import type {
  PlanComparisonColumnId,
  PlanComparisonCurrentPlan,
} from "@/config/plan-comparison";
import {
  PLAN_COMPARISON_TABLE_ANALYTICS_SOURCES,
  type PlanComparisonTableVariant,
} from "@/config/plan-comparison-table";
import { planComparisonTableAnalytics } from "@/lib/analytics/plan-comparison-table-events";
import {
  isPlanComparisonTableCurrent,
  planComparisonCtaLabel,
  shouldShowPlanComparisonUpgradeCta,
} from "@/utils/plan-comparison-table";

export type PlanComparisonColumnCtaProps = {
  columnId: PlanComparisonColumnId;
  currentPlan: PlanComparisonCurrentPlan;
  onUpgrade?: (plan: "pro" | "business") => void;
  variant: PlanComparisonTableVariant;
};

/**
 * COMPONENT-035 — per-column Current / Upgrade CTA.
 */
export function PlanComparisonColumnCta({
  columnId,
  currentPlan,
  onUpgrade,
  variant,
}: PlanComparisonColumnCtaProps) {
  const isCurrent = isPlanComparisonTableCurrent(columnId, currentPlan);
  const showUpgrade = shouldShowPlanComparisonUpgradeCta({
    columnId,
    currentPlan,
  });
  const label = planComparisonCtaLabel({ columnId, currentPlan });

  if (isCurrent) {
    return (
      <Button type="button" variant="outline" size="sm" disabled>
        {label}
      </Button>
    );
  }

  if (!showUpgrade || (columnId !== "pro" && columnId !== "business")) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="primary"
      size="sm"
      className="text-primary-foreground"
      onClick={() => {
        const target = columnId as "pro" | "business";
        planComparisonTableAnalytics.upgradeClicked({
          currentPlan,
          targetPlan: target,
          source: PLAN_COMPARISON_TABLE_ANALYTICS_SOURCES[variant],
        });
        onUpgrade?.(target);
      }}
    >
      {label}
    </Button>
  );
}
