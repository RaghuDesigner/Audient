/**
 * Phase-1 mock Checkout Summary — COMPONENT Checkout Summary.
 * Selected / purchased plan fixtures for QA; no Stripe / no API.
 */

import type {
  CheckoutSummaryContext,
  CheckoutSummaryCycle,
  CheckoutSummaryPlan,
  CheckoutSummaryState,
  CheckoutSummaryVariant,
} from "@/config/checkout-summary";
import { CHECKOUT_SUMMARY_CURRENCY } from "@/config/checkout-summary";
import {
  checkoutSummaryCreditsIncluded,
  checkoutSummaryFeatureBullets,
  checkoutSummaryPriceLabel,
  formatCheckoutSummaryRenewal,
} from "@/utils/checkout-summary";

/** Data props for CheckoutSummary (callbacks omitted). */
export type MockCheckoutSummary = {
  state: CheckoutSummaryState;
  planName: CheckoutSummaryPlan;
  billingCycle: CheckoutSummaryCycle;
  priceLabel: string;
  currency: string;
  creditsIncluded: number;
  features: string[];
  renewalDate: string | null;
  renewalDateLabel: string;
  variant: CheckoutSummaryVariant;
  context: CheckoutSummaryContext;
};

function defaultRenewalDate(
  planName: CheckoutSummaryPlan,
  state: CheckoutSummaryState,
): string | null {
  if (planName === "free") return null;
  if (state === "expired") return "2026-06-01T00:00:00.000Z";
  if (state === "cancelled") return "2026-08-28T00:00:00.000Z";
  return "2026-09-04T00:00:00.000Z";
}

function buildMock(
  planName: CheckoutSummaryPlan,
  billingCycle: CheckoutSummaryCycle,
  state: CheckoutSummaryState,
  extras?: Partial<MockCheckoutSummary>,
): MockCheckoutSummary {
  const nextPlan = extras?.planName ?? planName;
  const nextCycle = extras?.billingCycle ?? billingCycle;
  const nextState = extras?.state ?? state;
  const renewalDate =
    extras?.renewalDate !== undefined
      ? extras.renewalDate
      : defaultRenewalDate(nextPlan, nextState);

  return {
    state: nextState,
    planName: nextPlan,
    billingCycle: nextCycle,
    priceLabel:
      extras?.priceLabel ?? checkoutSummaryPriceLabel(nextPlan, nextCycle),
    currency: extras?.currency ?? CHECKOUT_SUMMARY_CURRENCY,
    creditsIncluded:
      extras?.creditsIncluded ?? checkoutSummaryCreditsIncluded(nextPlan),
    features: extras?.features ?? checkoutSummaryFeatureBullets(nextPlan),
    renewalDate,
    renewalDateLabel:
      extras?.renewalDateLabel ??
      formatCheckoutSummaryRenewal({
        state: nextState,
        plan: nextPlan,
        renewalDate,
      }),
    variant: extras?.variant ?? "default",
    context: extras?.context ?? "checkout",
  };
}

export const MOCK_CHECKOUT_SUMMARY_PRO: MockCheckoutSummary = buildMock(
  "pro",
  "monthly",
  "default",
);

export const MOCK_CHECKOUT_SUMMARY_PRO_YEARLY: MockCheckoutSummary = buildMock(
  "pro",
  "yearly",
  "default",
);

export const MOCK_CHECKOUT_SUMMARY_BUSINESS: MockCheckoutSummary = buildMock(
  "business",
  "monthly",
  "default",
);

export const MOCK_CHECKOUT_SUMMARY_FREE: MockCheckoutSummary = buildMock(
  "free",
  "monthly",
  "default",
);

export const MOCK_CHECKOUT_SUMMARY_LOADING: MockCheckoutSummary = buildMock(
  "pro",
  "monthly",
  "loading",
);

export const MOCK_CHECKOUT_SUMMARY_ERROR: MockCheckoutSummary = buildMock(
  "pro",
  "monthly",
  "error",
);

export const MOCK_CHECKOUT_SUMMARY_CANCELLED: MockCheckoutSummary = buildMock(
  "pro",
  "monthly",
  "cancelled",
  { context: "billing_history", variant: "compact" },
);

export const MOCK_CHECKOUT_SUMMARY_EXPIRED: MockCheckoutSummary = buildMock(
  "pro",
  "monthly",
  "expired",
  { context: "invoice", variant: "invoice" },
);

export const MOCK_CHECKOUT_SUMMARY_PAYMENT_SUCCESS: MockCheckoutSummary =
  buildMock("pro", "yearly", "default", {
    context: "payment_success",
  });

export function getMockCheckoutSummary(
  planName: CheckoutSummaryPlan = "pro",
  overrides?: Partial<MockCheckoutSummary>,
): MockCheckoutSummary {
  return buildMock(
    planName,
    overrides?.billingCycle ?? "monthly",
    overrides?.state ?? "default",
    overrides,
  );
}
