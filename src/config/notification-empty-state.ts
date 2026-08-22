/**
 * COMPONENT-041 — Notification Empty State constants.
 * Inbox empty / filtered-empty copy — mock only.
 */

export const NOTIFICATION_EMPTY_STATE_VARIANTS = [
  "default",
  "filtered",
] as const;

export type NotificationEmptyStateVariant =
  (typeof NOTIFICATION_EMPTY_STATE_VARIANTS)[number];

export const NOTIFICATION_EMPTY_STATE_COPY = {
  default: {
    headline: "You're all caught up",
    description: "You don't have any new notifications.",
  },
  filtered: {
    headline: "No notifications found",
    description: "There are no notifications matching this filter.",
    clearFilter: "Clear Filter",
  },
  regionLabel: "Notifications empty",
} as const;
