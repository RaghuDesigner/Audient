/**
 * COMPONENT-039 — Notification Group constants.
 * Date-bucketed sections of NotificationItem — mock only.
 */

export const NOTIFICATION_GROUP_KEYS = [
  "today",
  "yesterday",
  "this_week",
  "earlier",
] as const;

export type NotificationGroupKey = (typeof NOTIFICATION_GROUP_KEYS)[number];

/** Always render groups in this order when populated. */
export const NOTIFICATION_GROUP_ORDER: readonly NotificationGroupKey[] =
  NOTIFICATION_GROUP_KEYS;

export const NOTIFICATION_GROUP_LABELS: Record<NotificationGroupKey, string> =
  {
    today: "Today",
    yesterday: "Yesterday",
    this_week: "This Week",
    earlier: "Earlier",
  };

export const NOTIFICATION_GROUP_VARIANTS = ["default", "compact"] as const;

export type NotificationGroupVariant =
  (typeof NOTIFICATION_GROUP_VARIANTS)[number];

export const NOTIFICATION_GROUP_STATES = ["populated", "loading"] as const;

export type NotificationGroupState =
  (typeof NOTIFICATION_GROUP_STATES)[number];

/** Week bucketing: ISO-style Monday start (browser local). */
export const NOTIFICATION_GROUP_WEEK_STARTS_ON: 0 | 1 = 1;

export const NOTIFICATION_GROUP_COPY = {
  count: (n: number) => (n === 1 ? "1 notification" : `${n} notifications`),
  countShort: (n: number) => String(n),
  loadingLabel: "Loading notifications",
  region: "Notification group",
} as const;

/** Skeleton row count while a group (or feed section) is loading. */
export const NOTIFICATION_GROUP_SKELETON_COUNT = 3;
