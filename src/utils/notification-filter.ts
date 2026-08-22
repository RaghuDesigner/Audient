/**
 * COMPONENT-040 — Notification Filter helpers.
 * Client-side mock filtering — no React / no API.
 */

import {
  NOTIFICATION_FILTER_CATEGORY_TYPES,
  NOTIFICATION_FILTER_VALUES,
  type NotificationFilterValue,
} from "@/config/notification-filter";
import type { NotificationItemType } from "@/config/notification-item";

/** Minimal row shape for filter predicates (NotificationItem mock rows). */
export type NotificationFilterable = {
  type: NotificationItemType;
  read: boolean;
};

export function isNotificationFilterValue(
  value: string | null | undefined,
): value is NotificationFilterValue {
  return (
    value != null &&
    (NOTIFICATION_FILTER_VALUES as readonly string[]).includes(value)
  );
}

function categoryTypeSet(
  filter: Exclude<NotificationFilterValue, "all" | "unread">,
): ReadonlySet<NotificationItemType> {
  return new Set(NOTIFICATION_FILTER_CATEGORY_TYPES[filter]);
}

/**
 * Whether a single notification matches the active filter.
 */
export function notificationMatchesFilter(
  item: NotificationFilterable,
  filter: NotificationFilterValue,
): boolean {
  if (filter === "all") {
    return true;
  }
  if (filter === "unread") {
    return !item.read;
  }
  return categoryTypeSet(filter).has(item.type);
}

/**
 * Filter a mock notification list by the active single-select filter.
 * Preserves input order (caller should sort newest-first before/after).
 */
export function filterNotificationsByFilter<T extends NotificationFilterable>(
  items: readonly T[],
  filter: NotificationFilterValue,
): T[] {
  if (filter === "all") {
    return [...items];
  }
  return items.filter((item) => notificationMatchesFilter(item, filter));
}

/** Optional chip badges — unread count within a category filter. */
export function countNotificationsMatchingFilter<
  T extends NotificationFilterable,
>(items: readonly T[], filter: NotificationFilterValue): number {
  return filterNotificationsByFilter(items, filter).length;
}

/** Total unread across the full inbox (not scoped by active filter). */
export function countUnreadNotifications<
  T extends NotificationFilterable,
>(items: readonly T[]): number {
  return items.filter((item) => !item.read).length;
}
