/**
 * SCREEN-012 — Billing & Payments helpers.
 * Order totals, cycle math, coupons — no React / no Stripe.
 */

import {
  BILLING_PAYMENTS_COPY,
  BILLING_PAYMENTS_CURRENCY,
  BILLING_PAYMENTS_CYCLES,
  BILLING_PAYMENTS_MOCK_COUPONS,
  BILLING_PAYMENTS_PLAN_LABELS,
  BILLING_PAYMENTS_PLANS,
  BILLING_PAYMENTS_STATES,
  BILLING_PAYMENTS_YEARLY_SAVE_PERCENT,
  type BillingPaymentsCouponCode,
  type BillingPaymentsCycle,
  type BillingPaymentsPlan,
  type BillingPaymentsState,
} from "@/config/billing-payments";
import { formatPrice, PLANS, type PlanTier } from "@/config/plans";

export interface BillingPaymentsAppliedCoupon {
  code: BillingPaymentsCouponCode;
  percentOff: number;
  label: string;
}

export interface BillingPaymentsOrderSummary {
  plan: BillingPaymentsPlan;
  cycle: BillingPaymentsCycle;
  currency: typeof BILLING_PAYMENTS_CURRENCY;
  /** Full list for the cycle (monthly price, or 12× monthly for yearly). */
  listPriceCents: number;
  /** Yearly Save N% amount; 0 for monthly. */
  cycleDiscountCents: number;
  /** Amount after cycle discount, before coupon. */
  planPriceCents: number;
  /** Coupon percent of planPriceCents. */
  couponDiscountCents: number;
  /** Mock tax — $0 this phase. */
  taxCents: number;
  totalDueCents: number;
  creditsIncluded: number;
  appliedCoupon: BillingPaymentsAppliedCoupon | null;
}

export function isBillingPaymentsPlan(
  value: string | null | undefined,
): value is BillingPaymentsPlan {
  return (
    value != null &&
    (BILLING_PAYMENTS_PLANS as readonly string[]).includes(value)
  );
}

export function isBillingPaymentsCycle(
  value: string | null | undefined,
): value is BillingPaymentsCycle {
  return (
    value != null &&
    (BILLING_PAYMENTS_CYCLES as readonly string[]).includes(value)
  );
}

export function isBillingPaymentsState(
  value: string | null | undefined,
): value is BillingPaymentsState {
  return (
    value != null &&
    (BILLING_PAYMENTS_STATES as readonly string[]).includes(value)
  );
}

export function parseBillingPaymentsPlan(
  value: string | null | undefined,
): BillingPaymentsPlan | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return isBillingPaymentsPlan(normalized) ? normalized : null;
}

export function parseBillingPaymentsCycle(
  value: string | null | undefined,
): BillingPaymentsCycle {
  if (!value) return "monthly";
  const normalized = value.trim().toLowerCase();
  return isBillingPaymentsCycle(normalized) ? normalized : "monthly";
}

export function parseBillingPaymentsState(
  value: string | null | undefined,
): BillingPaymentsState | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return isBillingPaymentsState(normalized) ? normalized : null;
}

export function billingPaymentsPlanToAuth(
  plan: BillingPaymentsPlan,
): PlanTier {
  return plan === "business" ? "ENTERPRISE" : "PRO";
}

export function billingPaymentsPlanLabel(plan: BillingPaymentsPlan): string {
  return BILLING_PAYMENTS_PLAN_LABELS[plan];
}

export function billingPaymentsMonthlyCents(
  plan: BillingPaymentsPlan,
): number {
  return PLANS[billingPaymentsPlanToAuth(plan)].priceMonthlyCents;
}

export function billingPaymentsCreditsIncluded(
  plan: BillingPaymentsPlan,
): number {
  return PLANS[billingPaymentsPlanToAuth(plan)].monthlyCredits;
}

/** Yearly list = 12 × monthly (before Save %). */
export function billingPaymentsYearlyListCents(
  plan: BillingPaymentsPlan,
): number {
  return billingPaymentsMonthlyCents(plan) * 12;
}

/** Illustrative yearly billed amount after Save %. */
export function billingPaymentsYearlyBilledCents(
  plan: BillingPaymentsPlan,
): number {
  const list = billingPaymentsYearlyListCents(plan);
  const save = BILLING_PAYMENTS_YEARLY_SAVE_PERCENT;
  return Math.round((list * (100 - save)) / 100);
}

export function billingPaymentsYearlyDiscountCents(
  plan: BillingPaymentsPlan,
): number {
  return (
    billingPaymentsYearlyListCents(plan) -
    billingPaymentsYearlyBilledCents(plan)
  );
}

export function billingPaymentsSaveBadgeLabel(
  percent: number = BILLING_PAYMENTS_YEARLY_SAVE_PERCENT,
): string {
  return BILLING_PAYMENTS_COPY.saveBadge.replace("{percent}", String(percent));
}

export function normalizeCouponInput(raw: string): string {
  return raw.trim().toUpperCase();
}

export function lookupBillingPaymentsCoupon(
  raw: string,
): BillingPaymentsAppliedCoupon | null {
  const code = normalizeCouponInput(raw);
  if (!code) return null;
  const entry =
    BILLING_PAYMENTS_MOCK_COUPONS[
      code as BillingPaymentsCouponCode
    ];
  if (!entry) return null;
  return {
    code: entry.code as BillingPaymentsCouponCode,
    percentOff: entry.percentOff,
    label: entry.label,
  };
}

export type CouponApplyResult =
  | { ok: true; coupon: BillingPaymentsAppliedCoupon }
  | { ok: false; error: "empty" | "invalid" };

export function applyBillingPaymentsCoupon(raw: string): CouponApplyResult {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, error: "empty" };
  const coupon = lookupBillingPaymentsCoupon(trimmed);
  if (!coupon) return { ok: false, error: "invalid" };
  return { ok: true, coupon };
}

export function couponApplyErrorMessage(
  error: "empty" | "invalid",
): string {
  if (error === "empty") return BILLING_PAYMENTS_COPY.couponEmpty;
  return BILLING_PAYMENTS_COPY.couponInvalid;
}

function couponDiscountFromPlanPrice(
  planPriceCents: number,
  coupon: BillingPaymentsAppliedCoupon | null,
): number {
  if (!coupon || planPriceCents <= 0) return 0;
  return Math.round((planPriceCents * coupon.percentOff) / 100);
}

export function buildBillingPaymentsOrderSummary(input: {
  plan: BillingPaymentsPlan;
  cycle: BillingPaymentsCycle;
  coupon?: BillingPaymentsAppliedCoupon | null;
}): BillingPaymentsOrderSummary {
  const { plan, cycle } = input;
  const coupon = input.coupon ?? null;

  const listPriceCents =
    cycle === "yearly"
      ? billingPaymentsYearlyListCents(plan)
      : billingPaymentsMonthlyCents(plan);

  const cycleDiscountCents =
    cycle === "yearly" ? billingPaymentsYearlyDiscountCents(plan) : 0;

  const planPriceCents = listPriceCents - cycleDiscountCents;
  const couponDiscountCents = couponDiscountFromPlanPrice(
    planPriceCents,
    coupon,
  );
  const taxCents = 0;
  const totalDueCents = Math.max(
    0,
    planPriceCents - couponDiscountCents + taxCents,
  );

  return {
    plan,
    cycle,
    currency: BILLING_PAYMENTS_CURRENCY,
    listPriceCents,
    cycleDiscountCents,
    planPriceCents,
    couponDiscountCents,
    taxCents,
    totalDueCents,
    creditsIncluded: billingPaymentsCreditsIncluded(plan),
    appliedCoupon: coupon,
  };
}

export function formatBillingPaymentsMoney(cents: number): string {
  return formatPrice(cents);
}

export function formatBillingPaymentsCredits(credits: number): string {
  return credits.toLocaleString();
}

export function billingPaymentsCyclePriceLabel(
  plan: BillingPaymentsPlan,
  cycle: BillingPaymentsCycle,
): string {
  if (cycle === "yearly") {
    return `${formatPrice(billingPaymentsYearlyBilledCents(plan))}/yr`;
  }
  return `${formatPrice(billingPaymentsMonthlyCents(plan))}/mo`;
}
