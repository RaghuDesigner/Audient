/**
 * Upgrade Banner analytics (COMPONENT-012).
 * Dev stub — no PII / payment data.
 */

type Props = Record<string, string | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const upgradeBannerAnalytics = {
  impressed: (props: {
    variant: string;
    source?: string;
    auditId?: string;
  }) => track("upgrade_banner_impressed", props),
  upgradeClicked: (props: {
    variant: string;
    source?: string;
    auditId?: string;
    targetTier?: string;
  }) => track("upgrade_clicked", props),
  comparePlansClicked: (props: { variant: string; source?: string }) =>
    track("compare_plans_clicked", props),
  businessClicked: (props: { variant: string; source?: string }) =>
    track("business_plan_clicked", props),
  dismissed: (props: { variant: string; source?: string }) =>
    track("banner_dismissed", props),
};
