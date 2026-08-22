/**
 * COMPONENT-044 — Profile Settings Card constants.
 * Mock profile edit — no Supabase / no API.
 */

export const PROFILE_SETTINGS_CARD_STATES = [
  "default",
  "editing",
  "saving",
  "saved",
  "error",
] as const;

export type ProfileSettingsCardState =
  (typeof PROFILE_SETTINGS_CARD_STATES)[number];

export const PROFILE_SETTINGS_NAME_MAX_LENGTH = 80;

export const PROFILE_SETTINGS_CARD_COPY = {
  title: "Profile",
  profilePhoto: "Profile photo",
  changePhoto: "Change photo",
  photoSoon: "Photo upload is coming soon.",
  fullName: "Full name",
  email: "Email address",
  emailReadOnlyHint: "Managed by your sign-in provider",
  company: "Company",
  role: "Role",
  notProvided: "Not provided",
  edit: "Edit",
  save: "Save",
  cancel: "Cancel",
  retry: "Retry",
  nameRequired: "Enter your full name.",
  nameTooLong: "Name must be 80 characters or fewer.",
  saved: "Profile saved successfully.",
  saveError: "Unable to save your profile.",
  loadError: "Unable to load your profile.",
} as const;

export const PROFILE_SETTINGS_CARD_ANALYTICS_SOURCE =
  "profile_settings_card" as const;

/** Brief Saved UI before returning to Default (ms). */
export const PROFILE_SETTINGS_SAVED_FLASH_MS = 1600 as const;
