/**
 * COMPONENT-036 — Billing Summary helpers.
 * Price / cycle labels from plans.ts — no React / no Stripe.
 */

import {
  BILLING_SUMMARY_BILLING_CYCLE_LABELS,
  BILLING_SUMMARY_COPY,
  BILLING_SUMMARY_PLAN_LABELS,
  type BillingSummaryBillingCycle,
  type BillingSummaryPlan,
  type BillingSummaryState,
} from "@/config/billing-summary";
import { formatPrice, PLANS, type PlanTier } from "@/config/plans";
import { formatAuditDate } from "@/utils/recent-audit";

export function billingSummaryPlanToAuth(plan: BillingSummaryPlan): PlanTier {
  if (plan === "business") return "ENTERPRISE";
  if (plan === "pro") return "PRO";
  return "FREE";
}

export function billingSummaryPlanLabel(plan: BillingSummaryPlan): string {
  return BILLING_SUMMARY_PLAN_LABELS[plan];
}

export function billingSummaryCycleLabel(
  cycle: BillingSummaryBillingCycle,
): string {
  return BILLING_SUMMARY_BILLING_CYCLE_LABELS[cycle];
}

export function billingSummaryPriceLabel(
  plan: BillingSummaryPlan,
  cycle: BillingSummaryBillingCycle = "monthly",
): string {
  void cycle; // yearly not confirmed in PRICING.md yet
  const cents = PLANS[billingSummaryPlanToAuth(plan)].priceMonthlyCents;
  return `${formatPrice(cents)}/mo`;
}

export function formatBillingSummaryRenewal(
  plan: BillingSummaryPlan,
  renewalDate?: string | Date | null,
): string {
  if (plan === "free") {
    return renewalDate
      ? formatAuditDate(renewalDate)
      : BILLING_SUMMARY_COPY.freeRenewalHint;
  }
  if (renewalDate == null) return "—";
  return formatAuditDate(renewalDate);
}

export function billingSummaryPaymentDisplay(
  plan: BillingSummaryPlan,
  paymentMethodLabel?: string | null,
): { kind: "label" | "empty" | "add"; text: string } {
  if (paymentMethodLabel) {
    return { kind: "label", text: paymentMethodLabel };
  }
  if (plan === "free") {
    return { kind: "empty", text: BILLING_SUMMARY_COPY.noPaymentMethod };
  }
  return { kind: "add", text: BILLING_SUMMARY_COPY.addPaymentMethod };
}

export function billingSummaryStatusDetail(
  state: BillingSummaryState,
  custom?: string | null,
): string | null {
  if (custom) return custom;
  if (state === "expired") return BILLING_SUMMARY_COPY.expiredDetail;
  if (state === "error") return BILLING_SUMMARY_COPY.errorDescription;
  return null;
}

export function shouldShowBillingSummaryManagePayment(
  plan: BillingSummaryPlan,
  state: Exclude<BillingSummaryState, "loading">,
): boolean {
  if (state === "error") return false;
  return plan === "pro" || plan === "business" || state === "expired";
}

export function resolveBillingSummaryPrice(
  plan: BillingSummaryPlan,
  currentPrice?: string | number | null,
  cycle: BillingSummaryBillingCycle = "monthly",
): string {
  if (currentPrice == null) return billingSummaryPriceLabel(plan, cycle);
  if (typeof currentPrice === "number") {
    return `${formatPrice(currentPrice)}/mo`;
  }
  return currentPrice;
}
