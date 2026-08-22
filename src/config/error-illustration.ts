/**
 * Error Illustration config — COMPONENT-073.
 * Type keys, sizing, asset paths, and extended fallbacks.
 * @see docs/components/COMPONENT_ERROR_ILLUSTRATION.md
 */

import type { ErrorStateSize } from "@/config/error-state";
import type { ErrorSystemStateType } from "@/config/error-system-states";

export const ERROR_ILLUSTRATION_TYPES = [
  "not_found",
  "forbidden",
  "server_error",
  "network_error",
  "maintenance",
  "generic_error",
] as const;

export type ErrorIllustrationType = (typeof ERROR_ILLUSTRATION_TYPES)[number];

/** Optional brand SVG paths — null uses Lucide fallback until Figma assets ship. */
export const ERROR_ILLUSTRATION_ASSETS: Record<
  ErrorIllustrationType,
  string | null
> = {
  not_found: null,
  forbidden: null,
  server_error: null,
  network_error: null,
  maintenance: null,
  generic_error: null,
};

/** Outer container + inner icon scale by Error State size. */
export const ERROR_ILLUSTRATION_SIZE: Record<
  ErrorStateSize,
  { container: string; icon: string }
> = {
  page: {
    container: "size-16 sm:size-20",
    icon: "size-8",
  },
  section: {
    container: "size-14",
    icon: "size-7",
  },
};

/** Short labels when illustration is meaningful (`decorative: false`). */
export const ERROR_ILLUSTRATION_ACCESSIBLE_LABELS: Record<
  ErrorIllustrationType,
  string
> = {
  not_found: "Page not found illustration",
  forbidden: "Access denied illustration",
  server_error: "Server error illustration",
  network_error: "Network connection problem illustration",
  maintenance: "Maintenance in progress illustration",
  generic_error: "Error illustration",
};

/** SCREEN-025 extended keys → closest illustration type. */
export const ERROR_ILLUSTRATION_SYSTEM_FALLBACKS: Partial<
  Record<ErrorSystemStateType, ErrorIllustrationType>
> = {
  session_expired: "generic_error",
  audit_service_unavailable: "server_error",
  maintenance: "maintenance",
};

export function isErrorIllustrationType(
  value: string,
): value is ErrorIllustrationType {
  return (ERROR_ILLUSTRATION_TYPES as readonly string[]).includes(value);
}
