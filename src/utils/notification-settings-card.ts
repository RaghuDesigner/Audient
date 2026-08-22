/**
 * COMPONENT-046 — Notification Settings Card helpers.
 * Equality / draft helpers — no React / no API.
 */

import {
  NOTIFICATION_SETTINGS_CARD_TYPES,
  type NotificationSettingsCardType,
} from "@/config/notification-settings-card";

export type NotificationSettingsCardPrefs = Record<
  NotificationSettingsCardType,
  boolean
>;

export function cloneNotificationSettingsCardPrefs(
  prefs: NotificationSettingsCardPrefs,
): NotificationSettingsCardPrefs {
  return { ...prefs };
}

export function notificationSettingsCardPrefsEqual(
  a: NotificationSettingsCardPrefs,
  b: NotificationSettingsCardPrefs,
): boolean {
  return NOTIFICATION_SETTINGS_CARD_TYPES.every((key) => a[key] === b[key]);
}

export function applyNotificationSettingsCardToggle(
  prefs: NotificationSettingsCardPrefs,
  type: NotificationSettingsCardType,
  enabled: boolean,
): NotificationSettingsCardPrefs {
  if (prefs[type] === enabled) return prefs;
  return { ...prefs, [type]: enabled };
}

export function isValidNotificationSettingsCardPrefs(
  prefs: Partial<NotificationSettingsCardPrefs> | null | undefined,
): prefs is NotificationSettingsCardPrefs {
  if (prefs == null) return false;
  return NOTIFICATION_SETTINGS_CARD_TYPES.every(
    (key) => typeof prefs[key] === "boolean",
  );
}
