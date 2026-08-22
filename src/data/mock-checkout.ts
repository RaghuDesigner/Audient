/**
 * Phase-1 mock Checkout — SCREEN-013.
 * Carries Billing & Payments selection; no Stripe / no API / no entitlements.
 */

import type { CheckoutCycle, CheckoutPlan, CheckoutState } from "@/config/checkout";
import { PLANS } from "@/config/plans";
import {
  MOCK_BILLING_PAYMENTS_COUNTRIES,
  MOCK_BILLING_PAYMENTS_COUPONS,
  MOCK_BILLING_PAYMENTS_FORM_FILLED,
} from "@/data/mock-billing-payments";
import {
  billingPaymentsCreditsIncluded,
  billingPaymentsPlanToAuth,
  type BillingPaymentsAppliedCoupon,
} from "@/utils/billing-payments";
import type { BillingDetailsValues } from "@/utils/billing-details-card";
import { formatCheckoutRenewalDate } from "@/utils/checkout";

export type MockCheckoutBillingDetails = {
  name: string;
  email: string;
  billingAddress: string;
  countryCode: string;
  countryLabel: string;
  taxId: string | null;
};

/** Map checkout mock billing → BillingDetailsCard values. */
export function mockCheckoutBillingToDetailsValues(
  billing: MockCheckoutBillingDetails,
): BillingDetailsValues {
  return {
    fullName: billing.name,
    email: billing.email,
    companyName: "",
    billingAddress: billing.billingAddress,
    country: billing.countryCode,
    stateRegion: "",
    postalCode: "",
    taxId: billing.taxId ?? "",
  };
}

/** Checkout screen payload (callbacks omitted). */
export type MockCheckout = {
  state: CheckoutState;
  plan: CheckoutPlan;
  cycle: CheckoutCycle;
  appliedCoupon: BillingPaymentsAppliedCoupon | null;
  billing: MockCheckoutBillingDetails;
  featureBullets: string[];
  creditsIncluded: number;
  renewalDateLabel: string;
  /** QA: force mock pay failure on Pay Now. */
  forcePayError?: boolean;
};

function countryLabel(code: string): string {
  const match = MOCK_BILLING_PAYMENTS_COUNTRIES.find((c) => c.value === code);
  return match?.label ?? code;
}

function featureBulletsFor(plan: CheckoutPlan): string[] {
  return [...PLANS[billingPaymentsPlanToAuth(plan)].features];
}

function billingFromFilled(
  overrides?: Partial<MockCheckoutBillingDetails>,
): MockCheckoutBillingDetails {
  const countryCode = overrides?.countryCode ?? MOCK_BILLING_PAYMENTS_FORM_FILLED.country;
  return {
    name: overrides?.name ?? MOCK_BILLING_PAYMENTS_FORM_FILLED.businessName,
    email: overrides?.email ?? "alex@acme.example",
    billingAddress:
      overrides?.billingAddress ?? MOCK_BILLING_PAYMENTS_FORM_FILLED.billingAddress,
    countryCode,
    countryLabel: overrides?.countryLabel ?? countryLabel(countryCode),
    taxId:
      overrides?.taxId !== undefined
        ? overrides.taxId
        : MOCK_BILLING_PAYMENTS_FORM_FILLED.taxId || null,
  };
}

export const MOCK_CHECKOUT_PRO: MockCheckout = {
  state: "success",
  plan: "pro",
  cycle: "monthly",
  appliedCoupon: null,
  billing: billingFromFilled(),
  featureBullets: featureBulletsFor("pro"),
  creditsIncluded: billingPaymentsCreditsIncluded("pro"),
  renewalDateLabel: formatCheckoutRenewalDate("monthly"),
};

export const MOCK_CHECKOUT_BUSINESS: MockCheckout = {
  state: "success",
  plan: "business",
  cycle: "monthly",
  appliedCoupon: null,
  billing: billingFromFilled({
    name: "Acme Enterprise",
    email: "billing@acme.example",
  }),
  featureBullets: featureBulletsFor("business"),
  creditsIncluded: billingPaymentsCreditsIncluded("business"),
  renewalDateLabel: formatCheckoutRenewalDate("monthly"),
};

export const MOCK_CHECKOUT_PRO_YEARLY: MockCheckout = {
  ...MOCK_CHECKOUT_PRO,
  cycle: "yearly",
  renewalDateLabel: formatCheckoutRenewalDate("yearly"),
};

export const MOCK_CHECKOUT_PRO_COUPON: MockCheckout = {
  ...MOCK_CHECKOUT_PRO,
  appliedCoupon:
    MOCK_BILLING_PAYMENTS_COUPONS.find((c) => c.code === "SAVE20") ?? null,
};

export const MOCK_CHECKOUT_LOADING: MockCheckout = {
  ...MOCK_CHECKOUT_PRO,
  state: "loading",
};

export const MOCK_CHECKOUT_ERROR: MockCheckout = {
  ...MOCK_CHECKOUT_PRO,
  state: "error",
};

/** QA: Pay Now → mock pay error path (`?state=error` is load error; use this flag). */
export const MOCK_CHECKOUT_PAY_ERROR: MockCheckout = {
  ...MOCK_CHECKOUT_PRO,
  forcePayError: true,
};

export const MOCK_CHECKOUT_BY_PLAN: Record<CheckoutPlan, MockCheckout> = {
  pro: MOCK_CHECKOUT_PRO,
  business: MOCK_CHECKOUT_BUSINESS,
};

export function getMockCheckout(
  plan: CheckoutPlan = "pro",
  overrides?: Partial<MockCheckout>,
): MockCheckout {
  const base = MOCK_CHECKOUT_BY_PLAN[plan];
  const nextPlan = overrides?.plan ?? plan;
  const nextCycle = overrides?.cycle ?? base.cycle;

  return {
    ...base,
    ...overrides,
    plan: nextPlan,
    cycle: nextCycle,
    featureBullets:
      overrides?.featureBullets ?? featureBulletsFor(nextPlan),
    creditsIncluded:
      overrides?.creditsIncluded ?? billingPaymentsCreditsIncluded(nextPlan),
    renewalDateLabel:
      overrides?.renewalDateLabel ?? formatCheckoutRenewalDate(nextCycle),
    billing: {
      ...base.billing,
      ...overrides?.billing,
      countryLabel:
        overrides?.billing?.countryLabel ??
        countryLabel(
          overrides?.billing?.countryCode ?? base.billing.countryCode,
        ),
    },
  };
}
