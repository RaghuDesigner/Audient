/**
 * Error Actions helpers — COMPONENT-074.
 */

import { errorSystemActionLabel } from "@/config/error-system-states";
import {
  ERROR_SYSTEM_STATE_DEFINITIONS,
  type ErrorSystemAction,
  type ErrorSystemStateType,
} from "@/config/error-system-states";
import type { ErrorStateVariant } from "@/config/error-state";

export type ResolvedErrorActions = {
  primaryAction: ErrorSystemAction | null;
  secondaryAction: ErrorSystemAction | null;
  primaryLabel: string | null;
  secondaryLabel: string | null;
};

const VARIANT_TO_SYSTEM: Partial<
  Record<ErrorStateVariant, ErrorSystemStateType>
> = {
  not_found: "not_found",
  forbidden: "forbidden",
  server_error: "server_error",
  network_error: "network_error",
  generic_error: "generic_error",
};

export function resolveErrorActionsFromSystemType(
  stateType: ErrorSystemStateType,
): ResolvedErrorActions {
  const def = ERROR_SYSTEM_STATE_DEFINITIONS[stateType];
  return {
    primaryAction: def.primaryAction,
    secondaryAction: def.secondaryAction,
    primaryLabel: def.primaryAction
      ? errorSystemActionLabel(stateType, def.primaryAction)
      : null,
    secondaryLabel: def.secondaryAction
      ? errorSystemActionLabel(stateType, def.secondaryAction)
      : null,
  };
}

export function resolveErrorActionsFromVariant(
  variant: ErrorStateVariant,
): ResolvedErrorActions {
  const stateType = VARIANT_TO_SYSTEM[variant];
  if (!stateType) {
    return {
      primaryAction: null,
      secondaryAction: null,
      primaryLabel: null,
      secondaryLabel: null,
    };
  }
  return resolveErrorActionsFromSystemType(stateType);
}
