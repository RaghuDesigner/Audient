/**
 * COMPONENT-039 — Notification Group helpers.
 * Local-calendar bucketing & newest-first sort — no React / no API.
 */

import {
  NOTIFICATION_GROUP_KEYS,
  NOTIFICATION_GROUP_LABELS,
  NOTIFICATION_GROUP_ORDER,
  NOTIFICATION_GROUP_WEEK_STARTS_ON,
  type NotificationGroupKey,
} from "@/config/notification-group";

/** Minimal shape required for bucketing (NotificationItem mock rows). */
export type NotificationGroupable = {
  id: string;
  timestamp: string | Date;
};

export type NotificationGroupBucket<T extends NotificationGroupable> = {
  groupKey: NotificationGroupKey;
  heading: string;
  items: T[];
  count: number;
};

export function isNotificationGroupKey(
  value: string | null | undefined,
): value is NotificationGroupKey {
  return (
    value != null &&
    (NOTIFICATION_GROUP_KEYS as readonly string[]).includes(value)
  );
}

export function notificationGroupHeading(
  key: NotificationGroupKey,
): string {
  return NOTIFICATION_GROUP_LABELS[key];
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addLocalDays(day: Date, days: number): Date {
  const next = new Date(day.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

/**
 * Start of the week containing `date` (browser local).
 * Monday when NOTIFICATION_GROUP_WEEK_STARTS_ON === 1.
 */
export function startOfLocalWeek(
  date: Date,
  weekStartsOn: 0 | 1 = NOTIFICATION_GROUP_WEEK_STARTS_ON,
): Date {
  const day = startOfLocalDay(date);
  const dow = day.getDay(); // 0 Sun … 6 Sat
  const offset =
    weekStartsOn === 1
      ? dow === 0
        ? -6
        : 1 - dow
      : -dow;
  return addLocalDays(day, offset);
}

export function parseNotificationTimestamp(
  value: string | Date,
): Date | null {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

/**
 * Map a timestamp into a date group relative to `now` (browser local).
 * Earlier absorbs invalid timestamps so they still list last bucket.
 */
export function resolveNotificationGroupKey(
  timestamp: string | Date,
  now: Date = new Date(),
): NotificationGroupKey {
  const date = parseNotificationTimestamp(timestamp);
  if (!date) return "earlier";

  const todayStart = startOfLocalDay(now);
  const yesterdayStart = addLocalDays(todayStart, -1);
  const weekStart = startOfLocalWeek(now);
  const itemDay = startOfLocalDay(date);

  if (itemDay.getTime() >= todayStart.getTime()) {
    // Future timestamps still sit in Today for mock QA.
    return "today";
  }
  if (itemDay.getTime() >= yesterdayStart.getTime()) {
    return "yesterday";
  }
  if (itemDay.getTime() >= weekStart.getTime()) {
    return "this_week";
  }
  return "earlier";
}

/** Newest first by timestamp. */
export function sortNotificationsNewestFirst<T extends NotificationGroupable>(
  items: readonly T[],
): T[] {
  return [...items].sort((a, b) => {
    const ta = parseNotificationTimestamp(a.timestamp)?.getTime() ?? 0;
    const tb = parseNotificationTimestamp(b.timestamp)?.getTime() ?? 0;
    return tb - ta;
  });
}

/**
 * Bucket by date group; empty buckets omitted; groups ordered
 * Today → Yesterday → This Week → Earlier. Items newest-first within each.
 */
export function groupNotificationsByDate<T extends NotificationGroupable>(
  items: readonly T[],
  now: Date = new Date(),
): NotificationGroupBucket<T>[] {
  const sorted = sortNotificationsNewestFirst(items);
  const map = new Map<NotificationGroupKey, T[]>();

  for (const key of NOTIFICATION_GROUP_ORDER) {
    map.set(key, []);
  }

  for (const item of sorted) {
    const key = resolveNotificationGroupKey(item.timestamp, now);
    map.get(key)?.push(item);
  }

  const buckets: NotificationGroupBucket<T>[] = [];
  for (const key of NOTIFICATION_GROUP_ORDER) {
    const groupItems = map.get(key) ?? [];
    if (groupItems.length === 0) continue;
    buckets.push({
      groupKey: key,
      heading: notificationGroupHeading(key),
      items: groupItems,
      count: groupItems.length,
    });
  }
  return buckets;
}

/** Single bucket for when the parent already assigned groupKey. */
export function buildNotificationGroupBucket<T extends NotificationGroupable>(
  groupKey: NotificationGroupKey,
  items: readonly T[],
): NotificationGroupBucket<T> | null {
  if (items.length === 0) return null;
  const ordered = sortNotificationsNewestFirst(items);
  return {
    groupKey,
    heading: notificationGroupHeading(groupKey),
    items: ordered,
    count: ordered.length,
  };
}
