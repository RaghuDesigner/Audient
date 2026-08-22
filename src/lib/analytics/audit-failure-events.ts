/**
 * Audit Failed analytics — SCREEN-003 / SCREEN-M03.
 * Dev stub — wire to a real sink later.
 */

type FailureEventProps = Record<string, string | boolean | undefined>;

function track(event: string, props?: FailureEventProps): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const auditFailureAnalytics = {
  shown: (auditId: string, reason: string) =>
    track("audit_failed", { auditId, reason }),
  retryClicked: (auditId: string, reason: string) =>
    track("retry_clicked", { auditId, reason }),
  uploadNew: (auditId: string) => track("upload_new", { auditId }),
  supportClicked: (auditId: string, reason: string) =>
    track("support_clicked", { auditId, reason }),
  detailsExpanded: (auditId: string) =>
    track("error_details_expanded", { auditId }),
};
