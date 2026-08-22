/**
 * COMPONENT-035 — Plan Comparison Table constants.
 * Page matrix: Feature · Free · Pro · Business (no Guest).
 * Shares cell data with COMPONENT-013 via `plan-comparison.ts` — no UI.
 */

export const PLAN_COMPARISON_TABLE_VARIANTS = [
  "page",
  "modal",
  "marketing",
] as const;

export type PlanComparisonTableVariant =
  (typeof PLAN_COMPARISON_TABLE_VARIANTS)[number];

/** Manage Membership / page columns — Guest excluded (COMPONENT-035). */
export const PLAN_COMPARISON_TABLE_PAGE_COLUMNS = [
  "free",
  "pro",
  "business",
] as const;

export type PlanComparisonTablePageColumn =
  (typeof PLAN_COMPARISON_TABLE_PAGE_COLUMNS)[number];

export const PLAN_COMPARISON_TABLE_PLANS = [
  "free",
  "pro",
  "business",
] as const;

export type PlanComparisonTablePlan =
  (typeof PLAN_COMPARISON_TABLE_PLANS)[number];

export const PLAN_COMPARISON_TABLE_STATES = ["loading", "ready"] as const;

export type PlanComparisonTableState =
  (typeof PLAN_COMPARISON_TABLE_STATES)[number];

export const PLAN_COMPARISON_TABLE_BILLING_INTERVALS = [
  "monthly",
  "yearly",
] as const;

export type PlanComparisonTableBillingInterval =
  (typeof PLAN_COMPARISON_TABLE_BILLING_INTERVALS)[number];

/** Default recommended column — Business (`plans.ts` recommended). */
export const PLAN_COMPARISON_TABLE_DEFAULT_RECOMMENDED: Exclude<
  PlanComparisonTablePlan,
  "free"
> = "business";

/** Feature row ids treated as Future / Coming soon when `showFutureRows`. */
export const PLAN_COMPARISON_TABLE_FUTURE_ROW_IDS = [
  "team",
  "api",
  "white_label",
  "compare_reports",
  "shared_reports",
] as const;

export const PLAN_COMPARISON_TABLE_COPY = {
  featureColumn: "Feature",
  captionPage: "Compare Free, Pro, and Business plans",
  captionModal: "Compare Guest, Free, Pro, and Business plans",
  currentPlan: "Current plan",
  recommended: "Recommended",
  upgradeToPro: "Upgrade to Pro",
  upgradeToBusiness: "Upgrade to Business",
  currentPlanCta: "Current plan",
  comingSoon: "Coming soon",
  contactSales: "Contact sales",
  loadingLabel: "Loading plan comparison",
} as const;

export const PLAN_COMPARISON_TABLE_ANALYTICS_SOURCES = {
  page: "plan_comparison_table_page",
  modal: "plan_comparison_table_modal",
  marketing: "plan_comparison_table_marketing",
} as const;
