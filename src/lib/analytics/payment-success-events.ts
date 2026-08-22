/**
 * Payment Success analytics — SCREEN-015.
 * Dev stub — plan/cycle/amount/intent only; no card data / PII.
 */

import { PAYMENT_SUCCESS_ANALYTICS_SOURCES } from "@/config/payment-success";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function payload(props: {
  plan: string;
  billingCycle: string;
  amountCents?: number;
  creditsAdded?: number;
  intentId?: string;
  paymentReference?: string;
  source?: string;
}): Props {
  return {
    plan: props.plan,
    billingCycle: props.billingCycle,
    amountCents: props.amountCents,
    creditsAdded: props.creditsAdded,
    intentId: props.intentId,
    paymentReference: props.paymentReference,
    source: props.source ?? PAYMENT_SUCCESS_ANALYTICS_SOURCES.page,
    mock: true,
  };
}

export const paymentSuccessAnalytics = {
  /** Screen open — Payment Success Viewed. */
  viewed: (props: {
    plan: string;
    billingCycle: string;
    amountCents?: number;
    creditsAdded?: number;
    intentId?: string;
    paymentReference?: string;
    source?: string;
  }) => {
    track("payment_success_viewed", payload(props));
  },

  /** Go to Dashboard CTA. */
  goToDashboard: (props: {
    plan: string;
    billingCycle: string;
    intentId?: string;
    source?: string;
  }) => {
    track("payment_success_go_to_dashboard", payload(props));
  },

  /** View Invoice CTA (placeholder destination). */
  viewInvoice: (props: {
    plan: string;
    billingCycle: string;
    intentId?: string;
    source?: string;
  }) => {
    track("payment_success_view_invoice", payload(props));
  },

  /** Start New Audit CTA. */
  startNewAudit: (props: {
    plan: string;
    billingCycle: string;
    intentId?: string;
    source?: string;
  }) => {
    track("payment_success_start_new_audit", payload(props));
  },

  /**
   * Mock membership updated to paid plan.
   * Production: fire after webhook-verified ACTIVE only.
   */
  subscriptionActivated: (props: {
    plan: string;
    billingCycle: string;
    amountCents?: number;
    creditsAdded?: number;
    intentId?: string;
    paymentReference?: string;
    source?: string;
  }) => {
    track("subscription_activated", payload(props));
  },

  /** Error state shown — summary load / membership mock apply failed. */
  errorViewed: (props?: {
    plan?: string;
    billingCycle?: string;
    intentId?: string;
    reason?: string;
    source?: string;
  }) => {
    track("payment_success_error_viewed", {
      ...props,
      source: props?.source ?? PAYMENT_SUCCESS_ANALYTICS_SOURCES.page,
      mock: true,
    });
  },

  retryClicked: (props?: {
    plan?: string;
    billingCycle?: string;
    intentId?: string;
  }) => track("payment_success_retry", { ...props, mock: true }),
};
