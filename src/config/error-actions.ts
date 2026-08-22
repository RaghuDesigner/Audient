/**
 * Error Actions config — COMPONENT-074.
 * Action keys, default labels, and busy copy.
 * @see docs/components/COMPONENT_ERROR_ACTIONS.md
 */

import {
  ERROR_SYSTEM_ACTION_LABELS,
  ERROR_SYSTEM_COPY,
  type ErrorSystemAction,
} from "@/config/error-system-states";
import type { ErrorStateSize } from "@/config/error-state";

export type { ErrorSystemAction as ErrorActionKey };

export const ERROR_ACTION_KEYS = [
  "retry",
  "go_back",
  "go_to_dashboard",
  "login",
] as const satisfies readonly ErrorSystemAction[];

export const ERROR_ACTIONS_COPY = {
  loadingLabel: ERROR_SYSTEM_COPY.retryBusy,
  ...ERROR_SYSTEM_ACTION_LABELS,
} as const;

/** Primary slot accepts retry, dashboard, or login. */
export type ErrorPrimaryAction = Extract<
  ErrorSystemAction,
  "retry" | "go_to_dashboard" | "login"
>;

/** Secondary slot accepts back or dashboard. */
export type ErrorSecondaryAction = Extract<
  ErrorSystemAction,
  "go_back" | "go_to_dashboard"
>;

export type ErrorActionsLayoutSize = ErrorStateSize;

export function isRetryAction(action: ErrorSystemAction): boolean {
  return action === "retry";
}

export function isDashboardAction(action: ErrorSystemAction): boolean {
  return action === "go_to_dashboard";
}

export function isLoginAction(action: ErrorSystemAction): boolean {
  return action === "login";
}
