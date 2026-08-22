/**
 * COMPONENT-050 — Save Changes Button constants.
 * Mock settings save control — no backend / no Supabase.
 */

export const SAVE_CHANGES_BUTTON_STATES = [
  "default",
  "loading",
  "success",
  "error",
] as const;

export type SaveChangesButtonState =
  (typeof SAVE_CHANGES_BUTTON_STATES)[number];

export const SAVE_CHANGES_BUTTON_COPY = {
  label: "Save Changes",
  labelLoading: "Saving…",
  labelDisabled: "Save Changes, no unsaved changes",
  labelBusy: "Saving settings",
  success: "Settings saved successfully.",
  error: "Unable to save settings. Try again.",
  retry: "Retry",
} as const;

/** Generic success copy for non-settings screens (SCREEN-022). */
export const SAVE_CHANGES_BUTTON_ROLES_SUCCESS =
  "Permissions updated successfully." as const;

export const SAVE_CHANGES_BUTTON_ANALYTICS_SOURCE =
  "save_changes_button" as const;

export const SAVE_CHANGES_BUTTON_SUCCESS_FLASH_MS = 1600 as const;

/** Optional mock delay when parent save is sync (ms). */
export const SAVE_CHANGES_BUTTON_MOCK_DELAY_MS = 0 as const;
