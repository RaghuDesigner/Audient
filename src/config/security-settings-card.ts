/**
 * COMPONENT-047 — Security Settings Card constants.
 * Mock session display + sign-out — no secrets / no second auth system.
 */

export const SECURITY_SETTINGS_CARD_STATES = [
  "default",
  "confirmation",
  "processing",
  "success",
  "error",
] as const;

export type SecuritySettingsCardState =
  (typeof SECURITY_SETTINGS_CARD_STATES)[number];

export const SECURITY_SETTINGS_CARD_COPY = {
  title: "Security",
  authProvider: "Authentication provider",
  currentSession: "Current session",
  lastActive: "Last active",
  location: "Location",
  signOut: "Sign out",
  signOutAll: "Sign out all devices",
  retry: "Retry",
  cancel: "Cancel",
  confirmTitle: "Sign out all devices?",
  confirmDescription:
    "This ends sessions on every device using your account. You will need to sign in again.",
  confirmAction: "Sign out all devices",
  processing: "Signing out…",
  signOutSuccess: "Signed out successfully.",
  signOutAllSuccess: "Signed out of all devices.",
  signOutError: "Unable to sign out. Try again.",
  signOutAllError: "Unable to sign out of all devices. Try again.",
  notAvailable: "Not available",
} as const;

export const SECURITY_SETTINGS_CARD_ANALYTICS_SOURCE =
  "security_settings_card" as const;

export const SECURITY_SETTINGS_CARD_SUCCESS_FLASH_MS = 1200 as const;

export const SECURITY_SETTINGS_CARD_MOCK_DELAY_MS = 400 as const;
