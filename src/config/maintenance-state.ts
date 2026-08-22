/**
 * Maintenance State config — COMPONENT-076.
 * @see docs/components/COMPONENT_MAINTENANCE_STATE.md
 */

import { ERROR_SYSTEM_COPY } from "@/config/error-system-states";
import type { ErrorStateSize } from "@/config/error-state";

export type MaintenanceStateSize = ErrorStateSize;

export const MAINTENANCE_STATE_COPY = {
  heading: "Audient is temporarily unavailable",
  description: "We're performing maintenance. Please try again later.",
  expectedAvailabilityDefault: "We expect to be back soon.",
  primaryLabel: ERROR_SYSTEM_COPY.actionRetry,
  secondaryLabel: ERROR_SYSTEM_COPY.actionBackToDashboard,
} as const;

export const MAINTENANCE_STATE_ACTIONS = {
  primary: "retry" as const,
  secondary: "go_to_dashboard" as const,
};

export type MaintenanceStateContent = {
  heading: string;
  description: string;
  expectedAvailability: string | null;
  primaryLabel: string;
  secondaryLabel: string;
};

export function resolveMaintenanceStateContent(overrides?: {
  heading?: string;
  description?: string;
  expectedAvailability?: string | null;
  primaryLabel?: string;
  secondaryLabel?: string;
}): MaintenanceStateContent {
  return {
    heading: overrides?.heading ?? MAINTENANCE_STATE_COPY.heading,
    description: overrides?.description ?? MAINTENANCE_STATE_COPY.description,
    expectedAvailability:
      overrides?.expectedAvailability !== undefined
        ? overrides.expectedAvailability
        : null,
    primaryLabel: overrides?.primaryLabel ?? MAINTENANCE_STATE_COPY.primaryLabel,
    secondaryLabel:
      overrides?.secondaryLabel ?? MAINTENANCE_STATE_COPY.secondaryLabel,
  };
}
