/**
 * Phase-1 mock Payment Processing — SCREEN-014.
 * Checkout context payload for wait surface; no Stripe / no API.
 */

import {
  PAYMENT_PROCESSING_CURRENCY,
  PAYMENT_PROCESSING_DEFAULT_DELAY_MS,
  type PaymentProcessingCycle,
  type PaymentProcessingPlan,
  type PaymentProcessingResult,
} from "@/config/payment-processing";
import {
  MOCK_BILLING_PAYMENTS_COUPONS,
} from "@/data/mock-billing-payments";
import type { BillingPaymentsAppliedCoupon } from "@/utils/billing-payments";
import {
  createMockPaymentIntentId,
  paymentProcessingCredits,
  resolvePaymentProcessingAmountCents,
} from "@/utils/payment-processing";
import { checkoutSummaryFeatureBullets } from "@/utils/checkout-summary";

export type MockPaymentProcessing = {
  plan: PaymentProcessingPlan;
  cycle: PaymentProcessingCycle;
  amountCents: number;
  currency: string;
  creditsIncluded: number;
  features: string[];
  appliedCoupon: BillingPaymentsAppliedCoupon | null;
  intentId: string;
  result: PaymentProcessingResult;
  delayMs: number;
};

function resolveCoupon(
  code: string | null | undefined,
): BillingPaymentsAppliedCoupon | null {
  if (!code) return null;
  const normalized = code.trim().toUpperCase();
  return (
    MOCK_BILLING_PAYMENTS_COUPONS.find((c) => c.code === normalized) ?? null
  );
}

export function getMockPaymentProcessing(input: {
  plan?: PaymentProcessingPlan;
  cycle?: PaymentProcessingCycle;
  amountCents?: number | null;
  coupon?: string | null;
  intentId?: string | null;
  result?: PaymentProcessingResult;
  delayMs?: number;
}): MockPaymentProcessing | null {
  const plan = input.plan;
  if (!plan) return null;

  const cycle = input.cycle ?? "monthly";
  const appliedCoupon = resolveCoupon(input.coupon);
  const amountCents = resolvePaymentProcessingAmountCents({
    plan,
    cycle,
    amountCents: input.amountCents,
    coupon: appliedCoupon,
  });

  return {
    plan,
    cycle,
    amountCents,
    currency: PAYMENT_PROCESSING_CURRENCY,
    creditsIncluded: paymentProcessingCredits(plan),
    features: checkoutSummaryFeatureBullets(plan),
    appliedCoupon,
    intentId: input.intentId?.trim() || createMockPaymentIntentId(),
    result: input.result ?? "success",
    delayMs: input.delayMs ?? PAYMENT_PROCESSING_DEFAULT_DELAY_MS,
  };
}

export const MOCK_PAYMENT_PROCESSING_PRO: MockPaymentProcessing =
  getMockPaymentProcessing({ plan: "pro", cycle: "monthly" })!;

export const MOCK_PAYMENT_PROCESSING_BUSINESS: MockPaymentProcessing =
  getMockPaymentProcessing({ plan: "business", cycle: "yearly" })!;

export const MOCK_PAYMENT_PROCESSING_FAILURE: MockPaymentProcessing =
  getMockPaymentProcessing({
    plan: "pro",
    cycle: "monthly",
    result: "failure",
  })!;

export const MOCK_PAYMENT_PROCESSING_TIMEOUT: MockPaymentProcessing =
  getMockPaymentProcessing({
    plan: "pro",
    cycle: "monthly",
    result: "timeout",
    delayMs: 1_000,
  })!;
