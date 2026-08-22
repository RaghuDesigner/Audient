/**
 * Plan Comparison Modal analytics (COMPONENT-013).
 * Dev stub — no PII / payment data.
 */

type Props = Record<string, string | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const planComparisonAnalytics = {
  opened: (props: { source?: string; currentPlan?: string }) =>
    track("plan_comparison_opened", props),
  upgradeProClicked: (props: { source?: string; currentPlan?: string }) =>
    track("plan_comparison_upgrade_pro_clicked", props),
  contactSalesClicked: (props: { source?: string }) =>
    track("plan_comparison_contact_sales_clicked", props),
  continueFreeClicked: (props: { source?: string; currentPlan?: string }) =>
    track("plan_comparison_continue_free_clicked", props),
  dismissed: (props: { source?: string }) =>
    track("plan_comparison_dismissed", props),
};
