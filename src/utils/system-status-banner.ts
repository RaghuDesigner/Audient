/**
 * System Status Banner helpers — COMPONENT-075.
 */

import {
  SYSTEM_STATUS_BANNER_DEFINITIONS,
  SYSTEM_STATUS_BANNER_DISMISS_STORAGE_PREFIX,
  isSystemStatusBannerStatus,
  type SystemStatusBannerStatus,
} from "@/config/system-status-banner";

export function parseSystemStatusBannerParam(
  value: string | null | undefined,
): SystemStatusBannerStatus | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return isSystemStatusBannerStatus(normalized) ? normalized : null;
}

export function systemStatusDismissStorageKey(
  status: SystemStatusBannerStatus,
): string {
  return `${SYSTEM_STATUS_BANNER_DISMISS_STORAGE_PREFIX}:${status}`;
}

export function readSystemStatusDismissed(
  status: SystemStatusBannerStatus,
): boolean {
  if (typeof window === "undefined") return false;
  try {
    return (
      window.localStorage.getItem(systemStatusDismissStorageKey(status)) ===
      "1"
    );
  } catch {
    return false;
  }
}

export function writeSystemStatusDismissed(
  status: SystemStatusBannerStatus,
  dismissed: boolean,
): void {
  if (typeof window === "undefined") return;
  try {
    const key = systemStatusDismissStorageKey(status);
    if (dismissed) {
      window.localStorage.setItem(key, "1");
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    // ignore storage failures in mock phase
  }
}

export function resolveSystemStatusBannerContent(
  status: SystemStatusBannerStatus,
  overrides?: {
    message?: string;
    actionLabel?: string | null;
    dismissible?: boolean;
  },
) {
  const def = SYSTEM_STATUS_BANNER_DEFINITIONS[status];
  return {
    status,
    label: def.label,
    message: overrides?.message ?? def.message,
    actionLabel:
      overrides?.actionLabel !== undefined
        ? overrides.actionLabel
        : def.actionLabel,
    dismissible: overrides?.dismissible ?? def.dismissible,
    live: def.live,
  };
}

export type SystemStatusBannerSurfaceClasses = {
  container: string;
  indicator: string;
  icon: string;
};

export function systemStatusBannerSurfaceClasses(
  status: SystemStatusBannerStatus,
): SystemStatusBannerSurfaceClasses {
  switch (status) {
    case "operational":
      return {
        container: "border-success/30 bg-success/5 text-foreground",
        indicator: "text-success",
        icon: "text-success",
      };
    case "degraded":
      return {
        container: "border-warning/40 bg-warning/10 text-foreground",
        indicator: "text-warning",
        icon: "text-warning",
      };
    case "unavailable":
      return {
        container: "border-error/40 bg-error/5 text-foreground",
        indicator: "text-error",
        icon: "text-error",
      };
    case "maintenance":
      return {
        container: "border-border bg-muted text-foreground",
        indicator: "text-foreground",
        icon: "text-muted-foreground",
      };
    default:
      return {
        container: "border-border bg-muted text-foreground",
        indicator: "text-foreground",
        icon: "text-muted-foreground",
      };
  }
}
