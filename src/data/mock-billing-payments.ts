/**
 * Phase-1 mock Billing & Payments — SCREEN-012.
 * Checkout review fixtures for QA; no Stripe / no API / no entitlements.
 */

import {
  BILLING_PAYMENTS_MOCK_COUPONS,
  type BillingPaymentsCycle,
  type BillingPaymentsPlan,
  type BillingPaymentsState,
} from "@/config/billing-payments";
import { PLANS } from "@/config/plans";
import type { FaqAccordionItem } from "@/config/faq-accordion";
import { MOCK_FAQ_MEMBERSHIP_ITEMS } from "@/data/mock-faq-accordion";
import {
  billingPaymentsCreditsIncluded,
  billingPaymentsPlanToAuth,
  type BillingPaymentsAppliedCoupon,
} from "@/utils/billing-payments";

/** Mock billing information form defaults (never persisted). */
export type MockBillingPaymentsForm = {
  businessName: string;
  billingAddress: string;
  country: string;
  taxId: string;
};

/** Checkout session payload for the screen (callbacks omitted). */
export type MockBillingPayments = {
  state: BillingPaymentsState;
  plan: BillingPaymentsPlan | null;
  cycle: BillingPaymentsCycle;
  /** Pre-applied coupon for QA; null = none. */
  appliedCoupon: BillingPaymentsAppliedCoupon | null;
  form: MockBillingPaymentsForm;
  featureBullets: string[];
  creditsIncluded: number;
};

export const MOCK_BILLING_PAYMENTS_COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "IN", label: "India" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "SG", label: "Singapore" },
] as const;

export const MOCK_BILLING_PAYMENTS_FORM_EMPTY: MockBillingPaymentsForm = {
  businessName: "",
  billingAddress: "",
  country: "US",
  taxId: "",
};

export const MOCK_BILLING_PAYMENTS_FORM_FILLED: MockBillingPaymentsForm = {
  businessName: "Acme Design Co.",
  billingAddress: "123 Market Street, Suite 400",
  country: "US",
  taxId: "",
};

/** Valid mock coupons — same source as config (case-insensitive at apply time). */
export const MOCK_BILLING_PAYMENTS_COUPONS: BillingPaymentsAppliedCoupon[] =
  Object.values(BILLING_PAYMENTS_MOCK_COUPONS).map((c) => ({
    code: c.code,
    percentOff: c.percentOff,
    label: c.label,
  }));

export const MOCK_BILLING_PAYMENTS_FAQ: FaqAccordionItem[] =
  MOCK_FAQ_MEMBERSHIP_ITEMS;

function featureBulletsFor(plan: BillingPaymentsPlan): string[] {
  return [...PLANS[billingPaymentsPlanToAuth(plan)].features];
}

export const MOCK_BILLING_PAYMENTS_PRO: MockBillingPayments = {
  state: "success",
  plan: "pro",
  cycle: "monthly",
  appliedCoupon: null,
  form: { ...MOCK_BILLING_PAYMENTS_FORM_EMPTY },
  featureBullets: featureBulletsFor("pro"),
  creditsIncluded: billingPaymentsCreditsIncluded("pro"),
};

export const MOCK_BILLING_PAYMENTS_BUSINESS: MockBillingPayments = {
  state: "success",
  plan: "business",
  cycle: "monthly",
  appliedCoupon: null,
  form: { ...MOCK_BILLING_PAYMENTS_FORM_EMPTY },
  featureBullets: featureBulletsFor("business"),
  creditsIncluded: billingPaymentsCreditsIncluded("business"),
};

export const MOCK_BILLING_PAYMENTS_PRO_YEARLY: MockBillingPayments = {
  ...MOCK_BILLING_PAYMENTS_PRO,
  cycle: "yearly",
};

export const MOCK_BILLING_PAYMENTS_PRO_COUPON: MockBillingPayments = {
  ...MOCK_BILLING_PAYMENTS_PRO,
  appliedCoupon: MOCK_BILLING_PAYMENTS_COUPONS.find((c) => c.code === "SAVE20")!,
};

export const MOCK_BILLING_PAYMENTS_LOADING: MockBillingPayments = {
  ...MOCK_BILLING_PAYMENTS_PRO,
  state: "loading",
};

export const MOCK_BILLING_PAYMENTS_EMPTY: MockBillingPayments = {
  state: "empty",
  plan: null,
  cycle: "monthly",
  appliedCoupon: null,
  form: { ...MOCK_BILLING_PAYMENTS_FORM_EMPTY },
  featureBullets: [],
  creditsIncluded: 0,
};

export const MOCK_BILLING_PAYMENTS_ERROR: MockBillingPayments = {
  ...MOCK_BILLING_PAYMENTS_PRO,
  state: "error",
};

export const MOCK_BILLING_PAYMENTS_BY_PLAN: Record<
  BillingPaymentsPlan,
  MockBillingPayments
> = {
  pro: MOCK_BILLING_PAYMENTS_PRO,
  business: MOCK_BILLING_PAYMENTS_BUSINESS,
};

export function getMockBillingPayments(
  plan: BillingPaymentsPlan | null = "pro",
  overrides?: Partial<MockBillingPayments>,
): MockBillingPayments {
  if (plan == null) {
    return {
      ...MOCK_BILLING_PAYMENTS_EMPTY,
      ...overrides,
      plan: overrides?.plan ?? null,
      featureBullets: overrides?.featureBullets ?? [],
      creditsIncluded: overrides?.creditsIncluded ?? 0,
    };
  }

  const base = MOCK_BILLING_PAYMENTS_BY_PLAN[plan];
  const nextPlan = overrides?.plan === null ? null : (overrides?.plan ?? plan);

  if (nextPlan == null) {
    return {
      ...MOCK_BILLING_PAYMENTS_EMPTY,
      ...overrides,
      plan: null,
    };
  }

  return {
    ...base,
    ...overrides,
    plan: nextPlan,
    featureBullets:
      overrides?.featureBullets ?? featureBulletsFor(nextPlan),
    creditsIncluded:
      overrides?.creditsIncluded ??
      billingPaymentsCreditsIncluded(nextPlan),
    form: {
      ...base.form,
      ...overrides?.form,
    },
  };
}
