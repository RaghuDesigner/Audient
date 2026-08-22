/**
 * Strength Card analytics — COMPONENT-028.
 * Dev stub — prefer ids + enums; no full URLs/PII.
 */

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const strengthCardAnalytics = {
  /** Once per strength per report view. */
  impressed: (props: {
    strengthId: string;
    category: string;
    impactLevel?: string;
    auditId?: string;
  }) => track("strength_impressed", props),

  expanded: (props: {
    strengthId: string;
    category: string;
    impactLevel?: string;
    auditId?: string;
  }) => track("strength_expanded", props),

  collapsed: (props: {
    strengthId: string;
    category: string;
    auditId?: string;
  }) => track("strength_collapsed", props),

  retryClicked: (props: { strengthId: string; auditId?: string }) =>
    track("strength_retry_clicked", props),
};
