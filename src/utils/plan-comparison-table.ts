/**
 * COMPONENT-035 — Plan Comparison Table helpers.
 * Column sets, CTA visibility, future-row filter — shares matrix with COMPONENT-013.
 * No React / no Stripe.
 */

import {
  PLAN_COMPARISON_COLUMN_META,
  PLAN_COMPARISON_COLUMNS,
  PLAN_COMPARISON_FEATURES,
  type PlanComparisonColumnId,
  type PlanComparisonCurrentPlan,
  type PlanComparisonFeatureRow,
  type PlanComparisonHighlight,
} from "@/config/plan-comparison";
import {
  PLAN_COMPARISON_TABLE_COPY,
  PLAN_COMPARISON_TABLE_DEFAULT_RECOMMENDED,
  PLAN_COMPARISON_TABLE_FUTURE_ROW_IDS,
  PLAN_COMPARISON_TABLE_PAGE_COLUMNS,
  type PlanComparisonTableBillingInterval,
  type PlanComparisonTablePlan,
  type PlanComparisonTableVariant,
} from "@/config/plan-comparison-table";

const FUTURE_ROW_ID_SET = new Set<string>(PLAN_COMPARISON_TABLE_FUTURE_ROW_IDS);

export function planComparisonTableColumns(
  variant: PlanComparisonTableVariant = "page",
): readonly PlanComparisonColumnId[] {
  if (variant === "modal") return PLAN_COMPARISON_COLUMNS;
  return PLAN_COMPARISON_TABLE_PAGE_COLUMNS;
}

export function planComparisonTableCaption(
  variant: PlanComparisonTableVariant = "page",
): string {
  return variant === "modal"
    ? PLAN_COMPARISON_TABLE_COPY.captionModal
    : PLAN_COMPARISON_TABLE_COPY.captionPage;
}

export function resolveRecommendedPlan(
  recommendedPlan?: PlanComparisonHighlight | PlanComparisonTablePlan | null,
): PlanComparisonHighlight {
  if (recommendedPlan === "pro" || recommendedPlan === "business") {
    return recommendedPlan;
  }
  if (recommendedPlan === null) return null;
  return PLAN_COMPARISON_TABLE_DEFAULT_RECOMMENDED;
}

export function isPlanComparisonTableCurrent(
  columnId: PlanComparisonColumnId,
  currentPlan?: PlanComparisonCurrentPlan | PlanComparisonTablePlan | null,
): boolean {
  if (currentPlan == null) return false;
  return currentPlan === columnId;
}

export function isPlanComparisonTableRecommended(
  columnId: PlanComparisonColumnId,
  recommended: PlanComparisonHighlight,
): boolean {
  if (recommended == null) return false;
  if (columnId === recommended) return true;
  // Fallback: Business meta.recommended when highlight not forced off.
  return (
    recommended === PLAN_COMPARISON_TABLE_DEFAULT_RECOMMENDED &&
    Boolean(PLAN_COMPARISON_COLUMN_META[columnId].recommended)
  );
}

/** Paid columns that can show an Upgrade CTA (not Free / Guest). */
export function planComparisonUpgradeableColumns(
  columns: readonly PlanComparisonColumnId[],
): PlanComparisonColumnId[] {
  return columns.filter((id) => id === "pro" || id === "business");
}

export function shouldShowPlanComparisonUpgradeCta(input: {
  columnId: PlanComparisonColumnId;
  currentPlan?: PlanComparisonCurrentPlan | PlanComparisonTablePlan | null;
}): boolean {
  if (input.columnId !== "pro" && input.columnId !== "business") return false;
  if (input.currentPlan == null) return true;
  if (input.currentPlan === input.columnId) return false;
  // Already on Business — no upgrade under Pro either for this table.
  if (input.currentPlan === "business") return false;
  // On Pro — only Business upgrade.
  if (input.currentPlan === "pro") return input.columnId === "business";
  return true;
}

export function planComparisonUpgradeLabel(
  columnId: PlanComparisonColumnId,
): string {
  if (columnId === "pro") return PLAN_COMPARISON_TABLE_COPY.upgradeToPro;
  if (columnId === "business") return PLAN_COMPARISON_TABLE_COPY.upgradeToBusiness;
  return PLAN_COMPARISON_TABLE_COPY.currentPlanCta;
}

export function planComparisonCtaLabel(input: {
  columnId: PlanComparisonColumnId;
  currentPlan?: PlanComparisonCurrentPlan | PlanComparisonTablePlan | null;
}): string {
  if (isPlanComparisonTableCurrent(input.columnId, input.currentPlan)) {
    return PLAN_COMPARISON_TABLE_COPY.currentPlanCta;
  }
  return planComparisonUpgradeLabel(input.columnId);
}

export function filterPlanComparisonTableRows(
  rows: PlanComparisonFeatureRow[] = PLAN_COMPARISON_FEATURES,
  showFutureRows = true,
): PlanComparisonFeatureRow[] {
  if (showFutureRows) return rows;
  return rows.filter((row) => !FUTURE_ROW_ID_SET.has(row.id));
}

/**
 * Yearly display placeholder — PRICING.md has monthly only.
 * Keep monthly labels until yearly is product-confirmed.
 */
export function planComparisonTablePriceLabel(
  columnId: PlanComparisonColumnId,
  billingInterval: PlanComparisonTableBillingInterval = "monthly",
): { priceLabel: string; priceSuffix: string; meta: string } {
  const column = PLAN_COMPARISON_COLUMN_META[columnId];
  void billingInterval;
  return {
    priceLabel: column.priceLabel,
    priceSuffix: column.priceSuffix,
    meta: column.meta,
  };
}

export function toPlanComparisonTablePlan(
  plan?: PlanComparisonCurrentPlan | PlanComparisonTablePlan | null,
): PlanComparisonTablePlan | null {
  if (plan === "free" || plan === "pro" || plan === "business") return plan;
  return null;
}
