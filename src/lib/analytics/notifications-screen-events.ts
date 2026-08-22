/**
 * Notifications screen analytics — SCREEN-018.
 * Dev stub — counts / filter only; no message bodies.
 */

import { NOTIFICATIONS_ANALYTICS_SOURCE } from "@/config/notifications-screen";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const notificationsScreenAnalytics = {
  viewed: (props: { catalogCount: number; unreadCount: number }) => {
    track("notifications_viewed", {
      catalogCount: props.catalogCount,
      unreadCount: props.unreadCount,
      source: NOTIFICATIONS_ANALYTICS_SOURCE,
      mock: true,
    });
  },
};
