/**
 * Audit Report analytics — SCREEN-010 / M02.
 * Dev stub — prefer ids + enums; no full URLs/emails.
 */

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const auditReportAnalytics = {
  viewed: (props: {
    auditId: string;
    tier: string;
    preview: boolean;
  }) => track("report_viewed", props),

  recommendationExpanded: (props: {
    auditId: string;
    recommendationId: string;
    tier: string;
  }) => track("recommendation_expanded", props),

  upgradeClicked: (props: {
    auditId: string;
    tier: string;
    source: string;
  }) => track("upgrade_clicked", props),

  pdfDownloaded: (props: { auditId: string; tier: string }) =>
    track("pdf_downloaded", props),

  shareReport: (props: { auditId: string; tier: string }) =>
    track("share_report", props),

  compareClicked: (props: { auditId: string; tier: string }) =>
    track("compare_audit", props),
};
