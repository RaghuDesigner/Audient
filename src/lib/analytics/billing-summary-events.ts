/**
 * Billing Summary analytics — COMPONENT-036.
 * Dev stub — prefer ids + enums; no PII / payment PAN.
 */

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const billingSummaryAnalytics = {
  /** Summary impressed — align with billing_viewed / billing_clicked. */
  viewed: (props: { plan: string; state: string; variant?: string }) => {
    track("billing_viewed", props);
    track("billing_summary_impressed", props);
  },

  invoiceHistoryClicked: (props: { plan: string; source?: string }) =>
    track("invoice_history_clicked", {
      ...props,
      source: props.source ?? "billing_summary",
    }),

  managePaymentClicked: (props: { plan: string; source?: string }) =>
    track("billing_clicked", {
      plan: props.plan,
      action: "payment_method",
      source: props.source ?? "billing_summary",
    }),

  manageBillingClicked: (props: { plan: string; source?: string }) =>
    track("billing_clicked", {
      plan: props.plan,
      action: "manage_billing",
      source: props.source ?? "billing_summary",
    }),

  retryClicked: (props?: { plan?: string }) =>
    track("billing_summary_retry", props),
};
