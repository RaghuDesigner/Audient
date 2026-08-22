/**
 * Error Illustration helpers — COMPONENT-073.
 */

import type { ErrorIllustrationType } from "@/config/error-illustration";
import { ERROR_ILLUSTRATION_SYSTEM_FALLBACKS } from "@/config/error-illustration";
import type { ErrorStateVariant } from "@/config/error-state";
import type { ErrorSystemStateType } from "@/config/error-system-states";

const VARIANT_TO_ILLUSTRATION: Partial<
  Record<ErrorStateVariant, ErrorIllustrationType>
> = {
  not_found: "not_found",
  forbidden: "forbidden",
  server_error: "server_error",
  network_error: "network_error",
  generic_error: "generic_error",
  custom: "generic_error",
};

export function resolveErrorIllustrationType(
  variant: ErrorStateVariant,
): ErrorIllustrationType {
  return VARIANT_TO_ILLUSTRATION[variant] ?? "generic_error";
}

export function resolveErrorIllustrationTypeFromSystem(
  stateType: ErrorSystemStateType,
): ErrorIllustrationType {
  if (stateType in ERROR_ILLUSTRATION_SYSTEM_FALLBACKS) {
    return ERROR_ILLUSTRATION_SYSTEM_FALLBACKS[stateType]!;
  }
  if (isCoreIllustrationKey(stateType)) {
    return stateType;
  }
  return "generic_error";
}

function isCoreIllustrationKey(
  value: ErrorSystemStateType,
): value is ErrorIllustrationType {
  return (
    value === "not_found" ||
    value === "forbidden" ||
    value === "server_error" ||
    value === "network_error" ||
    value === "maintenance" ||
    value === "generic_error"
  );
}
