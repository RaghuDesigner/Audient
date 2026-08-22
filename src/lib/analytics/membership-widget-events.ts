/**
 * Membership Widget analytics (COMPONENT-018).
 * Dev stub — no PII / payment secrets.
 */

type Props = Record<string, string | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const membershipWidgetAnalytics = {
  impressed: (props: { plan: string; state: string }) =>
    track("membership_widget_impressed", props),
  upgradeClicked: (props: { plan: string; state: string }) =>
    track("upgrade_clicked", {
      ...props,
      source: "membership_widget",
    }),
  manageClicked: (props: { plan: string; state: string }) =>
    track("manage_plan_clicked", {
      ...props,
      source: "membership_widget",
    }),
  renewClicked: (props: { plan: string }) =>
    track("membership_renew_clicked", {
      ...props,
      state: "expired",
    }),
};
