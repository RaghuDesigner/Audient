/**
 * Payment Processing analytics — SCREEN-014.
 * Dev stub — plan/cycle/amount/intentId only; no card data / PII.
 */

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function payload(props: {
  plan: string;
  billingCycle: string;
  amountCents: number;
  intentId?: string;
  source?: string;
}): Props {
  return {
    plan: props.plan,
    billingCycle: props.billingCycle,
    amountCents: props.amountCents,
    intentId: props.intentId,
    source: props.source ?? "payment_processing",
    mock: true,
  };
}

export const paymentProcessingAnalytics = {
  /** Screen open — Payment Processing Viewed. */
  viewed: (props: {
    plan: string;
    billingCycle: string;
    amountCents: number;
    intentId?: string;
    source?: string;
  }) => {
    track("payment_processing_viewed", payload(props));
  },

  /** Mock payment intent begins — Payment Processing Started. */
  started: (props: {
    plan: string;
    billingCycle: string;
    amountCents: number;
    intentId?: string;
    source?: string;
  }) => {
    track("payment_processing_started", payload(props));
  },

  /** Mock resolves success — Payment Processing Completed. */
  completed: (props: {
    plan: string;
    billingCycle: string;
    amountCents: number;
    intentId?: string;
    source?: string;
  }) => {
    track("payment_processing_completed", payload(props));
  },

  /** Mock resolves failure — Payment Processing Failed. */
  failed: (props: {
    plan: string;
    billingCycle: string;
    amountCents: number;
    intentId?: string;
    source?: string;
  }) => {
    track("payment_processing_failed", payload(props));
  },

  /** Timeout threshold hit — Payment Processing Timeout. */
  timeout: (props: {
    plan: string;
    billingCycle: string;
    amountCents: number;
    intentId?: string;
    source?: string;
  }) => {
    track("payment_processing_timeout", payload(props));
  },
};
