/**
 * Payment Failure analytics — SCREEN-016.
 * Dev stub — reason/plan/cycle only; no gateway payload / PAN / PII.
 */

import { PAYMENT_FAILURE_ANALYTICS_SOURCES } from "@/config/payment-failure";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function payload(props: {
  plan: string;
  billingCycle: string;
  reason?: string;
  amountCents?: number;
  intentId?: string;
  source?: string;
}): Props {
  return {
    plan: props.plan,
    billingCycle: props.billingCycle,
    reason: props.reason,
    amountCents: props.amountCents,
    intentId: props.intentId,
    source: props.source ?? PAYMENT_FAILURE_ANALYTICS_SOURCES.page,
    mock: true,
  };
}

export const paymentFailureAnalytics = {
  /** Screen open — Payment Failure Viewed. */
  viewed: (props: {
    plan: string;
    billingCycle: string;
    reason: string;
    amountCents?: number;
    intentId?: string;
    source?: string;
  }) => {
    track("payment_failure_viewed", payload(props));
  },

  /** Try Again activated — Retry Payment Clicked. */
  retryClicked: (props: {
    plan: string;
    billingCycle: string;
    reason?: string;
    intentId?: string;
    source?: string;
  }) => {
    track("payment_failure_retry_clicked", payload(props));
  },

  /**
   * New mock payment intent begins after Try Again.
   * Payment Retry Started — not a silent charge on mount.
   */
  retryStarted: (props: {
    plan: string;
    billingCycle: string;
    reason?: string;
    newIntentId: string;
    previousIntentId?: string;
    source?: string;
  }) => {
    track("payment_retry_started", {
      ...payload({
        plan: props.plan,
        billingCycle: props.billingCycle,
        reason: props.reason,
        intentId: props.newIntentId,
        source: props.source,
      }),
      previousIntentId: props.previousIntentId,
      newIntentId: props.newIntentId,
    });
  },

  /** Change Payment Method Clicked. */
  changePaymentMethod: (props: {
    plan: string;
    billingCycle: string;
    reason?: string;
    intentId?: string;
    source?: string;
  }) => {
    track("payment_failure_change_method_clicked", payload(props));
  },

  /** Back To Billing Clicked. */
  backToBilling: (props: {
    plan: string;
    billingCycle: string;
    reason?: string;
    intentId?: string;
    source?: string;
  }) => {
    track("payment_failure_back_to_billing_clicked", payload(props));
  },

  errorViewed: (props?: {
    plan?: string;
    billingCycle?: string;
    reason?: string;
    intentId?: string;
  }) =>
    track("payment_failure_error_viewed", {
      ...props,
      mock: true,
      source: PAYMENT_FAILURE_ANALYTICS_SOURCES.page,
    }),
};
