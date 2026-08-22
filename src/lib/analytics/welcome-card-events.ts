/**
 * Welcome Card analytics (COMPONENT-014).
 * Do not emit dashboard_viewed here — page owns that once per visit.
 */

type Props = Record<string, string | number | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const welcomeCardAnalytics = {
  impressed: (props: {
    tier: string;
    creditsRemaining?: number;
    state: string;
  }) => track("welcome_card_impressed", props),
  creditsClicked: (props: { tier: string }) =>
    track("welcome_card_credits_clicked", props),
  badgeClicked: (props: { tier: string }) =>
    track("welcome_card_badge_clicked", props),
  retryClicked: (props: { tier: string }) =>
    track("welcome_card_retry_clicked", props),
};
