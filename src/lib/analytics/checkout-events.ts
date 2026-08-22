/**
 * Checkout analytics — SCREEN-013.
 * Dev stub — prefer plan/cycle enums; no PII / payment PAN.
 */

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const checkoutAnalytics = {
  /** Screen open — Checkout Viewed. */
  viewed: (props: {
    plan: string;
    cycle: string;
    state: string;
    source?: string;
  }) => {
    track("checkout_viewed", props);
    track("checkout_impressed", props);
  },

  termsAccepted: (props: {
    plan: string;
    cycle: string;
    source?: string;
  }) =>
    track("terms_accepted", {
      ...props,
      source: props.source ?? "checkout",
    }),

  /** Pay Now with valid terms — mock only; no gateway. */
  checkoutStarted: (props: {
    plan: string;
    cycle: string;
    totalDueCents: number;
    hasCoupon: boolean;
    source?: string;
  }) =>
    track("checkout_started", {
      ...props,
      mock: true,
      source: props.source ?? "checkout",
    }),

  backToBilling: (props: {
    plan?: string;
    cycle?: string;
    source?: string;
  }) =>
    track("back_to_billing", {
      ...props,
      source: props.source ?? "checkout",
    }),

  /** Mock pay failure path — no real charge. */
  payMockFailed: (props: {
    plan: string;
    cycle: string;
    totalDueCents?: number;
  }) => track("checkout_pay_mock_failed", { ...props, mock: true }),

  retryClicked: (props?: { plan?: string; cycle?: string }) =>
    track("checkout_retry", props),
};
