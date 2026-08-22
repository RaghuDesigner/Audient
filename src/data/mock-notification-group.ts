/**
 * Phase-1 mock Notification Group fixtures — COMPONENT-039.
 * Timestamps relative to `now` so all four buckets appear in QA.
 * No backend / Supabase.
 */

import type { MockNotificationItem } from "@/data/mock-notification-item";
import {
  MOCK_NOTIFICATION_CATALOG,
  rebindMockNotificationsToUser,
} from "@/data/mock-notification-item";
import {
  groupNotificationsByDate,
  type NotificationGroupBucket,
} from "@/utils/notification-group";

function daysAgoIso(now: Date, days: number, hour = 10): string {
  const d = new Date(now.getTime());
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

/**
 * Synthetic feed that hits Today, Yesterday, This Week, and Earlier.
 * Uses catalog copy but rewrites timestamps relative to `now`.
 */
export function getMockGroupedNotificationItems(
  now: Date = new Date(),
  userId?: string,
): MockNotificationItem[] {
  const base = userId
    ? rebindMockNotificationsToUser(MOCK_NOTIFICATION_CATALOG, userId)
    : [...MOCK_NOTIFICATION_CATALOG];

  // Pad if catalog shorter than 8 (robust to future catalog edits).
  while (base.length < 8) {
    const seed = base[base.length % Math.max(base.length, 1)] ?? {
      id: `notif_fill_${base.length}`,
      type: "system" as const,
      title: "System message",
      description: "Placeholder mock notification.",
      timestamp: now.toISOString(),
      read: true,
      userId: userId ?? "mock-notification-owner",
    };
    base.push({
      ...seed,
      id: `${seed.id}_fill_${base.length}`,
    });
  }

  const offsets: Array<{ days: number; hour: number }> = [
    { days: 0, hour: 14 }, // Today
    { days: 0, hour: 9 }, // Today (older same day)
    { days: 1, hour: 16 }, // Yesterday
    { days: 1, hour: 8 }, // Yesterday
    { days: 3, hour: 11 }, // This week (e.g. Tue if today Fri)
    { days: 4, hour: 15 }, // This week
    { days: 14, hour: 10 }, // Earlier
    { days: 30, hour: 12 }, // Earlier
  ];

  return base.slice(0, offsets.length).map((item, i) => {
    const { days, hour } = offsets[i]!;
    return {
      ...item,
      timestamp: daysAgoIso(now, days, hour),
    };
  });
}

export function getMockNotificationGroupBuckets(
  now: Date = new Date(),
  userId?: string,
): NotificationGroupBucket<MockNotificationItem>[] {
  return groupNotificationsByDate(
    getMockGroupedNotificationItems(now, userId),
    now,
  );
}

/** Single-bucket QA: only Earlier. */
export function getMockEarlierOnlyNotifications(
  now: Date = new Date(),
): MockNotificationItem[] {
  return [
    {
      id: "notif_earlier_only_1",
      type: "system",
      title: "Older notice",
      description: "From last month — only Earlier bucket.",
      timestamp: daysAgoIso(now, 40, 10),
      read: true,
      userId: "mock-notification-owner",
    },
  ];
}

export const MOCK_NOTIFICATION_GROUP_LOADING_KEYS = [
  "today",
  "yesterday",
] as const;
