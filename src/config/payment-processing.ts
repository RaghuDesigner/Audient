/**
 * SCREEN-014 — Payment Processing constants.
 * Mock payment wait surface — no Stripe / no gateway / no entitlements.
 */

export const PAYMENT_PROCESSING_ROUTE = "/payment/processing";

export const PAYMENT_SUCCESS_ROUTE = "/payment-success";

export const PAYMENT_FAILURE_ROUTE = "/payment-failure";

export const PAYMENT_PROCESSING_STATES = [
  "processing",
  "success",
  "failure",
  "timeout",
] as const;

export type PaymentProcessingState =
  (typeof PAYMENT_PROCESSING_STATES)[number];

/** Mock outcome for local/dev — never a real charge. */
export const PAYMENT_PROCESSING_RESULTS = [
  "success",
  "failure",
  "timeout",
] as const;

export type PaymentProcessingResult =
  (typeof PAYMENT_PROCESSING_RESULTS)[number];

export const PAYMENT_PROCESSING_PLANS = ["pro", "business"] as const;

export type PaymentProcessingPlan =
  (typeof PAYMENT_PROCESSING_PLANS)[number];

export const PAYMENT_PROCESSING_CYCLES = ["monthly", "yearly"] as const;

export type PaymentProcessingCycle =
  (typeof PAYMENT_PROCESSING_CYCLES)[number];

/** Default mock processing delay (ms) — long enough to see UI. */
export const PAYMENT_PROCESSING_DEFAULT_DELAY_MS = 3_000;

/** Mock timeout threshold (ms) — no auto-success after this. */
export const PAYMENT_PROCESSING_TIMEOUT_MS = 12_000;

export const PAYMENT_PROCESSING_CURRENCY = "USD";

export const PAYMENT_PROCESSING_COPY = {
  title: "Payment processing",
  primaryMessage: "Processing your payment...",
  supportingMessage:
    "Please don't close this window or refresh the page.",
  securityMessage: "Your payment is being processed securely.",
  statusProcessing: "Processing",
  statusConfirming: "Confirming payment",
  statusFinalizing: "Finalizing",
  timeoutHeadline: "This is taking longer than expected",
  timeoutDescription:
    "We couldn’t confirm your payment yet. You were not charged for this mock attempt. Retry or return to checkout.",
  retry: "Retry",
  backToCheckout: "Back to checkout",
  guestRedirect: "Sign in to continue payment processing.",
  emptyRedirect: "Start checkout again to complete payment.",
  inProgressNavHint: "Payment is in progress.",
} as const;

export const PAYMENT_PROCESSING_ANALYTICS_SOURCES = {
  page: "payment_processing",
  checkout: "payment_processing_from_checkout",
} as const;
