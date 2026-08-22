/**
 * SCREEN-014 — Payment Processing helpers.
 * Mock intent + query parse — no React / no Stripe / no entitlements.
 */

import {
  PAYMENT_FAILURE_ROUTE,
  PAYMENT_PROCESSING_COPY,
  PAYMENT_PROCESSING_DEFAULT_DELAY_MS,
  PAYMENT_PROCESSING_PLANS,
  PAYMENT_PROCESSING_RESULTS,
  PAYMENT_PROCESSING_ROUTE,
  PAYMENT_PROCESSING_TIMEOUT_MS,
  PAYMENT_SUCCESS_ROUTE,
  type PaymentProcessingCycle,
  type PaymentProcessingPlan,
  type PaymentProcessingResult,
} from "@/config/payment-processing";
import {
  buildBillingPaymentsOrderSummary,
  formatBillingPaymentsMoney,
  parseBillingPaymentsCycle,
  parseBillingPaymentsPlan,
  type BillingPaymentsAppliedCoupon,
} from "@/utils/billing-payments";
import { checkoutCreditsIncluded } from "@/utils/checkout";

export function isPaymentProcessingPlan(
  value: string | null | undefined,
): value is PaymentProcessingPlan {
  return (
    value != null &&
    (PAYMENT_PROCESSING_PLANS as readonly string[]).includes(value)
  );
}

export function parsePaymentProcessingPlan(
  value: string | null | undefined,
): PaymentProcessingPlan | null {
  return parseBillingPaymentsPlan(value);
}

export function parsePaymentProcessingCycle(
  value: string | null | undefined,
): PaymentProcessingCycle {
  return parseBillingPaymentsCycle(value);
}

export function parsePaymentProcessingResult(
  value: string | null | undefined,
): PaymentProcessingResult {
  if (!value) return "success";
  const normalized = value.trim().toLowerCase();
  if (
    (PAYMENT_PROCESSING_RESULTS as readonly string[]).includes(normalized)
  ) {
    return normalized as PaymentProcessingResult;
  }
  return "success";
}

export function parsePaymentProcessingDelayMs(
  value: string | null | undefined,
): number {
  if (!value) return PAYMENT_PROCESSING_DEFAULT_DELAY_MS;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 0) {
    return PAYMENT_PROCESSING_DEFAULT_DELAY_MS;
  }
  return Math.min(n, PAYMENT_PROCESSING_TIMEOUT_MS);
}

/** One mock intent id per Pay Now — not a real PaymentIntent. */
export function createMockPaymentIntentId(): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `mock_pi_${rand}`;
}

export function buildPaymentProcessingHref(input: {
  plan: PaymentProcessingPlan;
  cycle?: PaymentProcessingCycle;
  amountCents?: number;
  coupon?: string | null;
  intentId?: string;
  result?: PaymentProcessingResult;
  delayMs?: number;
}): string {
  const params = new URLSearchParams();
  params.set("plan", input.plan);
  params.set("cycle", input.cycle ?? "monthly");
  if (input.amountCents != null) {
    params.set("amountCents", String(input.amountCents));
  }
  if (input.coupon) params.set("coupon", input.coupon);
  if (input.intentId) params.set("intentId", input.intentId);
  if (input.result) params.set("result", input.result);
  if (input.delayMs != null) params.set("delayMs", String(input.delayMs));
  return `${PAYMENT_PROCESSING_ROUTE}?${params.toString()}`;
}

export function buildPaymentSuccessHref(input?: {
  plan?: PaymentProcessingPlan;
  cycle?: PaymentProcessingCycle;
  intentId?: string;
  amountCents?: number;
  coupon?: string | null;
}): string {
  const params = new URLSearchParams();
  if (input?.plan) params.set("plan", input.plan);
  if (input?.cycle) params.set("cycle", input.cycle);
  if (input?.intentId) params.set("intentId", input.intentId);
  if (input?.amountCents != null) {
    params.set("amountCents", String(input.amountCents));
  }
  if (input?.coupon) params.set("coupon", input.coupon);
  const qs = params.toString();
  return qs ? `${PAYMENT_SUCCESS_ROUTE}?${qs}` : PAYMENT_SUCCESS_ROUTE;
}

export function buildPaymentFailureHref(input?: {
  plan?: PaymentProcessingPlan;
  cycle?: PaymentProcessingCycle;
  intentId?: string;
  amountCents?: number;
  coupon?: string | null;
  /** Friendly mock reason for SCREEN-016. */
  reason?: string;
}): string {
  const params = new URLSearchParams();
  if (input?.plan) params.set("plan", input.plan);
  if (input?.cycle) params.set("cycle", input.cycle);
  if (input?.intentId) params.set("intentId", input.intentId);
  if (input?.amountCents != null) {
    params.set("amountCents", String(input.amountCents));
  }
  if (input?.coupon) params.set("coupon", input.coupon);
  if (input?.reason) params.set("reason", input.reason);
  const qs = params.toString();
  return qs ? `${PAYMENT_FAILURE_ROUTE}?${qs}` : PAYMENT_FAILURE_ROUTE;
}

export function resolvePaymentProcessingAmountCents(input: {
  plan: PaymentProcessingPlan;
  cycle: PaymentProcessingCycle;
  amountCents?: number | null;
  coupon?: BillingPaymentsAppliedCoupon | null;
}): number {
  if (input.amountCents != null && input.amountCents >= 0) {
    return input.amountCents;
  }
  return buildBillingPaymentsOrderSummary({
    plan: input.plan,
    cycle: input.cycle,
    coupon: input.coupon,
  }).totalDueCents;
}

export function formatPaymentProcessingAmount(cents: number): string {
  return formatBillingPaymentsMoney(cents);
}

export function paymentProcessingCredits(
  plan: PaymentProcessingPlan,
): number {
  return checkoutCreditsIncluded(plan);
}

/** Optional stage labels for status text (mock only). */
export function paymentProcessingStageLabel(
  elapsedMs: number,
  delayMs: number,
): string {
  if (delayMs <= 0) return PAYMENT_PROCESSING_COPY.statusFinalizing;
  const ratio = elapsedMs / delayMs;
  if (ratio < 0.33) return PAYMENT_PROCESSING_COPY.statusProcessing;
  if (ratio < 0.66) return PAYMENT_PROCESSING_COPY.statusConfirming;
  return PAYMENT_PROCESSING_COPY.statusFinalizing;
}

export function isConsumedMockIntent(
  intentId: string | null | undefined,
  consumedIds: ReadonlySet<string>,
): boolean {
  if (!intentId) return false;
  return consumedIds.has(intentId);
}
