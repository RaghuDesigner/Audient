"use client";

import * as React from "react";

import {
  PlanComparisonCellValue,
  PlanComparisonTableLoading,
} from "@/components/billing/PlanComparisonTableCells";
import { PlanComparisonColumnCta } from "@/components/billing/PlanComparisonColumnCta";
import { Caption } from "@/components/ui/typography";
import {
  PLAN_COMPARISON_COLUMN_META,
  PLAN_COMPARISON_FEATURES,
  type PlanComparisonCurrentPlan,
  type PlanComparisonFeatureRow,
  type PlanComparisonHighlight,
} from "@/config/plan-comparison";
import {
  PLAN_COMPARISON_TABLE_COPY,
  type PlanComparisonTableBillingInterval,
  type PlanComparisonTableState,
  type PlanComparisonTableVariant,
} from "@/config/plan-comparison-table";
import { planComparisonTableAnalytics } from "@/lib/analytics/plan-comparison-table-events";
import {
  filterPlanComparisonTableRows,
  isPlanComparisonTableCurrent,
  planComparisonTableCaption,
  planComparisonTableColumns,
  planComparisonTablePriceLabel,
  resolveRecommendedPlan,
  shouldShowPlanComparisonUpgradeCta,
} from "@/utils/plan-comparison-table";
import { cn } from "@/utils/cn";

export type PlanComparisonTableProps = {
  currentPlan?: PlanComparisonCurrentPlan;
  /** Preferred — COMPONENT-035. */
  recommendedPlan?: PlanComparisonHighlight;
  /** @deprecated Prefer `recommendedPlan`. */
  highlightTier?: PlanComparisonHighlight;
  billingInterval?: PlanComparisonTableBillingInterval;
  state?: PlanComparisonTableState;
  rows?: PlanComparisonFeatureRow[];
  showFutureRows?: boolean;
  variant?: PlanComparisonTableVariant;
  onUpgrade?: (plan: "pro" | "business") => void;
  showCtas?: boolean;
  className?: string;
};

/**
 * COMPONENT-035 — Plan Comparison Table.
 * Feature matrix with Current / Recommended badges and Upgrade CTAs.
 * `variant="modal"` keeps Guest column for COMPONENT-013.
 */
export function PlanComparisonTable({
  currentPlan = null,
  recommendedPlan,
  highlightTier,
  billingInterval = "monthly",
  state = "ready",
  rows,
  showFutureRows = true,
  variant = "page",
  onUpgrade,
  showCtas = true,
  className,
}: PlanComparisonTableProps) {
  const columns = planComparisonTableColumns(variant);
  const featureRows =
    rows ?? filterPlanComparisonTableRows(PLAN_COMPARISON_FEATURES, showFutureRows);
  const recommended = resolveRecommendedPlan(
    recommendedPlan !== undefined ? recommendedPlan : highlightTier,
  );
  const impressed = React.useRef(false);

  React.useEffect(() => {
    if (state === "loading" || impressed.current) return;
    impressed.current = true;
    planComparisonTableAnalytics.compared({
      currentPlan,
      recommendedPlan: recommended,
      variant,
      billingInterval,
    });
  }, [billingInterval, currentPlan, recommended, state, variant]);

  if (state === "loading") {
    return (
      <PlanComparisonTableLoading variant={variant} className={className} />
    );
  }

  const showUpgradeRow =
    showCtas &&
    Boolean(onUpgrade) &&
    columns.some(
      (id) =>
        shouldShowPlanComparisonUpgradeCta({ columnId: id, currentPlan }) ||
        isPlanComparisonTableCurrent(id, currentPlan),
    );

  return (
    <div
      className={cn(
        "overflow-x-auto overscroll-x-contain rounded-md border border-border",
        className,
      )}
    >
      <table className="w-full min-w-[36rem] border-collapse text-left">
        <caption className="sr-only">
          {planComparisonTableCaption(variant)}
        </caption>
        <thead>
          <tr className="border-b border-border bg-surface">
            <th
              scope="col"
              className={cn(
                "sticky left-0 z-raised bg-surface px-md py-md",
                "text-info font-semibold text-muted-foreground sm:text-body-sm",
              )}
            >
              {PLAN_COMPARISON_TABLE_COPY.featureColumn}
            </th>
            {columns.map((columnId) => {
              const column = PLAN_COMPARISON_COLUMN_META[columnId];
              const price = planComparisonTablePriceLabel(
                columnId,
                billingInterval,
              );
              const isCurrent = isPlanComparisonTableCurrent(
                columnId,
                currentPlan,
              );
              const isRecommended = recommended === columnId;
              return (
                <th
                  key={columnId}
                  scope="col"
                  className={cn(
                    "min-w-[8.5rem] px-md py-md align-bottom",
                    isRecommended && "bg-secondary/5",
                    isCurrent && "ring-1 ring-inset ring-primary/30",
                  )}
                >
                  <div className="flex flex-col gap-sm">
                    <div className="flex flex-wrap items-center gap-sm">
                      <span className="text-body-sm font-bold text-foreground">
                        {column.label}
                      </span>
                      {isRecommended ? (
                        <Caption className="font-semibold text-secondary">
                          {PLAN_COMPARISON_TABLE_COPY.recommended}
                        </Caption>
                      ) : null}
                      {isCurrent ? (
                        <Caption className="font-semibold text-primary">
                          {PLAN_COMPARISON_TABLE_COPY.currentPlan}
                        </Caption>
                      ) : null}
                    </div>
                    <p className="text-body-sm font-semibold text-primary">
                      {price.priceLabel}
                      {price.priceSuffix ? (
                        <span className="text-info font-regular text-muted-foreground">
                          {" "}
                          {price.priceSuffix}
                        </span>
                      ) : null}
                    </p>
                    <Caption>{price.meta}</Caption>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {featureRows.map((row) => (
            <tr key={row.id} className="border-b border-border last:border-b-0">
              <th
                scope="row"
                className={cn(
                  "sticky left-0 z-raised bg-background px-md py-md",
                  "text-info font-semibold text-foreground sm:text-body-sm",
                )}
              >
                {row.label}
              </th>
              {columns.map((columnId) => (
                <td
                  key={columnId}
                  className={cn(
                    "px-md py-md text-info text-muted-foreground sm:text-body-sm",
                    recommended === columnId && "bg-secondary/5",
                  )}
                >
                  <PlanComparisonCellValue
                    cell={row.cells[columnId]}
                    columnId={columnId}
                  />
                </td>
              ))}
            </tr>
          ))}
          {showUpgradeRow ? (
            <tr>
              <th
                scope="row"
                className={cn(
                  "sticky left-0 z-raised bg-background px-md py-md",
                  "text-info font-semibold text-foreground sm:text-body-sm",
                )}
              >
                <span className="sr-only">Plan actions</span>
              </th>
              {columns.map((columnId) => (
                <td
                  key={columnId}
                  className={cn(
                    "px-md py-md",
                    recommended === columnId && "bg-secondary/5",
                  )}
                >
                  <PlanComparisonColumnCta
                    columnId={columnId}
                    currentPlan={currentPlan}
                    onUpgrade={onUpgrade}
                    variant={variant}
                  />
                </td>
              ))}
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
