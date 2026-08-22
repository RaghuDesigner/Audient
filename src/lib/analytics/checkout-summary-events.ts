/**
 * Checkout Summary analytics — COMPONENT Checkout Summary.
 * Dev stub — prefer plan/cycle enums; no PII / payment PAN.
 */

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const checkoutSummaryAnalytics = {
  /** Component impressed — Checkout Summary Viewed. */
  viewed: (props: {
    plan: string;
    billingCycle: string;
    state: string;
    context?: string;
    variant?: string;
  }) => {
    track("checkout_summary_viewed", props);
    track("checkout_summary_impressed", props);
  },

  retryClicked: (props?: {
    plan?: string;
    context?: string;
  }) => track("checkout_summary_retry", props),

  resubscribeClicked: (props: {
    plan: string;
    context?: string;
  }) =>
    track("checkout_summary_resubscribe", {
      ...props,
      source: props.context ?? "checkout_summary",
    }),
};
