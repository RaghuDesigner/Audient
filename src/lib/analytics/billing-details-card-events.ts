/**
 * Billing Details Card analytics.
 * Dev stub — never send email, address, or tax ID.
 */

import type { BillingDetailsCardMode } from "@/config/billing-details-card";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const billingDetailsCardAnalytics = {
  /** Card mounts / visible — Billing Details Viewed. */
  viewed: (props: {
    mode: BillingDetailsCardMode;
    hasCompany?: boolean;
    hasTaxId?: boolean;
    country?: string;
    source?: string;
  }) => {
    track("billing_details_viewed", props);
    track("billing_details_impressed", props);
  },

  /**
   * Valid blur-save or parent continue with valid form — not every keystroke.
   * Payload must stay PII-safe.
   */
  updated: (props: {
    mode: BillingDetailsCardMode;
    hasCompany: boolean;
    hasTaxId: boolean;
    country?: string;
    source?: string;
  }) =>
    track("billing_details_updated", {
      ...props,
      source: props.source ?? "billing_details_card",
    }),
};
