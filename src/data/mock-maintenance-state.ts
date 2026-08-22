/**
 * Mock maintenance state — COMPONENT-076.
 * No backend — env and config only.
 */

import { MAINTENANCE_STATE_COPY } from "@/config/maintenance-state";

export type MockMaintenanceState = {
  expectedAvailability: string | null;
  statusActionLabel: string | null;
};

const ENV_ETA = process.env.NEXT_PUBLIC_MOCK_MAINTENANCE_ETA?.trim();
const ENV_ENABLED = process.env.NEXT_PUBLIC_MOCK_MAINTENANCE === "true";

/** Mock bundle — public ETA only when env provides user-safe copy. */
export function getMockMaintenanceState(): MockMaintenanceState {
  let expectedAvailability: string | null = null;

  if (ENV_ETA) {
    expectedAvailability = ENV_ETA;
  } else if (ENV_ENABLED) {
    expectedAvailability = MAINTENANCE_STATE_COPY.expectedAvailabilityDefault;
  }

  return {
    expectedAvailability,
    statusActionLabel: null,
  };
}
