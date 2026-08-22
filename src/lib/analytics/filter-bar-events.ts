/**
 * Filter Bar analytics — COMPONENT-022.
 * Dev stub — committed filter changes only.
 */

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const filterBarAnalytics = {
  applied: (props: { module: string; filter: string; value: string }) =>
    track("filter_applied", props),

  cleared: (props: { module: string }) => track("filter_cleared", props),
};
