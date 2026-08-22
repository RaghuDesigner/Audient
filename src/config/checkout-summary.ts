/**
 * COMPONENT — Checkout Summary constants.
 * Selected / purchased plan snapshot — no UI / no Stripe.
 * @see docs/components/COMPONENT_CHECKOUT_SUMMARY.md
 */

export const CHECKOUT_SUMMARY_STATES = [
  "default",
  "loading",
  "error",
  "cancelled",
  "expired",
] as const;

export type CheckoutSummaryState = (typeof CHECKOUT_SUMMARY_STATES)[number];

export const CHECKOUT_SUMMARY_PLANS = ["free", "pro", "business"] as const;

export type CheckoutSummaryPlan = (typeof CHECKOUT_SUMMARY_PLANS)[number];

export const CHECKOUT_SUMMARY_PLAN_LABELS: Record<CheckoutSummaryPlan, string> =
  {
    free: "Free",
    pro: "Pro",
    business: "Business",
  };

export const CHECKOUT_SUMMARY_CYCLES = ["monthly", "yearly"] as const;

export type CheckoutSummaryCycle = (typeof CHECKOUT_SUMMARY_CYCLES)[number];

export const CHECKOUT_SUMMARY_CYCLE_LABELS: Record<
  CheckoutSummaryCycle,
  string
> = {
  monthly: "Monthly",
  yearly: "Yearly",
};

export const CHECKOUT_SUMMARY_VARIANTS = [
  "default",
  "compact",
  "invoice",
] as const;

export type CheckoutSummaryVariant =
  (typeof CHECKOUT_SUMMARY_VARIANTS)[number];

export const CHECKOUT_SUMMARY_CONTEXTS = [
  "checkout",
  "payment_success",
  "invoice",
  "billing_history",
] as const;

export type CheckoutSummaryContext =
  (typeof CHECKOUT_SUMMARY_CONTEXTS)[number];

export const CHECKOUT_SUMMARY_CURRENCY = "USD";

export const CHECKOUT_SUMMARY_COPY = {
  title: "Checkout summary",
  selectedPlan: "Selected plan",
  billingCycle: "Billing cycle",
  price: "Price",
  currency: "Currency",
  creditsIncluded: "Credits included",
  includedFeatures: "Included features",
  renewalDate: "Renewal date",
  endsDate: "Ends",
  cancelled: "Cancelled",
  expired: "Expired",
  cancelledDetail: "This subscription is cancelled.",
  expiredDetail: "This subscription has expired.",
  freeRenewalHint: "No renewal on Free",
  retry: "Retry",
  resubscribe: "Resubscribe",
  errorHeadline: "We couldn’t load this plan summary",
  errorDescription: "Please try again. You were not charged.",
  loadingLabel: "Loading checkout summary",
} as const;

export const CHECKOUT_SUMMARY_ANALYTICS_SOURCES = {
  component: "checkout_summary",
  retry: "checkout_summary_retry",
  resubscribe: "checkout_summary_resubscribe",
} as const;
