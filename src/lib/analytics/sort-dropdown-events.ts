/**
 * Sort Dropdown analytics — COMPONENT-023.
 * Dev stub — fire only on user-driven changes (not mount).
 */

type Props = Record<string, string | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const sortDropdownAnalytics = {
  changed: (props: {
    module: string;
    sort: string;
    previousSort: string;
  }) => track("sort_changed", props),
};
