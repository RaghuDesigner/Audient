/**
 * Quick Action Card analytics (COMPONENT-015).
 * Align with dashboard New Audit / History via `action` prop — no double KPI.
 */

type Props = Record<string, string | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const quickActionAnalytics = {
  clicked: (props: { action: string; tier?: string }) =>
    track("quick_action_clicked", props),
};
