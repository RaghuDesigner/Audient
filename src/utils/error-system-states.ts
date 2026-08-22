/**
 * SCREEN-025 — Error & System States helpers.
 * Mock error ids and state parsing — no React / no API.
 */

import {
  ERROR_SYSTEM_ERROR_ID_PREFIX,
  ERROR_SYSTEM_STATE_DEFINITIONS,
  isErrorSystemStateType,
  type ErrorSystemAction,
  type ErrorSystemStateType,
} from "@/config/error-system-states";

const ERROR_ID_ALPHABET = "0123456789ABCDEF";

export function generateMockErrorId(seed?: string): string {
  if (seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    const code = Math.abs(hash).toString(36).toUpperCase().slice(0, 6);
    return `${ERROR_SYSTEM_ERROR_ID_PREFIX}${code.padStart(4, "0").slice(0, 6)}`;
  }
  let suffix = "";
  for (let i = 0; i < 4; i += 1) {
    suffix += ERROR_ID_ALPHABET[Math.floor(Math.random() * ERROR_ID_ALPHABET.length)];
  }
  return `${ERROR_SYSTEM_ERROR_ID_PREFIX}${suffix}`;
}

export function parseErrorSystemStateType(
  value: string | null | undefined,
): ErrorSystemStateType | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return isErrorSystemStateType(normalized) ? normalized : null;
}

export function errorSystemStateShowsErrorId(
  state: ErrorSystemStateType,
): boolean {
  return ERROR_SYSTEM_STATE_DEFINITIONS[state].showErrorId;
}

export type ErrorSystemActionDescriptor = {
  action: ErrorSystemAction;
  label: string;
  order: "primary" | "secondary" | "tertiary";
};

export function listErrorSystemActions(
  state: ErrorSystemStateType,
  labelFor: (action: ErrorSystemAction) => string,
): ErrorSystemActionDescriptor[] {
  const def = ERROR_SYSTEM_STATE_DEFINITIONS[state];
  const items: ErrorSystemActionDescriptor[] = [];
  if (def.primaryAction) {
    items.push({
      action: def.primaryAction,
      label: labelFor(def.primaryAction),
      order: "primary",
    });
  }
  if (def.secondaryAction) {
    items.push({
      action: def.secondaryAction,
      label: labelFor(def.secondaryAction),
      order: "secondary",
    });
  }
  if (def.tertiaryAction) {
    items.push({
      action: def.tertiaryAction,
      label: labelFor(def.tertiaryAction),
      order: "tertiary",
    });
  }
  return items;
}

export function formatErrorSystemErrorIdLabel(errorId: string): string {
  return errorId;
}
