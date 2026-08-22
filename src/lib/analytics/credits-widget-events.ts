/**
 * Credits Widget analytics (COMPONENT-017).
 * Dev stub — no ledger internals / PII.
 */

type Props = Record<string, string | number | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const creditsWidgetAnalytics = {
  viewed: (props: {
    tier: string;
    remaining?: number;
    state: string;
  }) => track("credits_viewed", props),
  upgradeClicked: (props: { tier: string; state: string }) =>
    track("credits_upgrade_clicked", {
      ...props,
      source: "credits_widget",
    }),
};
