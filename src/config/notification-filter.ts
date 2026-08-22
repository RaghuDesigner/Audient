/**
 * COMPONENT-040 — Notification Filter constants.
 * Single-select category filters — client-side mock only.
 */

import type { NotificationItemType } from "@/config/notification-item";

export const NOTIFICATION_FILTER_VALUES = [
  "all",
  "unread",
  "audits",
  "billing",
  "membership",
  "team",
  "system",
] as const;

export type NotificationFilterValue =
  (typeof NOTIFICATION_FILTER_VALUES)[number];

export const NOTIFICATION_FILTER_DEFAULT: NotificationFilterValue = "all";

export const NOTIFICATION_FILTER_LABELS: Record<
  NotificationFilterValue,
  string
> = {
  all: "All",
  unread: "Unread",
  audits: "Audits",
  billing: "Billing",
  membership: "Membership",
  team: "Team",
  system: "System",
};

/** Category filters — aligned with SCREEN-018 / COMPONENT_NOTIFICATION_ITEM. */
export const NOTIFICATION_FILTER_CATEGORY_TYPES: Record<
  Exclude<NotificationFilterValue, "all" | "unread">,
  readonly NotificationItemType[]
> = {
  audits: ["audit_completed", "audit_failed"],
  billing: ["payment_successful", "payment_failed", "invoice_available"],
  membership: [
    "low_credits",
    "subscription_activated",
    "subscription_renewal",
    "membership_upgrade",
    "membership_expiry",
  ],
  team: ["team_activity"],
  system: ["system"],
};

export const NOTIFICATION_FILTER_VARIANTS = [
  "tabs",
  "chips",
  "dropdown",
] as const;

export type NotificationFilterVariant =
  (typeof NOTIFICATION_FILTER_VARIANTS)[number];

export const NOTIFICATION_FILTER_COPY = {
  groupLabel: "Filter notifications",
  mobileSelectLabel: "Notification filter",
  selectedSuffix: (label: string) => `${label}, selected`,
} as const;

export const NOTIFICATION_FILTER_ANALYTICS_SOURCE =
  "notification_filter" as const;
