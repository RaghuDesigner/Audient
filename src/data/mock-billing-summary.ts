/**
 * Phase-1 mock Billing Summary — COMPONENT-036.
 * Payment / invoice placeholders for QA; no Stripe / no API.
 */

import type {
  BillingSummaryBillingCycle,
  BillingSummaryPlan,
  BillingSummaryState,
} from "@/config/billing-summary";
import { billingSummaryPriceLabel } from "@/utils/billing-summary";

/** Data props for BillingSummary (callbacks omitted). */
export type MockBillingSummary = {
  state: BillingSummaryState;
  plan: BillingSummaryPlan;
  billingCycle: BillingSummaryBillingCycle;
  renewalDate: string | null;
  currentPrice: string;
  paymentMethodLabel: string | null;
  hasInvoices: boolean;
  statusDetail: string | null;
};

export const MOCK_BILLING_SUMMARY_FREE: MockBillingSummary = {
  state: "success",
  plan: "free",
  billingCycle: "monthly",
  renewalDate: null,
  currentPrice: billingSummaryPriceLabel("free"),
  paymentMethodLabel: null,
  hasInvoices: false,
  statusDetail: null,
};

export const MOCK_BILLING_SUMMARY_PRO: MockBillingSummary = {
  state: "success",
  plan: "pro",
  billingCycle: "monthly",
  renewalDate: "2026-08-28T00:00:00.000Z",
  currentPrice: billingSummaryPriceLabel("pro"),
  paymentMethodLabel: "Visa •••• 4242",
  hasInvoices: true,
  statusDetail: null,
};

export const MOCK_BILLING_SUMMARY_BUSINESS: MockBillingSummary = {
  state: "success",
  plan: "business",
  billingCycle: "monthly",
  renewalDate: "2026-09-03T00:00:00.000Z",
  currentPrice: billingSummaryPriceLabel("business"),
  paymentMethodLabel: "Mastercard •••• 5454",
  hasInvoices: true,
  statusDetail: null,
};

export const MOCK_BILLING_SUMMARY_LOADING: MockBillingSummary = {
  ...MOCK_BILLING_SUMMARY_FREE,
  state: "loading",
};

export const MOCK_BILLING_SUMMARY_ERROR: MockBillingSummary = {
  ...MOCK_BILLING_SUMMARY_PRO,
  state: "error",
  statusDetail: "We couldn’t load billing. Please try again.",
};

export const MOCK_BILLING_SUMMARY_EXPIRED: MockBillingSummary = {
  ...MOCK_BILLING_SUMMARY_PRO,
  state: "expired",
  renewalDate: "2026-07-01T00:00:00.000Z",
  statusDetail: null,
};

export const MOCK_BILLING_SUMMARY_BY_PLAN: Record<
  BillingSummaryPlan,
  MockBillingSummary
> = {
  free: MOCK_BILLING_SUMMARY_FREE,
  pro: MOCK_BILLING_SUMMARY_PRO,
  business: MOCK_BILLING_SUMMARY_BUSINESS,
};

export function getMockBillingSummary(
  plan: BillingSummaryPlan = "free",
  overrides?: Partial<MockBillingSummary>,
): MockBillingSummary {
  const base = MOCK_BILLING_SUMMARY_BY_PLAN[plan];
  const nextPlan = overrides?.plan ?? base.plan;
  return {
    ...base,
    ...overrides,
    plan: nextPlan,
    currentPrice:
      overrides?.currentPrice ??
      (overrides?.plan
        ? billingSummaryPriceLabel(overrides.plan)
        : base.currentPrice),
  };
}
