/**
 * COMPONENT-050 — Save Changes Button helpers.
 * Enable / busy rules — no React / no API.
 */

import type { SaveChangesButtonState } from "@/config/save-changes-button";

export function isSaveChangesButtonBusy(
  state: SaveChangesButtonState,
): boolean {
  return state === "loading";
}

/**
 * Disabled when clean (no dirty), extra disabled, or loading.
 * Error keeps the control enabled so the user can retry.
 */
export function isSaveChangesButtonDisabled(options: {
  dirty: boolean;
  disabled?: boolean;
  state: SaveChangesButtonState;
}): boolean {
  const { dirty, disabled = false, state } = options;
  if (disabled) return true;
  if (state === "loading") return true;
  if (state === "error") return false;
  return !dirty;
}
