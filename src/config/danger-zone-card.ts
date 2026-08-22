/**
 * COMPONENT-049 — Danger Zone Card constants.
 * Mock account-deletion confirm only — no real delete / no Supabase / no API.
 */

export const DANGER_ZONE_CARD_STATES = [
  "default",
  "confirmation",
  "processing",
  "success",
  "error",
] as const;

export type DangerZoneCardState = (typeof DANGER_ZONE_CARD_STATES)[number];

export const DANGER_ZONE_CARD_COPY = {
  title: "Danger Zone",
  warning:
    "Deleting your account will permanently remove your Audient account and associated data.",
  deleteAccount: "Delete Account",
  cancel: "Cancel",
  confirmTitle: "Delete account?",
  confirmDescription:
    "Deleting your account will permanently remove your Audient account and associated data. This cannot be undone.",
  confirmAction: "Delete Account",
  processing: "Deleting…",
  success: "Account deletion scheduled (mock). No data was removed.",
  error: "Unable to delete account. Try again.",
  retry: "Retry",
} as const;

export const DANGER_ZONE_CARD_ANALYTICS_SOURCE = "danger_zone_card" as const;

export const DANGER_ZONE_CARD_MOCK_DELAY_MS = 500 as const;

export const DANGER_ZONE_CARD_SUCCESS_FLASH_MS = 1600 as const;
