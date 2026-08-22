/**
 * Recommendation Card analytics — COMPONENT-029.
 * Dev stub — prefer ids + enums; no full URLs/PII.
 */

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const recommendationCardAnalytics = {
  /** Once per recommendation per report view. */
  viewed: (props: {
    recommendationId: string;
    severity: string;
    priority: string;
    tier: string;
    auditId?: string;
  }) => track("recommendation_viewed", props),

  expanded: (props: {
    recommendationId: string;
    auditId?: string;
    tier?: string;
  }) => track("recommendation_expanded", props),

  collapsed: (props: {
    recommendationId: string;
    auditId?: string;
  }) => track("recommendation_collapsed", props),

  upgradeClicked: (props: {
    recommendationId: string;
    source: string;
    tier?: string;
    auditId?: string;
  }) => track("upgrade_clicked", props),

  learnMoreClicked: (props: {
    recommendationId: string;
    available: boolean;
    auditId?: string;
  }) => track("recommendation_learn_more_clicked", props),

  retryClicked: (props: { recommendationId: string; auditId?: string }) =>
    track("recommendation_retry_clicked", props),
};
