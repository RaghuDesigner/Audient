/**
 * Phase-1 mock Current Plan Card — COMPONENT-033.
 * Plan / status fixtures for QA; no Stripe / no API.
 */

import type {
  CurrentPlanCardBillingCycle,
  CurrentPlanCardPlan,
  CurrentPlanCardStatus,
  CurrentPlanCardUiState,
} from "@/config/current-plan-card";
import {
  currentPlanCardMonthlyCredits,
  currentPlanCardPlanToAuth,
  currentPlanCardPriceLabel,
} from "@/utils/current-plan-card";
import { MOCK_DEMO_CREDITS_USED } from "@/lib/auth/mock-membership";

function remainingForPlan(plan: CurrentPlanCardPlan): number {
  const authTier = currentPlanCardPlanToAuth(plan);
  return Math.max(
    0,
    currentPlanCardMonthlyCredits(plan) - MOCK_DEMO_CREDITS_USED[authTier],
  );
}

/** Data props for CurrentPlanCard (callbacks omitted). */
export type MockCurrentPlanCard = {
  state: CurrentPlanCardUiState;
  plan: CurrentPlanCardPlan;
  status: CurrentPlanCardStatus;
  billingCycle: CurrentPlanCardBillingCycle;
  renewalDate: string | null;
  periodEndDate: string | null;
  creditsRemaining: number;
  reportsUsed: number | null;
  storageUsed: number | null;
  currentPrice: string;
  statusDetail: string | null;
};

export const MOCK_CURRENT_PLAN_FREE: MockCurrentPlanCard = {
  state: "active",
  plan: "free",
  status: "active",
  billingCycle: "monthly",
  renewalDate: "2026-09-01T00:00:00.000Z",
  periodEndDate: null,
  creditsRemaining: remainingForPlan("free"),
  reportsUsed: 2,
  storageUsed: null,
  currentPrice: currentPlanCardPriceLabel("free"),
  statusDetail: null,
};

export const MOCK_CURRENT_PLAN_PRO: MockCurrentPlanCard = {
  state: "active",
  plan: "pro",
  status: "active",
  billingCycle: "monthly",
  renewalDate: "2026-08-28T00:00:00.000Z",
  periodEndDate: null,
  creditsRemaining: remainingForPlan("pro"),
  reportsUsed: 5,
  storageUsed: 22,
  currentPrice: currentPlanCardPriceLabel("pro"),
  statusDetail: null,
};

export const MOCK_CURRENT_PLAN_BUSINESS: MockCurrentPlanCard = {
  state: "active",
  plan: "business",
  status: "active",
  billingCycle: "monthly",
  renewalDate: "2026-09-03T00:00:00.000Z",
  periodEndDate: null,
  creditsRemaining: remainingForPlan("business"),
  reportsUsed: 18,
  storageUsed: 41,
  currentPrice: currentPlanCardPriceLabel("business"),
  statusDetail: null,
};

export const MOCK_CURRENT_PLAN_TRIAL: MockCurrentPlanCard = {
  ...MOCK_CURRENT_PLAN_PRO,
  status: "trial",
  periodEndDate: "2026-08-14T00:00:00.000Z",
  statusDetail: null,
};

export const MOCK_CURRENT_PLAN_CANCELLED: MockCurrentPlanCard = {
  ...MOCK_CURRENT_PLAN_PRO,
  state: "cancelled",
  status: "cancelled",
  periodEndDate: "2026-08-28T00:00:00.000Z",
  statusDetail: null,
};

export const MOCK_CURRENT_PLAN_EXPIRED: MockCurrentPlanCard = {
  ...MOCK_CURRENT_PLAN_PRO,
  state: "expired",
  status: "expired",
  renewalDate: null,
  periodEndDate: "2026-07-01T00:00:00.000Z",
  creditsRemaining: 0,
  statusDetail: null,
};

export const MOCK_CURRENT_PLAN_LOADING: MockCurrentPlanCard = {
  ...MOCK_CURRENT_PLAN_FREE,
  state: "loading",
};

export const MOCK_CURRENT_PLAN_ERROR: MockCurrentPlanCard = {
  ...MOCK_CURRENT_PLAN_FREE,
  state: "error",
  statusDetail: "We couldn’t load your plan. Please try again.",
};

export const MOCK_CURRENT_PLAN_BY_PLAN: Record<
  CurrentPlanCardPlan,
  MockCurrentPlanCard
> = {
  free: MOCK_CURRENT_PLAN_FREE,
  pro: MOCK_CURRENT_PLAN_PRO,
  business: MOCK_CURRENT_PLAN_BUSINESS,
};

export function getMockCurrentPlanCard(
  plan: CurrentPlanCardPlan = "free",
  overrides?: Partial<MockCurrentPlanCard>,
): MockCurrentPlanCard {
  const base = MOCK_CURRENT_PLAN_BY_PLAN[plan];
  const nextPlan = overrides?.plan ?? base.plan;
  return {
    ...base,
    ...overrides,
    plan: nextPlan,
    currentPrice:
      overrides?.currentPrice ??
      (overrides?.plan
        ? currentPlanCardPriceLabel(overrides.plan)
        : base.currentPrice),
    creditsRemaining:
      overrides?.creditsRemaining ??
      (overrides?.plan
        ? Math.min(
            base.creditsRemaining,
            currentPlanCardMonthlyCredits(overrides.plan),
          )
        : base.creditsRemaining),
  };
}
