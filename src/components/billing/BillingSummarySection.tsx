"use client";

import { BillingSummary } from "@/components/billing/BillingSummary";
import type { BillingSummaryState } from "@/config/billing-summary";
import type {
  ManageMembershipBillingCycle,
  ManageMembershipPlan,
  ManageMembershipStatus,
} from "@/config/manage-membership";

export type BillingSummarySectionProps = {
  plan: ManageMembershipPlan;
  paymentMethodLabel?: string | null;
  nextBillingDate?: string | Date | null;
  subscriptionCostLabel: string;
  billingCycle?: ManageMembershipBillingCycle;
  status?: ManageMembershipStatus;
  hasInvoices?: boolean;
  loading?: boolean;
  error?: boolean;
  onManageBilling?: () => void;
  onInvoiceHistory?: () => void;
  onAddPaymentMethod?: () => void;
  onRetry?: () => void;
  className?: string;
};

/**
 * SCREEN-011 — Billing Summary section.
 * Thin adapter over COMPONENT-036 BillingSummary (placeholders — no Stripe).
 */
export function BillingSummarySection({
  plan,
  paymentMethodLabel = null,
  nextBillingDate = null,
  subscriptionCostLabel,
  billingCycle = "monthly",
  status = "active",
  hasInvoices = false,
  loading = false,
  error = false,
  onManageBilling,
  onInvoiceHistory,
  onAddPaymentMethod,
  onRetry,
  className,
}: BillingSummarySectionProps) {
  const state = resolveBillingSummaryState({ loading, error, status });

  return (
    <BillingSummary
      id="manage-membership-billing"
      state={state}
      plan={plan}
      billingCycle={billingCycle}
      renewalDate={nextBillingDate}
      currentPrice={subscriptionCostLabel}
      paymentMethodLabel={paymentMethodLabel}
      hasInvoices={hasInvoices}
      onManageBilling={onManageBilling}
      onInvoiceHistory={onInvoiceHistory}
      onManagePayment={onAddPaymentMethod}
      onRetry={onRetry}
      className={className}
    />
  );
}

function resolveBillingSummaryState(input: {
  loading: boolean;
  error: boolean;
  status: ManageMembershipStatus;
}): BillingSummaryState {
  if (input.loading) return "loading";
  if (input.error) return "error";
  if (input.status === "expired" || input.status === "past_due") {
    return "expired";
  }
  return "success";
}
