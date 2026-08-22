/**
 * SCREEN-016 — Payment Failure constants.
 * Mock decline surface after processing — no Stripe / no entitlements / no charge.
 */

import { PAYMENT_FAILURE_ROUTE as FAILURE_ROUTE } from "@/config/payment-processing";

export const PAYMENT_FAILURE_ROUTE = FAILURE_ROUTE;

/** User requirement: Back to Billing → Manage Membership home. */
export const PAYMENT_FAILURE_BILLING_ROUTE = "/billing";

/** Change Payment Method → payment method section on Billing & Payments. */
export const PAYMENT_FAILURE_CHANGE_METHOD_ROUTE = "/billing/checkout";

/** Hash target for payment method block (wire BillingPayments if missing). */
export const PAYMENT_FAILURE_PAYMENT_METHOD_HASH = "payment-method";

/** Try Again re-enters Checkout; user must Pay Now again (new intent later). */
export const PAYMENT_FAILURE_RETRY_CHECKOUT_ROUTE = "/checkout";

export const PAYMENT_FAILURE_STATES = [
  "loading",
  "failure",
  "retrying",
  "error",
] as const;

export type PaymentFailureState = (typeof PAYMENT_FAILURE_STATES)[number];

export const PAYMENT_FAILURE_PLANS = ["pro", "business"] as const;

export type PaymentFailurePlan = (typeof PAYMENT_FAILURE_PLANS)[number];

export const PAYMENT_FAILURE_CYCLES = ["monthly", "yearly"] as const;

export type PaymentFailureCycle = (typeof PAYMENT_FAILURE_CYCLES)[number];

/**
 * Controlled friendly reasons only — never raw gateway dumps.
 * Mock now; map from provider codes later.
 */
export const PAYMENT_FAILURE_REASONS = [
  "declined",
  "method_unavailable",
  "network",
  "timeout",
  "session_expired",
  "unknown",
] as const;

export type PaymentFailureReason = (typeof PAYMENT_FAILURE_REASONS)[number];

export const PAYMENT_FAILURE_DEFAULT_REASON: PaymentFailureReason = "declined";

export const PAYMENT_FAILURE_REASON_LABELS: Record<
  PaymentFailureReason,
  string
> = {
  declined: "Payment declined",
  method_unavailable: "Payment method unavailable",
  network: "Network error",
  timeout: "Payment timeout",
  session_expired: "Session expired",
  unknown: "Unknown error",
};

export const PAYMENT_FAILURE_RECOMMENDED_ACTIONS: Record<
  PaymentFailureReason,
  string
> = {
  declined: "Try another card or payment method.",
  method_unavailable:
    "Choose a different payment method, then try payment again.",
  network: "Check your connection and try again.",
  timeout: "The request took too long. Try again when ready.",
  session_expired: "Sign in again, then return to checkout to pay.",
  unknown: "Try again, or go back to billing and start over.",
};

export const PAYMENT_FAILURE_CURRENCY = "USD";

export const PAYMENT_FAILURE_COPY = {
  title: "Payment Could Not Be Completed",
  subtitle:
    "We couldn't complete your payment. Your subscription has not been activated.",
  reasonLabel: "Reason",
  recommendedAction: "Recommended action",
  orderSummary: "Order summary",
  plan: "Plan",
  billingCycle: "Billing cycle",
  amount: "Amount",
  creditsIncluded: "Credits included",
  tryAgain: "Try Again",
  changePaymentMethod: "Change Payment Method",
  backToBilling: "Back to Billing",
  retry: "Retry",
  retryingLabel: "Starting payment again…",
  loadingLabel: "Loading payment details",
  errorHeadline: "We couldn’t load this payment failure",
  errorDescription:
    "You were not charged. Return to Billing or retry loading this page.",
  guestRedirect: "Sign in to view payment status.",
  emptyRedirect: "Return to Billing — no failed payment found.",
  notChargedHint: "You have not been charged for this attempt.",
} as const;

export const PAYMENT_FAILURE_ANALYTICS_SOURCES = {
  page: "payment_failure",
  processing: "payment_failure_from_processing",
} as const;
