/**
 * SCREEN-012 — Billing & Payments constants.
 * Checkout review — mock only; no Stripe / no gateway.
 */

export const BILLING_PAYMENTS_ROUTE = "/billing/checkout";

export const BILLING_PAYMENTS_STATES = [
  "loading",
  "success",
  "error",
  "empty",
] as const;

export type BillingPaymentsState = (typeof BILLING_PAYMENTS_STATES)[number];

/** Purchase targets — Free is not a checkout destination. */
export const BILLING_PAYMENTS_PLANS = ["pro", "business"] as const;

export type BillingPaymentsPlan = (typeof BILLING_PAYMENTS_PLANS)[number];

export const BILLING_PAYMENTS_PLAN_LABELS: Record<BillingPaymentsPlan, string> =
  {
    pro: "Pro",
    business: "Business",
  };

export const BILLING_PAYMENTS_CYCLES = ["monthly", "yearly"] as const;

export type BillingPaymentsCycle = (typeof BILLING_PAYMENTS_CYCLES)[number];

export const BILLING_PAYMENTS_CYCLE_LABELS: Record<
  BillingPaymentsCycle,
  string
> = {
  monthly: "Monthly",
  yearly: "Yearly",
};

/** Illustrative yearly savings — confirm absolute yearly prices before charging. */
export const BILLING_PAYMENTS_YEARLY_SAVE_PERCENT = 20;

export const BILLING_PAYMENTS_CURRENCY = "USD";

/** Display-only future methods — no integration this phase. */
export const BILLING_PAYMENTS_FUTURE_METHODS = [
  "Credit card",
  "Debit card",
  "Apple Pay",
  "Google Pay",
  "PayPal",
] as const;

export const BILLING_PAYMENTS_COPY = {
  title: "Billing & payments",
  subtitle: "Review your plan and complete checkout. No charge this phase.",
  breadcrumbDashboard: "Dashboard",
  breadcrumbMembership: "Manage membership",
  breadcrumbCurrent: "Billing & payments",
  selectedPlan: "Selected plan",
  changePlan: "Change plan",
  billingCycle: "Billing cycle",
  saveBadge: "Save {percent}%",
  orderSummary: "Order summary",
  planPrice: "Plan price",
  discount: "Discount",
  couponDiscount: "Coupon",
  taxes: "Taxes",
  creditsIncluded: "Credits included",
  total: "Total due",
  currency: "Currency",
  coupon: "Coupon code",
  couponPlaceholder: "Enter coupon code",
  applyCoupon: "Apply",
  removeCoupon: "Remove",
  couponApplied: "Coupon applied",
  couponInvalid: "Invalid coupon",
  couponEmpty: "Enter a coupon code",
  paymentMethod: "Payment method",
  paymentPlaceholder:
    "Payment methods (card, Apple Pay, Google Pay, PayPal) will be available at checkout. No card details are collected on this page.",
  paymentMethodsAria: "Payment methods available later",
  billingInformation: "Billing information",
  businessName: "Business name",
  billingAddress: "Billing address",
  country: "Country",
  taxId: "Tax ID (optional)",
  securityTitle: "Secure checkout",
  securitySsl: "Connections use TLS/SSL encryption.",
  securityPci:
    "Card details are not collected here. Future payments will use a PCI-compliant provider (e.g. Stripe Checkout).",
  proceed: "Proceed to checkout",
  processing: "Processing…",
  returnMembership: "Return to membership",
  emptyHeadline: "No plan selected",
  emptyDescription: "Choose Pro or Business on Manage membership to continue.",
  emptyCta: "Choose a plan",
  errorHeadline: "We couldn’t load checkout",
  errorDescription: "Please try again. You were not charged.",
  retry: "Retry",
  checkoutMockSuccess: "Mock checkout complete — no charge this phase.",
  guestRedirect: "Sign in to continue to billing.",
} as const;

/** Mock coupon codes (case-insensitive). */
export const BILLING_PAYMENTS_MOCK_COUPONS = {
  SAVE20: {
    code: "SAVE20",
    percentOff: 20,
    label: "20% off",
  },
  WELCOME: {
    code: "WELCOME",
    percentOff: 10,
    label: "10% off",
  },
} as const;

export type BillingPaymentsCouponCode =
  keyof typeof BILLING_PAYMENTS_MOCK_COUPONS;

export const BILLING_PAYMENTS_ANALYTICS_SOURCES = {
  page: "billing_payments",
  manageMembership: "billing_payments_from_membership",
  planComparison: "billing_payments_from_comparison",
} as const;
