/**
 * SCREEN-015 — Payment Success constants.
 * Mock confirmation after processing — no Stripe / no entitlements server-side.
 */

import { INVOICE_HISTORY_ROUTE } from "@/config/invoice-history";
import { PAYMENT_SUCCESS_ROUTE as SUCCESS_ROUTE } from "@/config/payment-processing";

export const PAYMENT_SUCCESS_ROUTE = SUCCESS_ROUTE;

export const PAYMENT_SUCCESS_DASHBOARD_ROUTE = "/dashboard";

export const PAYMENT_SUCCESS_INVOICE_HISTORY_ROUTE = INVOICE_HISTORY_ROUTE;

/** Existing authenticated home / audit start surface. */
export const PAYMENT_SUCCESS_NEW_AUDIT_ROUTE = "/dashboard";

export const PAYMENT_SUCCESS_STATES = [
  "loading",
  "success",
  "error",
] as const;

export type PaymentSuccessState = (typeof PAYMENT_SUCCESS_STATES)[number];

export const PAYMENT_SUCCESS_PLANS = ["pro", "business"] as const;

export type PaymentSuccessPlan = (typeof PAYMENT_SUCCESS_PLANS)[number];

export const PAYMENT_SUCCESS_CYCLES = ["monthly", "yearly"] as const;

export type PaymentSuccessCycle = (typeof PAYMENT_SUCCESS_CYCLES)[number];

/** Mock payment reference prefix — not a Stripe charge id. */
export const PAYMENT_SUCCESS_REF_PREFIX = "AUD-PAY";

export const PAYMENT_SUCCESS_CURRENCY = "USD";

export const PAYMENT_SUCCESS_COPY = {
  title: "Payment Successful",
  subtitle: "Your Audient subscription is now active.",
  statusActive: "Active",
  subscriptionSummary: "Subscription summary",
  paymentSummary: "Payment summary",
  plan: "Plan",
  billingCycle: "Billing cycle",
  subscriptionStatus: "Status",
  creditsIncluded: "Credits included",
  renewalDate: "Renewal date",
  nextBillingDate: "Next billing date",
  amountPaid: "Amount paid",
  discount: "Discount",
  tax: "Tax",
  total: "Total",
  currency: "Currency",
  paymentReference: "Payment reference",
  creditsAdded: "Credits added",
  totalCredits: "Total available credits",
  goToDashboard: "Go to Dashboard",
  viewInvoice: "View Invoice",
  startNewAudit: "Start New Audit",
  retry: "Retry",
  errorHeadline: "We couldn’t load your confirmation",
  errorDescription:
    "Your payment may still have succeeded. Go to Dashboard or retry loading this summary.",
  loadingLabel: "Loading payment confirmation",
  guestRedirect: "Sign in to view payment confirmation.",
  emptyRedirect: "Return to Dashboard — no completed payment found.",
} as const;

export const PAYMENT_SUCCESS_ANALYTICS_SOURCES = {
  page: "payment_success",
  processing: "payment_success_from_processing",
} as const;
