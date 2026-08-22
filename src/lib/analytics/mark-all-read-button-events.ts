/**
 * Mark All Read Button analytics — COMPONENT-043.
 * Dev stub — counts only; no notification bodies.
 */

import { MARK_ALL_READ_BUTTON_ANALYTICS_SOURCE } from "@/config/mark-all-read-button";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const markAllReadButtonAnalytics = {
  clicked: (props: { unreadCountBefore: number }) => {
    track("mark_all_read_clicked", {
      unreadCountBefore: props.unreadCountBefore,
      source: MARK_ALL_READ_BUTTON_ANALYTICS_SOURCE,
      mock: true,
    });
  },

  completed: (props: { unreadCountBefore: number; changed: number }) => {
    track("mark_all_read_completed", {
      unreadCountBefore: props.unreadCountBefore,
      changed: props.changed,
      source: MARK_ALL_READ_BUTTON_ANALYTICS_SOURCE,
      mock: true,
    });
  },
};
