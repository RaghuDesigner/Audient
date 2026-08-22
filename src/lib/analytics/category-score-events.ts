/**
 * Category Score Card analytics (COMPONENT-009).
 * Dev stub — no PII.
 */

type Props = Record<string, string | number | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const categoryScoreAnalytics = {
  impressed: (props: {
    auditId?: string;
    category: string;
    score?: number;
    tier?: string;
  }) => track("category_score_impressed", props),
  lockedClicked: (props: {
    auditId?: string;
    category: string;
    tier?: string;
  }) => track("category_score_locked_clicked", props),
  trendViewed: (props: {
    auditId?: string;
    category: string;
    trend: string;
  }) => track("category_score_trend_viewed", props),
};
