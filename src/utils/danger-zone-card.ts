/**
 * COMPONENT-049 — Danger Zone Card helpers.
 * State helpers only — no React / no API / no deletion.
 */

import type { DangerZoneCardState } from "@/config/danger-zone-card";

export function isDangerZoneCardBusy(state: DangerZoneCardState): boolean {
  return state === "processing";
}

export function isDangerZoneCardConfirmOpen(
  state: DangerZoneCardState,
): boolean {
  return state === "confirmation" || state === "processing";
}
