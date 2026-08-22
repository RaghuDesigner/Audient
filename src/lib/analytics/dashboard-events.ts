/**
 * Authenticated Dashboard analytics — SCREEN-008.
 * `dashboard_viewed` fires once per visit from the screen (not Welcome Card).
 * Dev stub — no PII / payment data.
 */

type Props = Record<string, string | number | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const dashboardAnalytics = {
  viewed: (props: { tier: string }) =>
    track("dashboard_viewed", { ...props, source: "authenticated_dashboard" }),
  startAudit: (props: { tier: string; mode?: string }) =>
    track("new_audit_clicked", {
      ...props,
      source: "dashboard_quick_action",
    }),
  uploadImage: (props: { tier: string }) =>
    track("new_audit_clicked", {
      ...props,
      mode: "screenshot",
      source: "dashboard_quick_action",
    }),
  analyzeUrl: (props: { tier: string }) =>
    track("new_audit_clicked", {
      ...props,
      mode: "url",
      source: "dashboard_quick_action",
    }),
  historyOpened: (props: { tier: string; via?: string }) =>
    track("history_opened", {
      ...props,
      source: props.via ?? "dashboard_quick_action",
    }),
  upgradeClicked: (props: { tier: string; via?: string }) =>
    track("upgrade_clicked", {
      ...props,
      source: props.via ?? "dashboard",
    }),
};
