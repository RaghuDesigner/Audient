/**
 * Notification Item analytics — COMPONENT-038.
 * Dev stub — id/type/surface only; no message bodies.
 */

import {
  NOTIFICATION_ITEM_ANALYTICS_SOURCES,
  type NotificationItemSurface,
} from "@/config/notification-item";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function surfaceSource(surface: NotificationItemSurface): string {
  return NOTIFICATION_ITEM_ANALYTICS_SOURCES[surface];
}

function base(props: {
  notificationId: string;
  type: string;
  surface?: NotificationItemSurface;
  wasUnread?: boolean;
}): Props {
  const surface = props.surface ?? "list";
  return {
    notificationId: props.notificationId,
    type: props.type,
    surface,
    wasUnread: props.wasUnread,
    source: surfaceSource(surface),
    mock: true,
  };
}

export const notificationItemAnalytics = {
  /** Item enters viewport / shown in dropdown or preview. */
  viewed: (props: {
    notificationId: string;
    type: string;
    surface?: NotificationItemSurface;
    wasUnread?: boolean;
  }) => {
    track("notification_viewed", base(props));
  },

  /** Primary row activate. */
  clicked: (props: {
    notificationId: string;
    type: string;
    surface?: NotificationItemSurface;
    wasUnread?: boolean;
  }) => {
    track("notification_clicked", base(props));
  },

  /** Unread → read. */
  markedRead: (props: {
    notificationId: string;
    type: string;
    surface?: NotificationItemSurface;
  }) => {
    track(
      "notification_marked_read",
      base({ ...props, wasUnread: true }),
    );
  },
};
