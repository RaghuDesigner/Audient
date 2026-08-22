/**
 * COMPONENT-043 — Mark All Read Button constants.
 * Bulk mark-read control — mock state only.
 */

export const MARK_ALL_READ_BUTTON_STATES = [
  "idle",
  "loading",
  "success",
  "error",
] as const;

export type MarkAllReadButtonState =
  (typeof MARK_ALL_READ_BUTTON_STATES)[number];

export const MARK_ALL_READ_BUTTON_COPY = {
  label: "Mark all as read",
  labelDisabled: "Mark all as read, no unread notifications",
  labelLoading: "Marking all notifications as read",
  success: "All notifications marked as read.",
  error: "Unable to mark notifications as read.",
  retry: "Retry",
} as const;

export const MARK_ALL_READ_BUTTON_ANALYTICS_SOURCE =
  "mark_all_read_button" as const;

/** Simulated async delay for mock loading UX (ms). */
export const MARK_ALL_READ_MOCK_DELAY_MS = 400 as const;
