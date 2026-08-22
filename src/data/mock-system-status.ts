/**
 * Mock system status — COMPONENT-075.
 * No monitoring API — config / query / env only.
 */

import type { SystemStatusBannerStatus } from "@/config/system-status-banner";
import { SYSTEM_STATUS_BANNER_DEFINITIONS } from "@/config/system-status-banner";

export type MockSystemStatus = {
  status: SystemStatusBannerStatus;
  message?: string;
  actionLabel?: string | null;
  dismissible?: boolean;
};

const ENV_MOCK_STATUS = process.env.NEXT_PUBLIC_MOCK_SYSTEM_STATUS?.trim();

function envMockStatus(): SystemStatusBannerStatus | null {
  if (!ENV_MOCK_STATUS) return null;
  const normalized = ENV_MOCK_STATUS.toLowerCase();
  if (
    normalized === "operational" ||
    normalized === "degraded" ||
    normalized === "unavailable" ||
    normalized === "maintenance"
  ) {
    return normalized;
  }
  return null;
}

/** Default mock — operational hides banner in app shell. */
export function getDefaultMockSystemStatus(): MockSystemStatus {
  const fromEnv = envMockStatus();
  const status = fromEnv ?? "operational";
  const def = SYSTEM_STATUS_BANNER_DEFINITIONS[status];

  return {
    status,
    message: def.message,
    actionLabel: def.actionLabel,
    dismissible: def.dismissible,
  };
}

export function resolveMockSystemStatus(
  override?: Partial<MockSystemStatus> | null,
): MockSystemStatus {
  const base = getDefaultMockSystemStatus();
  if (!override) return base;

  return {
    status: override.status ?? base.status,
    message: override.message ?? base.message,
    actionLabel:
      override.actionLabel !== undefined
        ? override.actionLabel
        : base.actionLabel,
    dismissible: override.dismissible ?? base.dismissible,
  };
}
