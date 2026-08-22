/**
 * Export PDF Button analytics — COMPONENT-030.
 * Dev stub — prefer ids + enums; no full URLs/PII.
 */

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const exportPdfButtonAnalytics = {
  /** Control impressed (dedupe in the component). */
  viewed: (props: {
    auditId: string;
    tier: string;
    surface: string;
    state: string;
  }) => track("export_pdf_viewed", props),

  started: (props: { auditId: string; tier: string; surface?: string }) =>
    track("export_started", props),

  /** Mock or real success — also fires pdf_downloaded for report parity. */
  completed: (props: { auditId: string; tier?: string; surface?: string }) => {
    track("export_completed", props);
    track("pdf_downloaded", {
      auditId: props.auditId,
      tier: props.tier,
    });
  },

  failed: (props: {
    auditId: string;
    reason?: string;
    surface?: string;
  }) => track("export_failed", props),

  upgradeClicked: (props: {
    auditId: string;
    source: string;
    tier?: string;
    surface?: string;
  }) => track("upgrade_clicked", props),
};
