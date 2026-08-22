/**
 * Phase-1 mock Plan Comparison Table — COMPONENT-035.
 * Current / recommended / loading fixtures for QA; no Stripe / no API.
 */

import type { PlanComparisonFeatureRow } from "@/config/plan-comparison";
import type {
  PlanComparisonTableBillingInterval,
  PlanComparisonTablePlan,
  PlanComparisonTableState,
  PlanComparisonTableVariant,
} from "@/config/plan-comparison-table";
import { PLAN_COMPARISON_TABLE_DEFAULT_RECOMMENDED } from "@/config/plan-comparison-table";
import { filterPlanComparisonTableRows } from "@/utils/plan-comparison-table";

export type MockPlanComparisonTable = {
  state: PlanComparisonTableState;
  variant: PlanComparisonTableVariant;
  currentPlan: PlanComparisonTablePlan | null;
  recommendedPlan: "pro" | "business" | null;
  billingInterval: PlanComparisonTableBillingInterval;
  showFutureRows: boolean;
  rows: PlanComparisonFeatureRow[];
};

export const MOCK_PLAN_COMPARISON_TABLE_FREE: MockPlanComparisonTable = {
  state: "ready",
  variant: "page",
  currentPlan: "free",
  recommendedPlan: PLAN_COMPARISON_TABLE_DEFAULT_RECOMMENDED,
  billingInterval: "monthly",
  showFutureRows: true,
  rows: filterPlanComparisonTableRows(undefined, true),
};

export const MOCK_PLAN_COMPARISON_TABLE_PRO: MockPlanComparisonTable = {
  ...MOCK_PLAN_COMPARISON_TABLE_FREE,
  currentPlan: "pro",
};

export const MOCK_PLAN_COMPARISON_TABLE_BUSINESS: MockPlanComparisonTable = {
  ...MOCK_PLAN_COMPARISON_TABLE_FREE,
  currentPlan: "business",
  recommendedPlan: null,
};

export const MOCK_PLAN_COMPARISON_TABLE_LOADING: MockPlanComparisonTable = {
  ...MOCK_PLAN_COMPARISON_TABLE_FREE,
  state: "loading",
};

export const MOCK_PLAN_COMPARISON_TABLE_NO_FUTURE: MockPlanComparisonTable = {
  ...MOCK_PLAN_COMPARISON_TABLE_FREE,
  showFutureRows: false,
  rows: filterPlanComparisonTableRows(undefined, false),
};

/** Modal variant fixture — Guest current (COMPONENT-013). */
export const MOCK_PLAN_COMPARISON_TABLE_MODAL_GUEST = {
  state: "ready" as const,
  variant: "modal" as const,
  currentPlan: "guest" as const,
  recommendedPlan: PLAN_COMPARISON_TABLE_DEFAULT_RECOMMENDED,
  billingInterval: "monthly" as const,
  showFutureRows: true,
  rows: filterPlanComparisonTableRows(undefined, true),
};

export const MOCK_PLAN_COMPARISON_TABLE_BY_PLAN: Record<
  PlanComparisonTablePlan,
  MockPlanComparisonTable
> = {
  free: MOCK_PLAN_COMPARISON_TABLE_FREE,
  pro: MOCK_PLAN_COMPARISON_TABLE_PRO,
  business: MOCK_PLAN_COMPARISON_TABLE_BUSINESS,
};

export function getMockPlanComparisonTable(
  plan: PlanComparisonTablePlan | null = "free",
  overrides?: Partial<MockPlanComparisonTable>,
): MockPlanComparisonTable {
  const base =
    plan == null
      ? { ...MOCK_PLAN_COMPARISON_TABLE_FREE, currentPlan: null }
      : MOCK_PLAN_COMPARISON_TABLE_BY_PLAN[plan];

  const showFutureRows = overrides?.showFutureRows ?? base.showFutureRows;

  return {
    ...base,
    ...overrides,
    rows:
      overrides?.rows ??
      filterPlanComparisonTableRows(undefined, showFutureRows),
  };
}
