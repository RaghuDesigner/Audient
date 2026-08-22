/**
 * Error & System States analytics — SCREEN-025.
 * Dev stub — error type and opaque id only; no PII or stack traces.
 */

import { ERROR_SYSTEM_ANALYTICS_SOURCE } from "@/config/error-system-states";
import type { ErrorSystemStateType } from "@/config/error-system-states";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function base(extra?: Props): Props {
  return {
    source: ERROR_SYSTEM_ANALYTICS_SOURCE,
    mock: true,
    ...extra,
  };
}

const VIEW_EVENT_BY_STATE: Record<ErrorSystemStateType, string> = {
  not_found: "error_404_viewed",
  forbidden: "error_403_viewed",
  server_error: "error_500_viewed",
  network_error: "error_network_viewed",
  session_expired: "error_session_expired_viewed",
  audit_service_unavailable: "error_audit_service_viewed",
  maintenance: "error_maintenance_viewed",
  generic_error: "error_generic_viewed",
};

export const errorSystemAnalytics = {
  viewed: (props: {
    errorType: ErrorSystemStateType;
    errorId?: string;
    surface?: "page" | "banner" | "inline";
  }) => {
    const event = VIEW_EVENT_BY_STATE[props.errorType];
    track(event, base(props));
  },

  retryClicked: (props: {
    errorType: ErrorSystemStateType;
    errorId?: string;
  }) => {
    track("error_retry_clicked", base(props));
  },

  dashboardClicked: (props: {
    errorType: ErrorSystemStateType;
    errorId?: string;
  }) => {
    track("error_dashboard_clicked", base(props));
  },
};
