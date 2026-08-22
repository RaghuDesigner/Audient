/**
 * COMPONENT-036 — Billing Summary constants.
 * Copy, UI states, plans — no UI / no Stripe.
 */

export const BILLING_SUMMARY_STATES = [
  "loading",
  "success",
  "error",
  "expired",
] as const;

export type BillingSummaryState = (typeof BILLING_SUMMARY_STATES)[number];

export const BILLING_SUMMARY_PLANS = ["free", "pro", "business"] as const;

export type BillingSummaryPlan = (typeof BILLING_SUMMARY_PLANS)[number];

export const BILLING_SUMMARY_PLAN_LABELS: Record<BillingSummaryPlan, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business",
};

export const BILLING_SUMMARY_BILLING_CYCLES = ["monthly", "yearly"] as const;

export type BillingSummaryBillingCycle =
  (typeof BILLING_SUMMARY_BILLING_CYCLES)[number];

export const BILLING_SUMMARY_BILLING_CYCLE_LABELS: Record<
  BillingSummaryBillingCycle,
  string
> = {
  monthly: "Monthly",
  yearly: "Yearly",
};

export const BILLING_SUMMARY_VARIANTS = ["default", "compact"] as const;

export type BillingSummaryVariant =
  (typeof BILLING_SUMMARY_VARIANTS)[number];

export const BILLING_SUMMARY_COPY = {
  title: "Billing summary",
  currentPlan: "Current plan",
  renewalDate: "Renewal date",
  nextBillingDate: "Next billing date",
  currentPrice: "Current price",
  billingCycle: "Billing cycle",
  paymentMethod: "Payment method",
  noPaymentMethod: "No payment method on file",
  addPaymentMethod: "Add payment method",
  invoiceHistory: "Invoice history",
  manageBilling: "Manage billing",
  managePayment: "Update payment method",
  freeRenewalHint: "No billing date on Free",
  retry: "Retry",
  errorHeadline: "We couldn’t load billing",
  errorDescription: "Please try again. Your payment method was not changed.",
  expiredDetail:
    "Your subscription has lapsed. Resubscribe or upgrade to restore billing.",
  invoicesSoon: "Invoice history coming soon.",
  billingPortalSoon: "Billing portal coming soon.",
  invoicesEmpty: "No invoices yet.",
} as const;

export const BILLING_SUMMARY_ANALYTICS_SOURCES = {
  summary: "billing_summary",
  invoiceHistory: "billing_summary_invoices",
  managePayment: "billing_summary_payment",
  manageBilling: "billing_summary_manage",
  retry: "billing_summary_retry",
} as const;
