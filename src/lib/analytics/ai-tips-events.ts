/**
 * AI Tips Card analytics (COMPONENT-019).
 * Dev stub — no PII.
 */

type Props = Record<string, string | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const aiTipsAnalytics = {
  impressed: (props: { tipId: string; category: string }) =>
    track("ai_tip_impressed", props),
  readMoreClicked: (props: { tipId: string; category: string }) =>
    track("ai_tip_read_more_clicked", props),
  nextClicked: (props: { tipId: string }) =>
    track("ai_tip_next_clicked", props),
  error: (props: { reason?: string }) => track("ai_tip_error", props),
};
