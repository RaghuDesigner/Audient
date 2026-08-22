/**
 * Guest Home upload analytics (home_upload_success.md).
 * Dev stub — wire to a real sink later.
 */

type UploadEventProps = Record<string, string | undefined>;

function track(event: string, props?: UploadEventProps): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const uploadAnalytics = {
  success: (source: "image" | "url") =>
    track("upload_success", { source }),
  replaced: () => track("upload_replaced"),
  removed: (source: "image" | "url") =>
    track("upload_removed", { source }),
  auditStarted: (source: "image" | "url") =>
    track("audit_started", { source }),
  failed: (reason: string) => track("upload_failed", { reason }),
  retry: (source: "image" | "url") =>
    track("upload_retry", { source }),
  validationFailed: (reason: string) =>
    track("validation_failed", { reason }),
};
