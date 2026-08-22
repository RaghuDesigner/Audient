/**
 * Error State helpers — COMPONENT-072.
 * Resolves copy from variant config and SCREEN-025 system types.
 */

import {
  ERROR_STATE_DEFAULTS,
  type ErrorStateVariant,
} from "@/config/error-state";
import {
  ERROR_SYSTEM_STATE_DEFINITIONS,
  errorSystemActionLabel,
  type ErrorSystemStateType,
} from "@/config/error-system-states";

const CORE_SYSTEM_TO_VARIANT: Partial<
  Record<ErrorSystemStateType, Exclude<ErrorStateVariant, "custom">>
> = {
  not_found: "not_found",
  forbidden: "forbidden",
  server_error: "server_error",
  network_error: "network_error",
  generic_error: "generic_error",
};

export type ResolvedErrorStateContent = {
  variant: ErrorStateVariant;
  title: string;
  description: string;
  primaryLabel: string | null;
  secondaryLabel: string | null;
  showErrorId: boolean;
};

export function resolveErrorStateContent(
  variant: ErrorStateVariant,
  overrides?: {
    title?: string;
    description?: string;
    primaryLabel?: string | null;
    secondaryLabel?: string | null;
    showErrorId?: boolean;
  },
): ResolvedErrorStateContent {
  const defaults =
    variant === "custom" ? null : ERROR_STATE_DEFAULTS[variant];

  const title =
    overrides?.title ??
    defaults?.title ??
    "Something went wrong";
  const description =
    overrides?.description ??
    defaults?.description ??
    "We couldn't complete your request.";
  const primaryLabel =
    overrides?.primaryLabel === undefined
      ? (defaults?.primaryLabel ?? null)
      : overrides.primaryLabel;
  const secondaryLabel =
    overrides?.secondaryLabel === undefined
      ? (defaults?.secondaryLabel ?? null)
      : overrides.secondaryLabel;
  const showErrorId =
    overrides?.showErrorId ?? defaults?.showErrorId ?? false;

  return {
    variant,
    title,
    description,
    primaryLabel,
    secondaryLabel,
    showErrorId,
  };
}

/** Maps extended SCREEN-025 types onto ErrorState props. */
export function resolveErrorStateFromSystemType(
  stateType: ErrorSystemStateType,
): ResolvedErrorStateContent {
  const mappedVariant = CORE_SYSTEM_TO_VARIANT[stateType];
  if (mappedVariant) {
    return resolveErrorStateContent(mappedVariant);
  }

  const def = ERROR_SYSTEM_STATE_DEFINITIONS[stateType];
  return {
    variant: "custom",
    title: def.heading,
    description: def.description,
    primaryLabel: def.primaryAction
      ? errorSystemActionLabel(stateType, def.primaryAction)
      : null,
    secondaryLabel: def.secondaryAction
      ? errorSystemActionLabel(stateType, def.secondaryAction)
      : null,
    showErrorId: def.showErrorId,
  };
}

export function systemTypeToErrorStateVariant(
  stateType: ErrorSystemStateType,
): ErrorStateVariant {
  return CORE_SYSTEM_TO_VARIANT[stateType] ?? "custom";
}
