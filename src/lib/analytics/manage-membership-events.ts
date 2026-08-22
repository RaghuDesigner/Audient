/**
 * Manage Membership analytics — SCREEN-011 / SCREEN-005.
 * Dev stub — prefer ids + enums; no PII / payment details.
 */

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const manageMembershipAnalytics = {
  /** Screen open — align with manage_plan_opened. */
  viewed: (props: {
    plan: string;
    status: string;
    state: string;
  }) => {
    track("membership_viewed", props);
    track("manage_plan_opened", props);
  },

  upgradeClicked: (props: {
    plan: string;
    targetPlan?: string;
    source: string;
  }) => track("upgrade_clicked", props),

  downgradeClicked: (props: {
    plan: string;
    targetPlan?: string;
    source?: string;
  }) => track("downgrade_clicked", props),

  creditsPurchased: (props: {
    plan: string;
    packId?: string;
    source?: string;
  }) => track("credits_purchased", props),

  billingClicked: (props: {
    plan: string;
    action: "manage_billing" | "invoice_history" | "payment_method";
  }) => track("billing_clicked", props),

  faqExpanded: (props: { faqId: string; plan?: string }) =>
    track("faq_expanded", props),

  retryClicked: (props?: { plan?: string }) =>
    track("manage_membership_retry", props),
};
