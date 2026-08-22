/**
 * COMPONENT-046 — Notification Settings Card constants.
 * Mock notification preference toggles — no backend.
 */

import type { SettingsNotificationCategory } from "@/config/settings-screen";
import {
  SETTINGS_NOTIFICATION_CATEGORIES,
  SETTINGS_NOTIFICATION_CATEGORY_LABELS,
} from "@/config/settings-screen";

export const NOTIFICATION_SETTINGS_CARD_STATES = [
  "default",
  "saving",
  "saved",
  "error",
] as const;

export type NotificationSettingsCardState =
  (typeof NOTIFICATION_SETTINGS_CARD_STATES)[number];

export const NOTIFICATION_SETTINGS_CARD_TYPES =
  SETTINGS_NOTIFICATION_CATEGORIES;

export type NotificationSettingsCardType = SettingsNotificationCategory;

export const NOTIFICATION_SETTINGS_CARD_LABELS =
  SETTINGS_NOTIFICATION_CATEGORY_LABELS;

export const NOTIFICATION_SETTINGS_CARD_DESCRIPTIONS: Record<
  NotificationSettingsCardType,
  string
> = {
  audit_completed: "When an audit finishes successfully",
  audit_failed: "When an audit fails or needs retry",
  low_credits: "When your credit balance is running low",
  billing: "Payments, invoices, and billing updates",
  membership: "Plan changes, renewals, and membership alerts",
  team_activity: "When teammates join or change seats",
  product_updates: "New features and product announcements",
};

export const NOTIFICATION_SETTINGS_CARD_COPY = {
  title: "Notification Preferences",
  intro: "Choose which notifications you want to receive.",
  enabled: "On",
  disabled: "Off",
  saving: "Saving…",
  retry: "Retry",
  saved: "Notification preferences saved.",
  saveError: "Unable to save notification preferences.",
  loadError: "Unable to load notification preferences.",
} as const;

export const NOTIFICATION_SETTINGS_CARD_ANALYTICS_SOURCE =
  "notification_settings_card" as const;

export const NOTIFICATION_SETTINGS_CARD_SAVED_FLASH_MS = 1600 as const;

export const NOTIFICATION_SETTINGS_CARD_SAVE_DELAY_MS = 400 as const;
