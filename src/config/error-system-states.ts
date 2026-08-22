/**
 * SCREEN-025 — Error & System States constants.
 * Copy, action keys, and routes — mock only; no backend integration.
 * @see docs/screens/SCREEN-025_ERROR_AND_SYSTEM_STATES.md
 */

export const ERROR_SYSTEM_STATE_TYPES = [
  "not_found",
  "forbidden",
  "server_error",
  "network_error",
  "session_expired",
  "audit_service_unavailable",
  "maintenance",
  "generic_error",
] as const;

export type ErrorSystemStateType = (typeof ERROR_SYSTEM_STATE_TYPES)[number];

export const ERROR_SYSTEM_ACTIONS = [
  "retry",
  "go_back",
  "go_to_dashboard",
  "login",
] as const;

export type ErrorSystemAction = (typeof ERROR_SYSTEM_ACTIONS)[number];

export type ErrorSystemStateDefinition = {
  heading: string;
  description: string;
  primaryAction: ErrorSystemAction | null;
  secondaryAction: ErrorSystemAction | null;
  tertiaryAction?: ErrorSystemAction | null;
  showErrorId: boolean;
};

/** QA demo route — `?state={type}` selects mocked error surface. */
export const ERROR_SYSTEM_QA_ROUTE = "/system/error";

export const ERROR_SYSTEM_DASHBOARD_ROUTE = "/dashboard";

export const ERROR_SYSTEM_HOME_ROUTE = "/";

export const ERROR_SYSTEM_SIGN_IN_ROUTE = "/sign-in";

export const ERROR_SYSTEM_ERROR_ID_PREFIX = "AUD-ERR-";

export const ERROR_SYSTEM_COPY = {
  errorIdLabel: "Error ID",
  retryBusy: "Retrying…",
  actionRetry: "Retry",
  actionTryAgain: "Try Again",
  actionGoBack: "Go Back",
  actionBack: "Back",
  actionGoToDashboard: "Go to Dashboard",
  actionBackToDashboard: "Back to Dashboard",
  actionLogin: "Login",
} as const;

export const ERROR_SYSTEM_STATE_DEFINITIONS: Record<
  ErrorSystemStateType,
  ErrorSystemStateDefinition
> = {
  not_found: {
    heading: "Page not found",
    description:
      "The page you're looking for doesn't exist or may have moved.",
    primaryAction: "go_to_dashboard",
    secondaryAction: "go_back",
    showErrorId: false,
  },
  forbidden: {
    heading: "Access denied",
    description: "You don't have permission to access this page.",
    primaryAction: "go_to_dashboard",
    secondaryAction: "go_back",
    showErrorId: false,
  },
  server_error: {
    heading: "Something went wrong",
    description: "We couldn't complete your request.",
    primaryAction: "retry",
    secondaryAction: "go_to_dashboard",
    showErrorId: true,
  },
  network_error: {
    heading: "Connection problem",
    description: "Check your internet connection and try again.",
    primaryAction: "retry",
    secondaryAction: null,
    showErrorId: false,
  },
  session_expired: {
    heading: "Your session has expired",
    description: "Please log in again to continue.",
    primaryAction: "login",
    secondaryAction: null,
    showErrorId: false,
  },
  audit_service_unavailable: {
    heading: "Audit service temporarily unavailable",
    description: "Audient couldn't complete the audit service request.",
    primaryAction: "retry",
    secondaryAction: "go_to_dashboard",
    showErrorId: true,
  },
  maintenance: {
    heading: "Audient is temporarily unavailable",
    description: "We're performing maintenance. Please try again later.",
    primaryAction: "retry",
    secondaryAction: "go_to_dashboard",
    showErrorId: false,
  },
  generic_error: {
    heading: "Something went wrong",
    description:
      "We couldn't complete your request. Please try again or return to the dashboard.",
    primaryAction: "retry",
    secondaryAction: "go_to_dashboard",
    showErrorId: true,
  },
};

export const ERROR_SYSTEM_ACTION_LABELS: Record<ErrorSystemAction, string> = {
  retry: ERROR_SYSTEM_COPY.actionTryAgain,
  go_back: ERROR_SYSTEM_COPY.actionGoBack,
  go_to_dashboard: ERROR_SYSTEM_COPY.actionGoToDashboard,
  login: ERROR_SYSTEM_COPY.actionLogin,
};

/** Per-state action label overrides where spec copy differs. */
export const ERROR_SYSTEM_ACTION_LABEL_OVERRIDES: Partial<
  Record<ErrorSystemStateType, Partial<Record<ErrorSystemAction, string>>>
> = {
  not_found: {
    go_to_dashboard: ERROR_SYSTEM_COPY.actionGoToDashboard,
    go_back: ERROR_SYSTEM_COPY.actionGoBack,
  },
  forbidden: {
    go_back: ERROR_SYSTEM_COPY.actionBack,
  },
  network_error: {
    retry: ERROR_SYSTEM_COPY.actionRetry,
  },
  audit_service_unavailable: {
    go_to_dashboard: ERROR_SYSTEM_COPY.actionBackToDashboard,
  },
  maintenance: {
    retry: ERROR_SYSTEM_COPY.actionRetry,
    go_to_dashboard: ERROR_SYSTEM_COPY.actionBackToDashboard,
  },
};

export const ERROR_SYSTEM_ANALYTICS_SOURCE = "error_system_states";

export function isErrorSystemStateType(
  value: string,
): value is ErrorSystemStateType {
  return (ERROR_SYSTEM_STATE_TYPES as readonly string[]).includes(value);
}

export function errorSystemActionLabel(
  state: ErrorSystemStateType,
  action: ErrorSystemAction,
): string {
  return (
    ERROR_SYSTEM_ACTION_LABEL_OVERRIDES[state]?.[action] ??
    ERROR_SYSTEM_ACTION_LABELS[action]
  );
}
