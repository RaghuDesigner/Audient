/**
 * Audit History Card analytics — COMPONENT-024 / SCREEN-009.
 * Dev stub — no PII; prefer ids + enums over URLs/emails.
 */

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const auditHistoryCardAnalytics = {
  openReport: (props: {
    auditId: string;
    status: string;
    destination?: string;
  }) => {
    track("history_row_opened", props);
    track("open_report", props);
  },

  deleted: (props: { auditId: string }) =>
    track("audit_deleted", props),

  duplicated: (props: { auditId: string; auditType: string }) =>
    track("audit_duplicated", props),

  pdfDownloaded: (props: { auditId: string; tier: string }) =>
    track("pdf_downloaded", props),

  compare: (props: { auditId: string; tier: string }) =>
    track("compare_audit", props),

  /** Gated PDF / Compare click → upgrade path. */
  upgradeClicked: (props: {
    auditId: string;
    tier: string;
    source: string;
  }) => track("upgrade_clicked", props),

  impressed: (props: {
    auditId: string;
    status: string;
    tier: string;
  }) => track("history_card_impressed", props),
};
