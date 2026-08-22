/**
 * Billing & Payments analytics — SCREEN-012.
 * Dev stub — prefer plan/cycle enums; no PII / payment PAN.
 */

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const billingPaymentsAnalytics = {
  /** Screen open — Billing Viewed. */
  viewed: (props: {
    plan?: string;
    cycle?: string;
    state: string;
    source?: string;
  }) => {
    track("billing_viewed", props);
    track("billing_payments_impressed", props);
  },

  billingCycleChanged: (props: {
    plan: string;
    fromCycle: string;
    toCycle: string;
    source?: string;
  }) =>
    track("billing_cycle_changed", {
      ...props,
      source: props.source ?? "billing_payments",
    }),

  couponApplied: (props: {
    plan: string;
    cycle: string;
    couponCode: string;
    percentOff: number;
    source?: string;
  }) =>
    track("coupon_applied", {
      ...props,
      source: props.source ?? "billing_payments",
    }),

  couponFailed: (props: {
    plan: string;
    cycle: string;
    reason: "empty" | "invalid";
    source?: string;
  }) =>
    track("coupon_failed", {
      ...props,
      source: props.source ?? "billing_payments",
    }),

  couponRemoved: (props: {
    plan: string;
    cycle: string;
    couponCode: string;
    source?: string;
  }) =>
    track("coupon_removed", {
      ...props,
      source: props.source ?? "billing_payments",
    }),

  paymentMethodViewed: (props: {
    plan: string;
    cycle?: string;
    source?: string;
  }) =>
    track("payment_method_viewed", {
      ...props,
      source: props.source ?? "billing_payments",
    }),

  changePlanClicked: (props: {
    plan: string;
    source?: string;
  }) =>
    track("change_plan_clicked", {
      ...props,
      source: props.source ?? "billing_payments",
    }),

  proceedToCheckout: (props: {
    plan: string;
    cycle: string;
    totalDueCents: number;
    hasCoupon: boolean;
    source?: string;
  }) =>
    track("proceed_to_checkout", {
      ...props,
      mock: true,
      source: props.source ?? "billing_payments",
    }),

  /** Mock success only — never grants entitlements alone. */
  checkoutMockSuccess: (props: {
    plan: string;
    cycle: string;
    totalDueCents: number;
  }) => track("checkout_mock_success", { ...props, mock: true }),

  returnToMembership: (props: {
    plan?: string;
    source?: string;
  }) =>
    track("return_to_membership", {
      ...props,
      source: props.source ?? "billing_payments",
    }),

  emptyCtaClicked: (props?: { source?: string }) =>
    track("billing_payments_empty_cta", {
      source: props?.source ?? "billing_payments",
    }),

  retryClicked: (props?: { plan?: string }) =>
    track("billing_payments_retry", props),
};
