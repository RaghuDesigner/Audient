/**
 * Share Report Modal analytics — COMPONENT-031.
 * Dev stub — prefer ids + enums; never log raw emails or full share URLs.
 */

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const shareReportModalAnalytics = {
  opened: (props: { auditId: string; tier: string }) =>
    track("share_opened", props),

  linkGenerated: (props: {
    auditId: string;
    permission: string;
    tier?: string;
  }) => track("link_generated", props),

  linkCopied: (props: { auditId: string; permission?: string }) =>
    track("link_copied", props),

  /** Mock email share — do not include recipient address. */
  emailShared: (props: { auditId: string; tier?: string }) =>
    track("email_shared", props),

  permissionChanged: (props: {
    auditId: string;
    permission: string;
    tier?: string;
  }) => track("permission_changed", props),

  orgShareClicked: (props: { auditId: string }) =>
    track("share_org_clicked", props),

  teamShareClicked: (props: { auditId: string }) =>
    track("share_team_clicked", props),

  closed: (props: { auditId: string; tier?: string }) =>
    track("share_closed", props),

  failed: (props: { auditId: string; reason?: string }) =>
    track("share_failed", props),
};
