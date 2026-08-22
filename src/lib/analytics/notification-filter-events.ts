/**
 * Notification Filter analytics — COMPONENT-040.
 * Dev stub — filter keys only; no notification bodies.
 */

import {
  NOTIFICATION_FILTER_ANALYTICS_SOURCE,
  type NotificationFilterValue,
} from "@/config/notification-filter";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const notificationFilterAnalytics = {
  /** User selects a filter different from the current value. */
  filterUsed: (props: {
    filter: NotificationFilterValue;
    previousFilter: NotificationFilterValue;
  }) => {
    track("notification_filter_used", {
      filter: props.filter,
      previousFilter: props.previousFilter,
      source: NOTIFICATION_FILTER_ANALYTICS_SOURCE,
      mock: true,
    });
  },
};
