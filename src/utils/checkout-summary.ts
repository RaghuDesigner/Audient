/**
 * COMPONENT — Checkout Summary helpers.
 * Price / credits / renewal labels — no React / no Stripe.
 */

import {
  CHECKOUT_SUMMARY_COPY,
  CHECKOUT_SUMMARY_CYCLE_LABELS,
  CHECKOUT_SUMMARY_CURRENCY,
  CHECKOUT_SUMMARY_PLAN_LABELS,
  type CheckoutSummaryCycle,
  type CheckoutSummaryPlan,
  type CheckoutSummaryState,
  type CheckoutSummaryVariant,
} from "@/config/checkout-summary";
import { formatPrice, PLANS, type PlanTier } from "@/config/plans";
import {
  billingPaymentsCyclePriceLabel,
  billingPaymentsCreditsIncluded,
} from "@/utils/billing-payments";
import { formatAuditDate } from "@/utils/recent-audit";

export function checkoutSummaryPlanToAuth(
  plan: CheckoutSummaryPlan,
): PlanTier {
  if (plan === "business") return "ENTERPRISE";
  if (plan === "pro") return "PRO";
  return "FREE";
}

export function checkoutSummaryPlanLabel(plan: CheckoutSummaryPlan): string {
  return CHECKOUT_SUMMARY_PLAN_LABELS[plan];
}

export function checkoutSummaryCycleLabel(
  cycle: CheckoutSummaryCycle,
): string {
  return CHECKOUT_SUMMARY_CYCLE_LABELS[cycle];
}

export function checkoutSummaryCreditsIncluded(
  plan: CheckoutSummaryPlan,
): number {
  if (plan === "free") {
    return PLANS.FREE.monthlyCredits;
  }
  return billingPaymentsCreditsIncluded(plan);
}

export function checkoutSummaryFeatureBullets(
  plan: CheckoutSummaryPlan,
): string[] {
  return [...PLANS[checkoutSummaryPlanToAuth(plan)].features];
}

/** Unit price for cycle — aligns with Billing & Payments / Order Summary. */
export function checkoutSummaryPriceLabel(
  plan: CheckoutSummaryPlan,
  cycle: CheckoutSummaryCycle = "monthly",
): string {
  if (plan === "free") {
    return `${formatPrice(0)}/mo`;
  }
  return billingPaymentsCyclePriceLabel(plan, cycle);
}

export function checkoutSummaryCurrencyLabel(
  currency: string = CHECKOUT_SUMMARY_CURRENCY,
): string {
  return currency;
}

export function formatCheckoutSummaryCredits(credits: number): string {
  return credits.toLocaleString();
}

export function formatCheckoutSummaryRenewal(input: {
  state: CheckoutSummaryState;
  renewalDateLabel?: string | null;
  renewalDate?: string | Date | null;
  plan: CheckoutSummaryPlan;
}): string {
  if (input.renewalDateLabel) return input.renewalDateLabel;

  if (input.state === "cancelled") {
    if (input.renewalDate != null) {
      return `${CHECKOUT_SUMMARY_COPY.endsDate} ${formatAuditDate(input.renewalDate)}`;
    }
    return CHECKOUT_SUMMARY_COPY.cancelled;
  }

  if (input.state === "expired") {
    if (input.renewalDate != null) {
      return formatAuditDate(input.renewalDate);
    }
    return CHECKOUT_SUMMARY_COPY.expired;
  }

  if (input.plan === "free") {
    return CHECKOUT_SUMMARY_COPY.freeRenewalHint;
  }

  if (input.renewalDate != null) {
    return formatAuditDate(input.renewalDate);
  }

  return "—";
}

export function checkoutSummaryStatusDetail(
  state: CheckoutSummaryState,
): string | null {
  if (state === "cancelled") return CHECKOUT_SUMMARY_COPY.cancelledDetail;
  if (state === "expired") return CHECKOUT_SUMMARY_COPY.expiredDetail;
  return null;
}

export function shouldShowCheckoutSummaryFeatures(
  variant: CheckoutSummaryVariant,
  features: readonly string[] | null | undefined,
): boolean {
  if (!features || features.length === 0) return false;
  if (variant === "invoice" || variant === "compact") return false;
  return true;
}

export function shouldShowCheckoutSummaryResubscribe(
  state: CheckoutSummaryState,
  onResubscribe?: (() => void) | null,
): boolean {
  if (!onResubscribe) return false;
  return state === "cancelled" || state === "expired";
}

export function buildCheckoutSummaryAnnouncement(input: {
  plan: CheckoutSummaryPlan;
  cycle: CheckoutSummaryCycle;
  priceLabel: string;
  credits: number;
  renewalLabel: string;
  state: CheckoutSummaryState;
}): string {
  const parts = [
    `${checkoutSummaryPlanLabel(input.plan)} plan`,
    `billed ${checkoutSummaryCycleLabel(input.cycle).toLowerCase()}`,
    input.priceLabel,
    `${formatCheckoutSummaryCredits(input.credits)} credits`,
    input.renewalLabel,
  ];

  if (input.state === "cancelled") {
    parts.push(CHECKOUT_SUMMARY_COPY.cancelled);
  } else if (input.state === "expired") {
    parts.push(CHECKOUT_SUMMARY_COPY.expired);
  }

  return parts.filter(Boolean).join(", ");
}
