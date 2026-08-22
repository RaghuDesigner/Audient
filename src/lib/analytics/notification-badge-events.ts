/**
 * COMPONENT-042 — Notification Badge analytics.
 * Dev stub — counts only; no notification bodies.
 */

import { NOTIFICATION_BADGE_ANALYTICS_SOURCE } from "@/config/notification-badge";
import { notificationBadgeCountBucket } from "@/utils/notification-badge";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const notificationBadgeAnalytics = {
  viewed: (props: { unreadCount: number; surface: string }) => {
    track("notification_bell_viewed", {
      unreadCount: props.unreadCount,
      unreadBucket: notificationBadgeCountBucket(props.unreadCount),
      surface: props.surface,
      source: NOTIFICATION_BADGE_ANALYTICS_SOURCE,
      mock: true,
    });
  },

  clicked: (props: { unreadCount: number; surface: string }) => {
    track("notification_bell_clicked", {
      unreadCount: props.unreadCount,
      unreadBucket: notificationBadgeCountBucket(props.unreadCount),
      surface: props.surface,
      source: NOTIFICATION_BADGE_ANALYTICS_SOURCE,
      mock: true,
    });
  },
};
