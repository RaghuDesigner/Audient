/**
 * COMPONENT-045 — Preferences Card helpers.
 * Equality / draft helpers — no React / no API.
 */

import type { PreferencesCardField } from "@/config/preferences-card";
import type {
  SettingsAppearance,
  SettingsDateFormat,
  SettingsLanguage,
  SettingsTimezone,
} from "@/config/settings-screen";

export type PreferencesCardValues = {
  language: SettingsLanguage;
  timezone: SettingsTimezone;
  appearance: SettingsAppearance;
  dateFormat: SettingsDateFormat;
};

export function preferencesCardValuesEqual(
  a: PreferencesCardValues,
  b: PreferencesCardValues,
): boolean {
  return (
    a.language === b.language &&
    a.timezone === b.timezone &&
    a.appearance === b.appearance &&
    a.dateFormat === b.dateFormat
  );
}

export function clonePreferencesCardValues(
  values: PreferencesCardValues,
): PreferencesCardValues {
  return { ...values };
}

/** Which fields differ — for Preference Changed analytics. */
export function preferencesCardChangedFields(
  before: PreferencesCardValues,
  after: PreferencesCardValues,
): PreferencesCardField[] {
  const changed: PreferencesCardField[] = [];
  if (before.language !== after.language) changed.push("language");
  if (before.timezone !== after.timezone) changed.push("timezone");
  if (before.appearance !== after.appearance) changed.push("appearance");
  if (before.dateFormat !== after.dateFormat) changed.push("dateFormat");
  return changed;
}
