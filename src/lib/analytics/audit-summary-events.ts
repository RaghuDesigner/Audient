/**
 * Audit Summary analytics — COMPONENT-027.
 * Dev stub — prefer ids + enums; no full URLs/emails.
 */

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const auditSummaryAnalytics = {
  /** Summary impressed / visible (component-level; page still fires report_viewed). */
  viewed: (props: {
    auditId: string;
    status: string;
    tier: string;
    variant: string;
  }) => track("audit_summary_viewed", props),

  shareClicked: (props: { auditId: string; tier: string }) =>
    track("audit_summary_share_clicked", props),

  exportClicked: (props: { auditId: string; tier: string }) =>
    track("audit_summary_export_clicked", props),

  compareClicked: (props: { auditId: string; tier: string }) =>
    track("audit_summary_compare_clicked", props),

  /** Locked action → upgrade path. */
  upgradeClicked: (props: {
    auditId: string;
    tier: string;
    source: string;
  }) => track("upgrade_clicked", props),

  retryClicked: (props: { auditId?: string }) =>
    track("audit_summary_retry_clicked", props),

  auditIdCopied: (props: { auditId: string }) =>
    track("audit_summary_id_copied", props),
};
