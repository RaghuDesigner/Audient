/**
 * SCREEN-019 — Settings screen constants.
 * Mock settings only — no Supabase / no API / no real deletion.
 */

export const SETTINGS_ROUTE = "/settings";

export const SETTINGS_DASHBOARD_ROUTE = "/dashboard";

export const SETTINGS_STATES = [
  "loading",
  "success",
  "error",
] as const;

export type SettingsScreenState = (typeof SETTINGS_STATES)[number];

export const SETTINGS_SECTIONS = [
  "profile",
  "preferences",
  "notifications",
  "security",
  "connected",
  "danger",
] as const;

export type SettingsSectionId = (typeof SETTINGS_SECTIONS)[number];

export const SETTINGS_SECTION_LABELS: Record<SettingsSectionId, string> = {
  profile: "Profile",
  preferences: "Preferences",
  notifications: "Notification Preferences",
  security: "Security",
  connected: "Connected Accounts",
  danger: "Danger Zone",
};

export const SETTINGS_APPEARANCE_OPTIONS = [
  "light",
  "dark",
  "system",
] as const;

export type SettingsAppearance =
  (typeof SETTINGS_APPEARANCE_OPTIONS)[number];

export const SETTINGS_APPEARANCE_LABELS: Record<SettingsAppearance, string> =
  {
    light: "Light",
    dark: "Dark",
    system: "System",
  };

export const SETTINGS_LANGUAGE_OPTIONS = ["en", "es", "fr", "de"] as const;

export type SettingsLanguage = (typeof SETTINGS_LANGUAGE_OPTIONS)[number];

export const SETTINGS_LANGUAGE_LABELS: Record<SettingsLanguage, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
};

export const SETTINGS_DATE_FORMAT_OPTIONS = [
  "mdy",
  "dmy",
  "ymd",
] as const;

export type SettingsDateFormat =
  (typeof SETTINGS_DATE_FORMAT_OPTIONS)[number];

export const SETTINGS_DATE_FORMAT_LABELS: Record<
  SettingsDateFormat,
  string
> = {
  mdy: "MM/DD/YYYY",
  dmy: "DD/MM/YYYY",
  ymd: "YYYY-MM-DD",
};

/** Curated mock timezone list — not full IANA. */
export const SETTINGS_TIMEZONE_OPTIONS = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
] as const;

export type SettingsTimezone = (typeof SETTINGS_TIMEZONE_OPTIONS)[number];

export const SETTINGS_NOTIFICATION_CATEGORIES = [
  "audit_completed",
  "audit_failed",
  "low_credits",
  "billing",
  "membership",
  "team_activity",
  "product_updates",
] as const;

export type SettingsNotificationCategory =
  (typeof SETTINGS_NOTIFICATION_CATEGORIES)[number];

export const SETTINGS_NOTIFICATION_CATEGORY_LABELS: Record<
  SettingsNotificationCategory,
  string
> = {
  audit_completed: "Audit Completed",
  audit_failed: "Audit Failed",
  low_credits: "Low Credits",
  billing: "Billing",
  membership: "Membership",
  team_activity: "Team Activity",
  product_updates: "Product Updates",
};

export const SETTINGS_AUTH_PROVIDERS = [
  "google",
  "apple",
  "microsoft",
] as const;

export type SettingsAuthProvider =
  (typeof SETTINGS_AUTH_PROVIDERS)[number];

export const SETTINGS_AUTH_PROVIDER_LABELS: Record<
  SettingsAuthProvider,
  string
> = {
  google: "Google",
  apple: "Apple",
  microsoft: "Microsoft",
};

export const SETTINGS_COPY = {
  pageTitle: "Settings",
  guestRedirect: "Redirecting to sign in…",
  breadcrumbDashboard: "Dashboard",
  breadcrumbCurrent: "Settings",
  saveChanges: "Save Changes",
  cancel: "Cancel",
  saveSuccess: "Settings saved successfully.",
  loadError: "Unable to load your settings.",
  retry: "Retry",
  back: "Back",
  notProvided: "Not provided",
  emailReadOnlyHint: "Managed by your sign-in provider",
  profilePhoto: "Profile photo",
  changePhoto: "Change photo",
  fullName: "Full name",
  email: "Email address",
  companyName: "Company name",
  role: "Role",
  language: "Language",
  timezone: "Time zone",
  appearance: "Appearance",
  dateFormat: "Date format",
  notificationPrefsIntro:
    "Choose which notifications you want to receive.",
  authProvider: "Authentication provider",
  activeSession: "Active session",
  signOut: "Sign out",
  signOutAll: "Sign out all devices",
  signOutAllSoon: "Sign out all devices is coming soon.",
  connected: "Connected",
  notConnected: "Not Connected",
  connectSoon: "Account linking is coming soon.",
  dangerIntro:
    "Permanently delete your Audient account and associated data.",
  deleteAccount: "Delete Account",
  deleteTitle: "Delete your account?",
  deleteDescription:
    "This will schedule account deletion. During frontend development nothing is permanently deleted.",
  deleteConfirm: "Delete Account",
  deleteCancel: "Cancel",
  deleteScheduled: "Account deletion scheduled (mock).",
  unsavedTitle: "Unsaved changes",
  unsavedDescription:
    "You have unsaved changes. Stay on this page or discard them.",
  unsavedStay: "Stay",
  unsavedDiscard: "Discard Changes",
  sectionNavLabel: "Settings sections",
  nameRequired: "Enter your full name.",
  nameTooLong: "Name must be 80 characters or fewer.",
} as const;

export const SETTINGS_NAME_MAX_LENGTH = 80;

export const SETTINGS_ANALYTICS_SOURCE = "settings_screen" as const;

/** QA: `?state=loading|error|success` on `/settings`. */
export const SETTINGS_QA_STATE_PARAM = "state" as const;
