/**
 * System Status Banner config — COMPONENT-075.
 * @see docs/components/COMPONENT_SYSTEM_STATUS_BANNER.md
 */

export const SYSTEM_STATUS_BANNER_STATUSES = [
  "operational",
  "degraded",
  "unavailable",
  "maintenance",
] as const;

export type SystemStatusBannerStatus =
  (typeof SYSTEM_STATUS_BANNER_STATUSES)[number];

/** Severity order — highest wins when merging mock flags. */
export const SYSTEM_STATUS_BANNER_SEVERITY: Record<
  SystemStatusBannerStatus,
  number
> = {
  operational: 0,
  degraded: 1,
  maintenance: 2,
  unavailable: 3,
};

export type SystemStatusBannerDefinition = {
  label: string;
  message: string;
  actionLabel: string | null;
  dismissible: boolean;
  live: "polite" | "assertive";
};

export const SYSTEM_STATUS_BANNER_COPY = {
  dismissLabel: "Dismiss system status banner",
  actionRetry: "Retry",
} as const;

export const SYSTEM_STATUS_BANNER_DEFINITIONS: Record<
  SystemStatusBannerStatus,
  SystemStatusBannerDefinition
> = {
  operational: {
    label: "Operational",
    message: "All systems operational.",
    actionLabel: null,
    dismissible: false,
    live: "polite",
  },
  degraded: {
    label: "Degraded",
    message:
      "Some Audient services are running slowly. You may experience delays.",
    actionLabel: SYSTEM_STATUS_BANNER_COPY.actionRetry,
    dismissible: true,
    live: "polite",
  },
  unavailable: {
    label: "Unavailable",
    message:
      "Audient is temporarily unavailable. We're working to restore service.",
    actionLabel: SYSTEM_STATUS_BANNER_COPY.actionRetry,
    dismissible: true,
    live: "assertive",
  },
  maintenance: {
    label: "Maintenance",
    message:
      "Audient is undergoing scheduled maintenance. Please try again later.",
    actionLabel: null,
    dismissible: false,
    live: "polite",
  },
};

export const SYSTEM_STATUS_BANNER_QA_PARAM = "systemStatus";

export const SYSTEM_STATUS_BANNER_DISMISS_STORAGE_PREFIX =
  "audient-system-status-dismissed";

export function isSystemStatusBannerStatus(
  value: string,
): value is SystemStatusBannerStatus {
  return (SYSTEM_STATUS_BANNER_STATUSES as readonly string[]).includes(value);
}

export function pickHigherSeverityStatus(
  current: SystemStatusBannerStatus,
  candidate: SystemStatusBannerStatus,
): SystemStatusBannerStatus {
  return SYSTEM_STATUS_BANNER_SEVERITY[candidate] >
    SYSTEM_STATUS_BANNER_SEVERITY[current]
    ? candidate
    : current;
}
