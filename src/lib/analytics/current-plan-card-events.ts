/**
 * Current Plan Card analytics — COMPONENT-033.
 * Dev stub — prefer ids + enums; no PII / payment details.
 */

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const currentPlanCardAnalytics = {
  /** Card impressed / rendered — align with current_plan_viewed. */
  viewed: (props: {
    plan: string;
    status: string;
    billingCycle?: string;
    variant?: string;
  }) => {
    track("current_plan_viewed", props);
    track("current_plan_card_impressed", props);
  },

  upgradeClicked: (props: {
    plan: string;
    target?: string;
    source?: string;
  }) =>
    track("upgrade_clicked", {
      ...props,
      source: props.source ?? "current_plan_card",
    }),

  downgradeClicked: (props: {
    plan: string;
    target?: string;
    source?: string;
  }) =>
    track("downgrade_clicked", {
      ...props,
      source: props.source ?? "current_plan_card",
    }),

  manageBillingClicked: (props: { plan: string; source?: string }) =>
    track("manage_billing_clicked", {
      ...props,
      source: props.source ?? "current_plan_card",
    }),

  buyCreditsClicked: (props: { plan: string; source?: string }) =>
    track("buy_credits_clicked", {
      ...props,
      source: props.source ?? "current_plan_card",
    }),

  retryClicked: (props?: { plan?: string }) =>
    track("current_plan_card_retry", props),
};
