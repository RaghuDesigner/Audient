/**
 * SCREEN-013 — Checkout helpers.
 * Renewal mock, terms gate, QA params — no React / no Stripe.
 */

import {
  CHECKOUT_BILLING_ROUTE,
  CHECKOUT_CYCLE_LABELS,
  CHECKOUT_PLAN_LABELS,
  CHECKOUT_ROUTE,
  CHECKOUT_STATES,
  type CheckoutCycle,
  type CheckoutPlan,
  type CheckoutState,
} from "@/config/checkout";
import {
  billingPaymentsCreditsIncluded,
  parseBillingPaymentsCycle,
  parseBillingPaymentsPlan,
} from "@/utils/billing-payments";
import { canEnablePayWithTerms } from "@/utils/terms-checkbox";
import { formatAuditDate } from "@/utils/recent-audit";

export function isCheckoutState(
  value: string | null | undefined,
): value is CheckoutState {
  return (
    value != null && (CHECKOUT_STATES as readonly string[]).includes(value)
  );
}

export function parseCheckoutPlan(
  value: string | null | undefined,
): CheckoutPlan | null {
  return parseBillingPaymentsPlan(value);
}

export function parseCheckoutCycle(
  value: string | null | undefined,
): CheckoutCycle {
  return parseBillingPaymentsCycle(value);
}

export function parseCheckoutState(
  value: string | null | undefined,
): CheckoutState | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return isCheckoutState(normalized) ? normalized : null;
}

export function checkoutPlanLabel(plan: CheckoutPlan): string {
  return CHECKOUT_PLAN_LABELS[plan];
}

export function checkoutCycleLabel(cycle: CheckoutCycle): string {
  return CHECKOUT_CYCLE_LABELS[cycle];
}

export function checkoutCreditsIncluded(plan: CheckoutPlan): number {
  return billingPaymentsCreditsIncluded(plan);
}

/** Mock next renewal from “now” for selected cycle. */
export function mockCheckoutRenewalDate(
  cycle: CheckoutCycle,
  from: Date = new Date(),
): Date {
  const next = new Date(from.getTime());
  if (cycle === "yearly") {
    next.setFullYear(next.getFullYear() + 1);
  } else {
    next.setMonth(next.getMonth() + 1);
  }
  return next;
}

export function formatCheckoutRenewalDate(
  cycle: CheckoutCycle,
  from?: Date,
): string {
  return formatAuditDate(mockCheckoutRenewalDate(cycle, from));
}

/** Pay Now enabled only when terms accepted and not processing. */
export function canCheckoutPayNow(input: {
  termsAccepted: boolean;
  processing?: boolean;
  state?: CheckoutState;
}): boolean {
  if (input.state === "loading" || input.state === "error") return false;
  return canEnablePayWithTerms({
    termsAccepted: input.termsAccepted,
    processing: input.processing,
  });
}

export function buildCheckoutHref(input: {
  plan: CheckoutPlan;
  cycle?: CheckoutCycle;
  state?: CheckoutState;
  coupon?: string | null;
}): string {
  const params = new URLSearchParams();
  params.set("plan", input.plan);
  params.set("cycle", input.cycle ?? "monthly");
  if (input.state) params.set("state", input.state);
  if (input.coupon) params.set("coupon", input.coupon);
  return `${CHECKOUT_ROUTE}?${params.toString()}`;
}

export function buildCheckoutBillingHref(input?: {
  plan?: CheckoutPlan | null;
  cycle?: CheckoutCycle;
}): string {
  const params = new URLSearchParams();
  if (input?.plan) params.set("plan", input.plan);
  if (input?.cycle) params.set("cycle", input.cycle);
  const qs = params.toString();
  return qs ? `${CHECKOUT_BILLING_ROUTE}?${qs}` : CHECKOUT_BILLING_ROUTE;
}

export function formatCheckoutCredits(credits: number): string {
  return credits.toLocaleString();
}
