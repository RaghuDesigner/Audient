/**
 * SCREEN-013 — Checkout constants.
 * Final confirmation before pay — mock only; no Stripe / no gateway.
 */

import {
  BILLING_PAYMENTS_CYCLE_LABELS,
  BILLING_PAYMENTS_CYCLES,
  BILLING_PAYMENTS_PLAN_LABELS,
  BILLING_PAYMENTS_PLANS,
  BILLING_PAYMENTS_ROUTE,
  type BillingPaymentsCycle,
  type BillingPaymentsPlan,
} from "@/config/billing-payments";

export const CHECKOUT_ROUTE = "/checkout";

/** Prior step — Back to Billing / empty-context redirect. */
export const CHECKOUT_BILLING_ROUTE = BILLING_PAYMENTS_ROUTE;

export const CHECKOUT_STATES = ["loading", "success", "error"] as const;

export type CheckoutState = (typeof CHECKOUT_STATES)[number];

export const CHECKOUT_PLANS = BILLING_PAYMENTS_PLANS;
export type CheckoutPlan = BillingPaymentsPlan;

export const CHECKOUT_PLAN_LABELS = BILLING_PAYMENTS_PLAN_LABELS;

export const CHECKOUT_CYCLES = BILLING_PAYMENTS_CYCLES;
export type CheckoutCycle = BillingPaymentsCycle;

export const CHECKOUT_CYCLE_LABELS = BILLING_PAYMENTS_CYCLE_LABELS;

export const CHECKOUT_LEGAL = {
  termsHref: "/terms",
  privacyHref: "/privacy",
  termsLabel: "Terms of Service",
  privacyLabel: "Privacy Policy",
} as const;

export const CHECKOUT_COPY = {
  title: "Checkout",
  subtitle: "Confirm your plan and accept terms before paying. No charge this phase.",
  breadcrumbDashboard: "Dashboard",
  breadcrumbMembership: "Manage membership",
  breadcrumbBilling: "Billing & payments",
  breadcrumbCurrent: "Checkout",
  summary: "Checkout summary",
  plan: "Plan",
  billingCycle: "Billing cycle",
  creditsIncluded: "Credits included",
  renewalDate: "Renewal date",
  selectedPlan: "Selected plan",
  changePlan: "Change plan",
  billingDetails: "Billing details",
  name: "Name",
  email: "Email",
  billingAddress: "Billing address",
  country: "Country",
  taxInformation: "Tax information",
  taxPlaceholder: "Tax ID / GST / VAT — placeholder",
  paymentMethod: "Payment method",
  paymentPlaceholder:
    "Payment method will be collected securely at pay. Card details are not entered on this page.",
  orderSummary: "Order summary",
  subtotal: "Subtotal",
  discount: "Discount",
  coupon: "Coupon",
  tax: "Tax",
  total: "Total due",
  currency: "Currency",
  termsSection: "Terms and privacy",
  termsLabelPrefix: "I agree to the",
  termsLabelAnd: "and",
  termsLabelSuffix: ".",
  termsRequired: "Accept the Terms of Service and Privacy Policy to continue.",
  privacyNotice:
    "Connections use TLS/SSL. Billing details are used for invoicing only. Future payments use a PCI-compliant provider (e.g. Stripe Checkout) — card data is not collected on this page.",
  payNow: "Pay now",
  processing: "Processing…",
  backToBilling: "Back to billing",
  cancel: "Cancel",
  errorHeadline: "We couldn’t load checkout",
  errorDescription: "Please try again. You were not charged.",
  payErrorHeadline: "Payment could not be started",
  payErrorDescription:
    "Mock payment failed. You were not charged. Retry or return to billing.",
  retry: "Retry",
  guestRedirect: "Sign in to continue to checkout.",
  emptyRedirect: "Choose a plan on Billing & payments to continue.",
  mockSuccess: "Mock payment started — no charge this phase.",
} as const;

export const CHECKOUT_ANALYTICS_SOURCES = {
  page: "checkout",
  billingPayments: "checkout_from_billing_payments",
} as const;
