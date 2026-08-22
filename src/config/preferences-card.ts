/**
 * COMPONENT-045 — Preferences Card constants.
 * Mock app preferences — Appearance via ThemeProvider.
 */

export const PREFERENCES_CARD_STATES = [
  "default",
  "editing",
  "saving",
  "saved",
  "error",
] as const;

export type PreferencesCardState =
  (typeof PREFERENCES_CARD_STATES)[number];

export const PREFERENCES_CARD_FIELDS = [
  "language",
  "timezone",
  "appearance",
  "dateFormat",
] as const;

export type PreferencesCardField =
  (typeof PREFERENCES_CARD_FIELDS)[number];

export const PREFERENCES_CARD_COPY = {
  title: "Preferences",
  language: "Language",
  timezone: "Time zone",
  appearance: "Appearance",
  dateFormat: "Date format",
  edit: "Edit",
  save: "Save",
  cancel: "Cancel",
  retry: "Retry",
  saved: "Preferences saved successfully.",
  saveError: "Unable to save preferences.",
  loadError: "Unable to load preferences.",
} as const;

export const PREFERENCES_CARD_ANALYTICS_SOURCE =
  "preferences_card" as const;

export const PREFERENCES_CARD_SAVED_FLASH_MS = 1600 as const;
