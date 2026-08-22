/**
 * Recent Audit Card analytics (COMPONENT-016).
 * Dev stub — no PII.
 */

type Props = Record<string, string | number | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const recentAuditAnalytics = {
  impressed: (props: {
    auditId: string;
    status: string;
    score?: number;
  }) => track("recent_audit_card_impressed", props),
  opened: (props: {
    auditId: string;
    status: string;
    destination: string;
  }) => track("recent_audit_opened", props),
};
