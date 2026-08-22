/**
 * Empty State analytics (COMPONENT-020).
 * Prefer one canonical New Audit / Upgrade event + source: empty_state.
 */

type Props = Record<string, string | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const emptyStateAnalytics = {
  impressed: (props: { variant: string; tier?: string }) =>
    track("empty_state_impressed", props),
  primaryClicked: (props: { variant: string; tier?: string }) =>
    track("empty_state_primary_clicked", props),
  secondaryClicked: (props: { variant: string; tier?: string }) =>
    track("empty_state_secondary_clicked", props),
};
