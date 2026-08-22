/**
 * SCREEN-016 — Payment Failure helpers.
 * Parse query, safe reasons, retry hrefs — no React / no Stripe / no secrets.
 */

import {
  PAYMENT_FAILURE_BILLING_ROUTE,
  PAYMENT_FAILURE_CHANGE_METHOD_ROUTE,
  PAYMENT_FAILURE_CURRENCY,
  PAYMENT_FAILURE_CYCLES,
  PAYMENT_FAILURE_DEFAULT_REASON,
  PAYMENT_FAILURE_PAYMENT_METHOD_HASH,
  PAYMENT_FAILURE_PLANS,
  PAYMENT_FAILURE_REASON_LABELS,
  PAYMENT_FAILURE_REASONS,
  PAYMENT_FAILURE_RECOMMENDED_ACTIONS,
  PAYMENT_FAILURE_ROUTE,
  PAYMENT_FAILURE_STATES,
  type PaymentFailureCycle,
  type PaymentFailurePlan,
  type PaymentFailureReason,
  type PaymentFailureState,
} from "@/config/payment-failure";
import {
  buildBillingPaymentsOrderSummary,
  billingPaymentsCreditsIncluded,
  billingPaymentsPlanLabel,
  formatBillingPaymentsCredits,
  formatBillingPaymentsMoney,
  lookupBillingPaymentsCoupon,
  parseBillingPaymentsCycle,
  parseBillingPaymentsPlan,
  type BillingPaymentsAppliedCoupon,
  type BillingPaymentsOrderSummary,
} from "@/utils/billing-payments";
import { buildCheckoutHref, checkoutCycleLabel } from "@/utils/checkout";
import {
  buildPaymentProcessingHref,
  createMockPaymentIntentId,
} from "@/utils/payment-processing";

export interface PaymentFailureQuery {
  plan: PaymentFailurePlan | null;
  cycle: PaymentFailureCycle;
  reason: PaymentFailureReason;
  intentId: string | null;
  amountCents: number | null;
  couponCode: string | null;
  state: PaymentFailureState | null;
}

export interface PaymentFailureViewModel {
  plan: PaymentFailurePlan;
  cycle: PaymentFailureCycle;
  planLabel: string;
  cycleLabel: string;
  reason: PaymentFailureReason;
  reasonLabel: string;
  recommendedAction: string;
  order: BillingPaymentsOrderSummary;
  amountCents: number;
  currency: typeof PAYMENT_FAILURE_CURRENCY;
  creditsIncluded: number;
  intentId: string | null;
  appliedCoupon: BillingPaymentsAppliedCoupon | null;
  /** Closed failed intent — never reuse for a second charge. */
  failedIntentClosed: true;
}

export function isPaymentFailurePlan(
  value: string | null | undefined,
): value is PaymentFailurePlan {
  return (
    value != null &&
    (PAYMENT_FAILURE_PLANS as readonly string[]).includes(value)
  );
}

export function isPaymentFailureCycle(
  value: string | null | undefined,
): value is PaymentFailureCycle {
  return (
    value != null &&
    (PAYMENT_FAILURE_CYCLES as readonly string[]).includes(value)
  );
}

export function isPaymentFailureReason(
  value: string | null | undefined,
): value is PaymentFailureReason {
  return (
    value != null &&
    (PAYMENT_FAILURE_REASONS as readonly string[]).includes(value)
  );
}

export function isPaymentFailureState(
  value: string | null | undefined,
): value is PaymentFailureState {
  return (
    value != null &&
    (PAYMENT_FAILURE_STATES as readonly string[]).includes(value)
  );
}

export function parsePaymentFailurePlan(
  value: string | null | undefined,
): PaymentFailurePlan | null {
  return parseBillingPaymentsPlan(value);
}

export function parsePaymentFailureCycle(
  value: string | null | undefined,
): PaymentFailureCycle {
  return parseBillingPaymentsCycle(value);
}

export function parsePaymentFailureReason(
  value: string | null | undefined,
): PaymentFailureReason {
  if (!value) return PAYMENT_FAILURE_DEFAULT_REASON;
  const normalized = value.trim().toLowerCase();
  if (isPaymentFailureReason(normalized)) return normalized;
  return "unknown";
}

export function parsePaymentFailureState(
  value: string | null | undefined,
): PaymentFailureState | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return isPaymentFailureState(normalized) ? normalized : null;
}

export function parsePaymentFailureAmountCents(
  value: string | null | undefined,
): number | null {
  if (!value) return null;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export function parsePaymentFailureQuery(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): PaymentFailureQuery {
  const get = (key: string): string | null => {
    if (params instanceof URLSearchParams) {
      return params.get(key);
    }
    const raw = params[key];
    if (Array.isArray(raw)) return raw[0] ?? null;
    return raw ?? null;
  };

  return {
    plan: parsePaymentFailurePlan(get("plan")),
    cycle: parsePaymentFailureCycle(get("cycle")),
    reason: parsePaymentFailureReason(get("reason")),
    intentId: get("intentId")?.trim() || null,
    amountCents: parsePaymentFailureAmountCents(get("amountCents")),
    couponCode: get("coupon")?.trim() || null,
    state: parsePaymentFailureState(get("state")),
  };
}

/** Deep link without plan — do not invent a failure event. */
export function hasPaymentFailureContext(
  query: Pick<PaymentFailureQuery, "plan">,
): boolean {
  return query.plan != null;
}

export function paymentFailureReasonLabel(
  reason: PaymentFailureReason,
): string {
  return PAYMENT_FAILURE_REASON_LABELS[reason];
}

export function paymentFailureRecommendedAction(
  reason: PaymentFailureReason,
): string {
  return PAYMENT_FAILURE_RECOMMENDED_ACTIONS[reason];
}

export function paymentFailurePlanLabel(plan: PaymentFailurePlan): string {
  return billingPaymentsPlanLabel(plan);
}

export function paymentFailureCycleLabel(cycle: PaymentFailureCycle): string {
  return checkoutCycleLabel(cycle);
}

export function paymentFailureCreditsIncluded(
  plan: PaymentFailurePlan,
): number {
  return billingPaymentsCreditsIncluded(plan);
}

export function formatPaymentFailureMoney(cents: number): string {
  return formatBillingPaymentsMoney(cents);
}

export function formatPaymentFailureCredits(credits: number): string {
  return formatBillingPaymentsCredits(credits);
}

export function resolvePaymentFailureCoupon(
  code: string | null | undefined,
): BillingPaymentsAppliedCoupon | null {
  if (!code) return null;
  return lookupBillingPaymentsCoupon(code);
}

export function buildPaymentFailureViewModel(input: {
  plan: PaymentFailurePlan;
  cycle?: PaymentFailureCycle;
  reason?: PaymentFailureReason;
  intentId?: string | null;
  amountCents?: number | null;
  couponCode?: string | null;
}): PaymentFailureViewModel {
  const cycle = input.cycle ?? "monthly";
  const reason = input.reason ?? PAYMENT_FAILURE_DEFAULT_REASON;
  const appliedCoupon = resolvePaymentFailureCoupon(input.couponCode);
  const order = buildBillingPaymentsOrderSummary({
    plan: input.plan,
    cycle,
    coupon: appliedCoupon,
  });

  const amountCents =
    input.amountCents != null && input.amountCents >= 0
      ? input.amountCents
      : order.totalDueCents;

  return {
    plan: input.plan,
    cycle,
    planLabel: paymentFailurePlanLabel(input.plan),
    cycleLabel: paymentFailureCycleLabel(cycle),
    reason,
    reasonLabel: paymentFailureReasonLabel(reason),
    recommendedAction: paymentFailureRecommendedAction(reason),
    order,
    amountCents,
    currency: PAYMENT_FAILURE_CURRENCY,
    creditsIncluded: order.creditsIncluded,
    intentId: input.intentId ?? null,
    appliedCoupon,
    failedIntentClosed: true,
  };
}

export function buildPaymentFailureViewModelFromQuery(
  query: PaymentFailureQuery,
): PaymentFailureViewModel | null {
  if (!query.plan) return null;
  return buildPaymentFailureViewModel({
    plan: query.plan,
    cycle: query.cycle,
    reason: query.reason,
    intentId: query.intentId,
    amountCents: query.amountCents,
    couponCode: query.couponCode,
  });
}

export function buildPaymentFailureHref(input?: {
  plan?: PaymentFailurePlan;
  cycle?: PaymentFailureCycle;
  reason?: PaymentFailureReason;
  intentId?: string | null;
  amountCents?: number;
  coupon?: string | null;
  state?: PaymentFailureState;
}): string {
  const params = new URLSearchParams();
  if (input?.plan) params.set("plan", input.plan);
  if (input?.cycle) params.set("cycle", input.cycle);
  if (input?.reason) params.set("reason", input.reason);
  if (input?.intentId) params.set("intentId", input.intentId);
  if (input?.amountCents != null) {
    params.set("amountCents", String(input.amountCents));
  }
  if (input?.coupon) params.set("coupon", input.coupon);
  if (input?.state) params.set("state", input.state);
  const qs = params.toString();
  return qs ? `${PAYMENT_FAILURE_ROUTE}?${qs}` : PAYMENT_FAILURE_ROUTE;
}

/**
 * Try Again → Checkout (same plan/cycle). New mock intent id only for tracking
 * hand-off; Checkout still requires explicit Pay Now (no silent second charge).
 * Failed intent is not reused.
 */
export function buildPaymentFailureTryAgainHref(input: {
  plan: PaymentFailurePlan;
  cycle: PaymentFailureCycle;
  failedIntentId?: string | null;
  coupon?: string | null;
}): string {
  void input.failedIntentId;
  return buildCheckoutHref({
    plan: input.plan,
    cycle: input.cycle,
    coupon: input.coupon,
  });
}

/**
 * Alternate Try Again path: Processing with a **new** intent and failure cleared.
 * Prefer checkout href so user reconfirms terms/order; use this for direct QA.
 */
export function buildPaymentFailureRetryProcessingHref(input: {
  plan: PaymentFailurePlan;
  cycle: PaymentFailureCycle;
  amountCents?: number;
  coupon?: string | null;
}): {
  href: string;
  intentId: string;
} {
  const intentId = createMockPaymentIntentId();
  return {
    intentId,
    href: buildPaymentProcessingHref({
      plan: input.plan,
      cycle: input.cycle,
      amountCents: input.amountCents,
      coupon: input.coupon,
      intentId,
      result: "success",
    }),
  };
}

/** Change Payment Method → Billing & Payments payment method section. */
export function buildPaymentFailureChangeMethodHref(input?: {
  plan?: PaymentFailurePlan | null;
  cycle?: PaymentFailureCycle;
}): string {
  const params = new URLSearchParams();
  if (input?.plan) params.set("plan", input.plan);
  if (input?.cycle) params.set("cycle", input.cycle);
  const qs = params.toString();
  const base = qs
    ? `${PAYMENT_FAILURE_CHANGE_METHOD_ROUTE}?${qs}`
    : PAYMENT_FAILURE_CHANGE_METHOD_ROUTE;
  return `${base}#${PAYMENT_FAILURE_PAYMENT_METHOD_HASH}`;
}

export function paymentFailureBillingHref(): string {
  return PAYMENT_FAILURE_BILLING_ROUTE;
}
