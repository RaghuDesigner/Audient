/**
 * SCREEN-015 — Payment Success helpers.
 * Parse query, totals, credits, mock ref — no React / no Stripe.
 */

import {
  PAYMENT_SUCCESS_CURRENCY,
  PAYMENT_SUCCESS_CYCLES,
  PAYMENT_SUCCESS_DASHBOARD_ROUTE,
  PAYMENT_SUCCESS_INVOICE_HISTORY_ROUTE,
  PAYMENT_SUCCESS_NEW_AUDIT_ROUTE,
  PAYMENT_SUCCESS_PLANS,
  PAYMENT_SUCCESS_REF_PREFIX,
  PAYMENT_SUCCESS_ROUTE,
  PAYMENT_SUCCESS_STATES,
  type PaymentSuccessCycle,
  type PaymentSuccessPlan,
  type PaymentSuccessState,
} from "@/config/payment-success";
import type { PlanTier } from "@/config/plans";
import {
  buildBillingPaymentsOrderSummary,
  billingPaymentsCreditsIncluded,
  billingPaymentsPlanLabel,
  billingPaymentsPlanToAuth,
  formatBillingPaymentsCredits,
  formatBillingPaymentsMoney,
  lookupBillingPaymentsCoupon,
  parseBillingPaymentsCycle,
  parseBillingPaymentsPlan,
  type BillingPaymentsAppliedCoupon,
  type BillingPaymentsOrderSummary,
} from "@/utils/billing-payments";
import {
  formatCheckoutRenewalDate,
  mockCheckoutRenewalDate,
  checkoutCycleLabel,
} from "@/utils/checkout";

export interface PaymentSuccessQuery {
  plan: PaymentSuccessPlan | null;
  cycle: PaymentSuccessCycle;
  intentId: string | null;
  amountCents: number | null;
  couponCode: string | null;
  state: PaymentSuccessState | null;
}

export interface PaymentSuccessViewModel {
  plan: PaymentSuccessPlan;
  cycle: PaymentSuccessCycle;
  planLabel: string;
  cycleLabel: string;
  authTier: PlanTier;
  order: BillingPaymentsOrderSummary;
  /** Prefer resolved order total; never trust amount alone without plan. */
  amountPaidCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  currency: typeof PAYMENT_SUCCESS_CURRENCY;
  creditsAdded: number;
  /** Mock balance after grant = plan monthly credits. */
  totalCreditsAvailable: number;
  renewalDate: Date;
  renewalDateLabel: string;
  paymentReference: string;
  intentId: string | null;
  appliedCoupon: BillingPaymentsAppliedCoupon | null;
}

export function isPaymentSuccessPlan(
  value: string | null | undefined,
): value is PaymentSuccessPlan {
  return (
    value != null &&
    (PAYMENT_SUCCESS_PLANS as readonly string[]).includes(value)
  );
}

export function isPaymentSuccessCycle(
  value: string | null | undefined,
): value is PaymentSuccessCycle {
  return (
    value != null &&
    (PAYMENT_SUCCESS_CYCLES as readonly string[]).includes(value)
  );
}

export function isPaymentSuccessState(
  value: string | null | undefined,
): value is PaymentSuccessState {
  return (
    value != null &&
    (PAYMENT_SUCCESS_STATES as readonly string[]).includes(value)
  );
}

export function parsePaymentSuccessPlan(
  value: string | null | undefined,
): PaymentSuccessPlan | null {
  return parseBillingPaymentsPlan(value);
}

export function parsePaymentSuccessCycle(
  value: string | null | undefined,
): PaymentSuccessCycle {
  return parseBillingPaymentsCycle(value);
}

export function parsePaymentSuccessState(
  value: string | null | undefined,
): PaymentSuccessState | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return isPaymentSuccessState(normalized) ? normalized : null;
}

export function parsePaymentSuccessAmountCents(
  value: string | null | undefined,
): number | null {
  if (!value) return null;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

/** Read success context from URL search params (client or RSC). */
export function parsePaymentSuccessQuery(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): PaymentSuccessQuery {
  const get = (key: string): string | null => {
    if (params instanceof URLSearchParams) {
      return params.get(key);
    }
    const raw = params[key];
    if (Array.isArray(raw)) return raw[0] ?? null;
    return raw ?? null;
  };

  return {
    plan: parsePaymentSuccessPlan(get("plan")),
    cycle: parsePaymentSuccessCycle(get("cycle")),
    intentId: get("intentId")?.trim() || null,
    amountCents: parsePaymentSuccessAmountCents(get("amountCents")),
    couponCode: get("coupon")?.trim() || null,
    state: parsePaymentSuccessState(get("state")),
  };
}

/** Deep link without plan is incomplete — redirect; do not invent success. */
export function hasPaymentSuccessContext(
  query: Pick<PaymentSuccessQuery, "plan">,
): boolean {
  return query.plan != null;
}

export function paymentSuccessPlanToAuth(
  plan: PaymentSuccessPlan,
): PlanTier {
  return billingPaymentsPlanToAuth(plan);
}

export function paymentSuccessPlanLabel(plan: PaymentSuccessPlan): string {
  return billingPaymentsPlanLabel(plan);
}

export function paymentSuccessCycleLabel(cycle: PaymentSuccessCycle): string {
  return checkoutCycleLabel(cycle);
}

export function paymentSuccessCreditsIncluded(
  plan: PaymentSuccessPlan,
): number {
  return billingPaymentsCreditsIncluded(plan);
}

/**
 * Mock available balance after purchase = plan monthly grant.
 * Production credits come from server/webhook — not this client path.
 */
export function mockPaymentSuccessTotalCredits(
  plan: PaymentSuccessPlan,
): number {
  return paymentSuccessCreditsIncluded(plan);
}

/** Mock human-readable ref — not a Stripe charge id. */
export function buildMockPaymentReference(
  intentId: string | null | undefined,
): string {
  if (intentId) {
    const short = intentId.replace(/^mock_pi_/, "").slice(0, 8).toUpperCase();
    if (short) return `${PAYMENT_SUCCESS_REF_PREFIX}-${short}`;
  }
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `${PAYMENT_SUCCESS_REF_PREFIX}-${rand}`;
}

export function paymentSuccessRenewalDate(
  cycle: PaymentSuccessCycle,
  from: Date = new Date(),
): Date {
  return mockCheckoutRenewalDate(cycle, from);
}

export function formatPaymentSuccessRenewalDate(
  cycle: PaymentSuccessCycle,
  from?: Date,
): string {
  return formatCheckoutRenewalDate(cycle, from);
}

export function formatPaymentSuccessMoney(cents: number): string {
  return formatBillingPaymentsMoney(cents);
}

export function formatPaymentSuccessCredits(credits: number): string {
  return formatBillingPaymentsCredits(credits);
}

export function resolvePaymentSuccessCoupon(
  code: string | null | undefined,
): BillingPaymentsAppliedCoupon | null {
  if (!code) return null;
  return lookupBillingPaymentsCoupon(code);
}

/** Build display model once plan is known. */
export function buildPaymentSuccessViewModel(input: {
  plan: PaymentSuccessPlan;
  cycle?: PaymentSuccessCycle;
  intentId?: string | null;
  amountCents?: number | null;
  couponCode?: string | null;
  from?: Date;
}): PaymentSuccessViewModel {
  const cycle = input.cycle ?? "monthly";
  const appliedCoupon = resolvePaymentSuccessCoupon(input.couponCode);
  const order = buildBillingPaymentsOrderSummary({
    plan: input.plan,
    cycle,
    coupon: appliedCoupon,
  });

  const amountPaidCents =
    input.amountCents != null && input.amountCents >= 0
      ? input.amountCents
      : order.totalDueCents;

  const renewalDate = paymentSuccessRenewalDate(cycle, input.from);
  const creditsAdded = order.creditsIncluded;

  return {
    plan: input.plan,
    cycle,
    planLabel: paymentSuccessPlanLabel(input.plan),
    cycleLabel: paymentSuccessCycleLabel(cycle),
    authTier: paymentSuccessPlanToAuth(input.plan),
    order,
    amountPaidCents,
    discountCents: order.couponDiscountCents + order.cycleDiscountCents,
    taxCents: order.taxCents,
    totalCents: amountPaidCents,
    currency: PAYMENT_SUCCESS_CURRENCY,
    creditsAdded,
    totalCreditsAvailable: mockPaymentSuccessTotalCredits(input.plan),
    renewalDate,
    renewalDateLabel: formatPaymentSuccessRenewalDate(cycle, input.from),
    paymentReference: buildMockPaymentReference(input.intentId),
    intentId: input.intentId ?? null,
    appliedCoupon,
  };
}

/** When query has a plan, prefer view model; otherwise null. */
export function buildPaymentSuccessViewModelFromQuery(
  query: PaymentSuccessQuery,
  from?: Date,
): PaymentSuccessViewModel | null {
  if (!query.plan) return null;
  return buildPaymentSuccessViewModel({
    plan: query.plan,
    cycle: query.cycle,
    intentId: query.intentId,
    amountCents: query.amountCents,
    couponCode: query.couponCode,
    from,
  });
}

export function buildPaymentSuccessHref(input?: {
  plan?: PaymentSuccessPlan;
  cycle?: PaymentSuccessCycle;
  intentId?: string | null;
  amountCents?: number;
  coupon?: string | null;
  state?: PaymentSuccessState;
}): string {
  const params = new URLSearchParams();
  if (input?.plan) params.set("plan", input.plan);
  if (input?.cycle) params.set("cycle", input.cycle);
  if (input?.intentId) params.set("intentId", input.intentId);
  if (input?.amountCents != null) {
    params.set("amountCents", String(input.amountCents));
  }
  if (input?.coupon) params.set("coupon", input.coupon);
  if (input?.state) params.set("state", input.state);
  const qs = params.toString();
  return qs ? `${PAYMENT_SUCCESS_ROUTE}?${qs}` : PAYMENT_SUCCESS_ROUTE;
}

export function paymentSuccessDashboardHref(): string {
  return PAYMENT_SUCCESS_DASHBOARD_ROUTE;
}

export function paymentSuccessInvoiceHref(): string {
  return PAYMENT_SUCCESS_INVOICE_HISTORY_ROUTE;
}

export function paymentSuccessNewAuditHref(): string {
  return PAYMENT_SUCCESS_NEW_AUDIT_ROUTE;
}
