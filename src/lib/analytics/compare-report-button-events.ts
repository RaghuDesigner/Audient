/**
 * Compare Report Button analytics — COMPONENT-032.
 * Dev stub — prefer ids + enums; no full URLs/PII.
 */

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const compareReportButtonAnalytics = {
  /** Control activated — enabled or locked. */
  clicked: (props: {
    auditId: string;
    tier: string;
    surface: string;
    gated: boolean;
  }) => track("compare_clicked", props),

  upgradeClicked: (props: {
    auditId: string;
    source: string;
    tier?: string;
    surface?: string;
  }) => track("upgrade_clicked", props),

  /** Business path — Compare Report Selector opened. */
  started: (props: {
    auditId: string;
    tier: string;
    surface?: string;
  }) => track("compare_started", props),

  selectorDismissed: (props: { auditId: string; tier?: string }) =>
    track("compare_selector_dismissed", props),

  peerSelected: (props: {
    auditId: string;
    peerAuditId: string;
    tier?: string;
  }) => track("compare_peer_selected", props),
};
