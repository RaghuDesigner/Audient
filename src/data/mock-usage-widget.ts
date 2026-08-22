/**
 * Phase-1 mock Usage Widget — COMPONENT-034.
 * Period usage fixtures for QA; no Stripe / no API.
 */

import type {
  UsageWidgetState,
  UsageWidgetTier,
} from "@/config/usage-widget";
import {
  deriveUsageWidgetState,
  usageWidgetMonthlyGrant,
} from "@/utils/usage-widget";
import { MOCK_DEMO_CREDITS_USED } from "@/lib/auth/mock-membership";
import { manageMembershipPlanToAuth } from "@/utils/manage-membership";

/** Data props for UsageWidget (callbacks omitted). */
export type MockUsageWidget = {
  state: UsageWidgetState;
  tier: UsageWidgetTier;
  creditsUsed: number;
  creditsRemaining: number;
  monthlyGrant: number;
  reportsGenerated: number | null;
  storageUsed: number | null;
  storageLimit: number | null;
  billingCycleLabel: string | null;
  renewalDate: string | null;
  showApiCallsPlaceholder: boolean;
};

function baseForTier(tier: UsageWidgetTier): Omit<MockUsageWidget, "state"> {
  const monthlyGrant = usageWidgetMonthlyGrant(tier);
  const creditsUsed = MOCK_DEMO_CREDITS_USED[manageMembershipPlanToAuth(tier)];
  const creditsRemaining = Math.max(0, monthlyGrant - creditsUsed);
  return {
    tier,
    creditsUsed,
    creditsRemaining,
    monthlyGrant,
    reportsGenerated: tier === "free" ? 2 : tier === "pro" ? 5 : 18,
    storageUsed: tier === "free" ? null : tier === "pro" ? 22 : 41,
    storageLimit: tier === "free" ? null : 100,
    billingCycleLabel: null,
    renewalDate:
      tier === "free"
        ? "2026-09-01T00:00:00.000Z"
        : tier === "pro"
          ? "2026-08-28T00:00:00.000Z"
          : "2026-09-03T00:00:00.000Z",
    showApiCallsPlaceholder: tier === "business",
  };
}

export const MOCK_USAGE_FREE: MockUsageWidget = {
  ...baseForTier("free"),
  state: "normal",
};

export const MOCK_USAGE_PRO: MockUsageWidget = {
  ...baseForTier("pro"),
  state: "normal",
};

export const MOCK_USAGE_BUSINESS: MockUsageWidget = {
  ...baseForTier("business"),
  state: "normal",
};

export const MOCK_USAGE_NEAR_LIMIT: MockUsageWidget = {
  ...baseForTier("pro"),
  creditsRemaining: 150,
  creditsUsed: 850,
  state: "near_limit",
};

export const MOCK_USAGE_LIMIT_REACHED: MockUsageWidget = {
  ...baseForTier("free"),
  creditsRemaining: 0,
  creditsUsed: 300,
  reportsGenerated: 2,
  state: "limit_reached",
};

export const MOCK_USAGE_LOADING: MockUsageWidget = {
  ...baseForTier("free"),
  state: "loading",
};

export const MOCK_USAGE_ERROR: MockUsageWidget = {
  ...baseForTier("free"),
  state: "error",
};

export const MOCK_USAGE_BY_TIER: Record<UsageWidgetTier, MockUsageWidget> = {
  free: MOCK_USAGE_FREE,
  pro: MOCK_USAGE_PRO,
  business: MOCK_USAGE_BUSINESS,
};

export function getMockUsageWidget(
  tier: UsageWidgetTier = "free",
  overrides?: Partial<MockUsageWidget>,
): MockUsageWidget {
  const base = MOCK_USAGE_BY_TIER[tier];
  const next: MockUsageWidget = {
    ...base,
    ...overrides,
    tier: overrides?.tier ?? tier,
    monthlyGrant:
      overrides?.monthlyGrant ??
      usageWidgetMonthlyGrant(overrides?.tier ?? tier),
  };

  if (
    overrides?.state == null &&
    (overrides?.creditsRemaining != null || overrides?.monthlyGrant != null)
  ) {
    next.state = deriveUsageWidgetState({
      creditsRemaining: next.creditsRemaining,
      monthlyGrant: next.monthlyGrant,
      tier: next.tier,
    });
  }

  return next;
}
