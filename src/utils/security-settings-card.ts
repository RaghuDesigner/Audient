/**
 * COMPONENT-047 — Security Settings Card helpers.
 * State helpers only — no React / no auth / no API.
 */

import type { SecuritySettingsCardState } from "@/config/security-settings-card";

export function isSecuritySettingsCardBusy(
  state: SecuritySettingsCardState,
): boolean {
  return state === "processing";
}

export function isSecuritySettingsCardConfirmOpen(
  state: SecuritySettingsCardState,
): boolean {
  return state === "confirmation" || state === "processing";
}

export function displaySecuritySettingsCardValue(
  value: string | null | undefined,
  fallback: string,
): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}
