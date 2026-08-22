/**
 * COMPONENT-042 — Notification Badge constants.
 * Header bell + unread count — mock only.
 */

export const NOTIFICATION_BADGE_MAX_DISPLAY = 99 as const;

export const NOTIFICATION_BADGE_OVERFLOW_LABEL = "99+" as const;

export const NOTIFICATION_BADGE_VARIANTS = [
  "bell",
  "badge_only",
  "inline",
] as const;

export type NotificationBadgeVariant =
  (typeof NOTIFICATION_BADGE_VARIANTS)[number];

export const NOTIFICATION_BADGE_STATES = ["default", "loading"] as const;

export type NotificationBadgeState =
  (typeof NOTIFICATION_BADGE_STATES)[number];

export const NOTIFICATION_BADGE_SURFACES = [
  "header",
  "mobile_nav",
  "dashboard",
  "notifications_page",
] as const;

export type NotificationBadgeSurface =
  (typeof NOTIFICATION_BADGE_SURFACES)[number];

export const NOTIFICATION_BADGE_COPY = {
  notifications: "Notifications",
  noUnread: "Notifications, no unread notifications",
  unreadOne: "You have 1 unread notification.",
  unreadMany: (count: number) => `You have ${count} unread notifications.`,
  unreadOverflow: "You have more than 99 unread notifications.",
  loading: "Notifications, loading",
  inlineUnreadOne: "1 unread",
  inlineUnreadMany: (count: number) => `${count} unread`,
  inlineOverflow: "99+ unread",
} as const;

export const NOTIFICATION_BADGE_ANALYTICS_SOURCE =
  "notification_badge" as const;

/** Unread count bucket for analytics payloads. */
export const NOTIFICATION_BADGE_COUNT_BUCKETS = [
  "0",
  "1-99",
  "99+",
] as const;

export type NotificationBadgeCountBucket =
  (typeof NOTIFICATION_BADGE_COUNT_BUCKETS)[number];
