/**
 * Usage Widget analytics — COMPONENT-034.
 * Dev stub — prefer ids + enums; no PII / payment details.
 */

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const usageWidgetAnalytics = {
  /** Widget impressed — align with usage_viewed / credits_viewed. */
  viewed: (props: {
    tier: string;
    state: string;
    creditsRemaining?: number;
    variant?: string;
  }) => {
    track("usage_viewed", props);
    track("usage_widget_impressed", props);
  },

  /** Near Limit or Limit Reached — fire once per session/cycle from the widget. */
  creditsLow: (props: {
    tier: string;
    creditsRemaining: number;
    threshold: string;
    state: "near_limit" | "limit_reached";
  }) => track("credits_low", props),

  buyCreditsClicked: (props: { tier: string; source?: string }) =>
    track("buy_credits_clicked", {
      ...props,
      source: props.source ?? "usage_widget",
    }),

  upgradeClicked: (props: { tier: string; source?: string }) =>
    track("upgrade_clicked", {
      ...props,
      source: props.source ?? "usage_widget",
    }),

  retryClicked: (props?: { tier?: string }) =>
    track("usage_widget_retry", props),
};
