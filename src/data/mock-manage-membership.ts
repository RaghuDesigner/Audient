/**
 * Phase-1 mock Manage Membership payloads — SCREEN-011 / SCREEN-005.
 * Plan / usage / billing fixtures for QA; no Stripe / no API.
 */

import type {
  ManageMembershipBillingCycle,
  ManageMembershipPlan,
  ManageMembershipState,
  ManageMembershipStatus,
} from "@/config/manage-membership";
import {
  manageMembershipMonthlyPriceLabel,
  manageMembershipPlanToAuth,
} from "@/utils/manage-membership";
import { MOCK_DEMO_CREDITS_USED, mockMonthlyGrantForTier } from "@/lib/auth/mock-membership";

function mockUsageForPlan(plan: ManageMembershipPlan) {
  const planTier = manageMembershipPlanToAuth(plan);
  const monthlyGrant = mockMonthlyGrantForTier(planTier);
  const creditsUsed = MOCK_DEMO_CREDITS_USED[planTier];
  return {
    creditsRemaining: Math.max(0, monthlyGrant - creditsUsed),
    creditsUsed,
    monthlyGrant,
  };
}

export type MockManageMembershipBilling = {
  paymentMethodLabel: string | null;
  nextBillingDate: string | null;
  subscriptionCostLabel: string;
  hasInvoices: boolean;
};

export type MockManageMembershipUsage = {
  creditsRemaining: number;
  creditsUsed: number;
  monthlyGrant: number;
  reportsGenerated: number;
  /** 0–100 placeholder; omit in UI when null. */
  storageUsedPercent: number | null;
};

/** Data props for Manage Membership screen sections. */
export type MockManageMembership = {
  state: ManageMembershipState;
  plan: ManageMembershipPlan;
  status: ManageMembershipStatus;
  billingCycle: ManageMembershipBillingCycle;
  renewalDate: string | null;
  periodEndDate: string | null;
  usage: MockManageMembershipUsage;
  billing: MockManageMembershipBilling;
  statusDetail: string | null;
};

export const MOCK_MANAGE_MEMBERSHIP_FREE: MockManageMembership = {
  state: "success",
  plan: "free",
  status: "active",
  billingCycle: "monthly",
  renewalDate: "2026-09-01T00:00:00.000Z",
  periodEndDate: null,
  usage: {
    ...mockUsageForPlan("free"),
    reportsGenerated: 2,
    storageUsedPercent: null,
  },
  billing: {
    paymentMethodLabel: null,
    nextBillingDate: null,
    subscriptionCostLabel: manageMembershipMonthlyPriceLabel("free"),
    hasInvoices: false,
  },
  statusDetail: null,
};

export const MOCK_MANAGE_MEMBERSHIP_PRO: MockManageMembership = {
  state: "success",
  plan: "pro",
  status: "active",
  billingCycle: "monthly",
  renewalDate: "2026-08-28T00:00:00.000Z",
  periodEndDate: null,
  usage: {
    ...mockUsageForPlan("pro"),
    reportsGenerated: 5,
    storageUsedPercent: 22,
  },
  billing: {
    paymentMethodLabel: "Visa •••• 4242",
    nextBillingDate: "2026-08-28T00:00:00.000Z",
    subscriptionCostLabel: manageMembershipMonthlyPriceLabel("pro"),
    hasInvoices: true,
  },
  statusDetail: null,
};

export const MOCK_MANAGE_MEMBERSHIP_BUSINESS: MockManageMembership = {
  state: "success",
  plan: "business",
  status: "active",
  billingCycle: "monthly",
  renewalDate: "2026-09-03T00:00:00.000Z",
  periodEndDate: null,
  usage: {
    ...mockUsageForPlan("business"),
    reportsGenerated: 18,
    storageUsedPercent: 41,
  },
  billing: {
    paymentMethodLabel: "Mastercard •••• 5454",
    nextBillingDate: "2026-09-03T00:00:00.000Z",
    subscriptionCostLabel: manageMembershipMonthlyPriceLabel("business"),
    hasInvoices: true,
  },
  statusDetail: null,
};

export const MOCK_MANAGE_MEMBERSHIP_CANCELLED: MockManageMembership = {
  ...MOCK_MANAGE_MEMBERSHIP_PRO,
  state: "cancelled",
  status: "cancelled",
  periodEndDate: "2026-08-28T00:00:00.000Z",
  statusDetail:
    "Your plan is cancelled. You keep access until the period end date.",
};

export const MOCK_MANAGE_MEMBERSHIP_EXPIRED: MockManageMembership = {
  ...MOCK_MANAGE_MEMBERSHIP_PRO,
  state: "expired",
  status: "expired",
  renewalDate: null,
  periodEndDate: "2026-07-01T00:00:00.000Z",
  usage: {
    ...MOCK_MANAGE_MEMBERSHIP_PRO.usage,
    creditsRemaining: 0,
    creditsUsed: 1000,
  },
  billing: {
    ...MOCK_MANAGE_MEMBERSHIP_PRO.billing,
    nextBillingDate: null,
  },
  statusDetail:
    "Your plan has lapsed. Resubscribe to restore Pro features.",
};

export const MOCK_MANAGE_MEMBERSHIP_LOADING: MockManageMembership = {
  ...MOCK_MANAGE_MEMBERSHIP_FREE,
  state: "loading",
};

export const MOCK_MANAGE_MEMBERSHIP_ERROR: MockManageMembership = {
  ...MOCK_MANAGE_MEMBERSHIP_FREE,
  state: "error",
  statusDetail: "We couldn’t load membership. Please try again.",
};

export const MOCK_MANAGE_MEMBERSHIP_BY_PLAN: Record<
  ManageMembershipPlan,
  MockManageMembership
> = {
  free: MOCK_MANAGE_MEMBERSHIP_FREE,
  pro: MOCK_MANAGE_MEMBERSHIP_PRO,
  business: MOCK_MANAGE_MEMBERSHIP_BUSINESS,
};

export function getMockManageMembership(
  plan: ManageMembershipPlan = "free",
  overrides?: Partial<MockManageMembership>,
): MockManageMembership {
  return { ...MOCK_MANAGE_MEMBERSHIP_BY_PLAN[plan], ...overrides };
}
