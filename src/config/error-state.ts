/**
 * Error State defaults — COMPONENT-072.
 * Core variants: 404, 403, 500, Network, Generic.
 * @see docs/components/COMPONENT_ERROR_STATE.md
 */

export const ERROR_STATE_VARIANTS = [
  "not_found",
  "forbidden",
  "server_error",
  "network_error",
  "generic_error",
  "custom",
] as const;

export type ErrorStateVariant = (typeof ERROR_STATE_VARIANTS)[number];

export type ErrorStateSize = "section" | "page";

export type ErrorStateDefaults = {
  title: string;
  description: string;
  primaryLabel: string | null;
  secondaryLabel: string | null;
  showErrorId: boolean;
};

export const ERROR_STATE_COPY = {
  errorIdLabel: "Error ID",
  retryBusy: "Retrying…",
} as const;

/** Authoritative copy for the five core error variants. */
export const ERROR_STATE_DEFAULTS: Record<
  Exclude<ErrorStateVariant, "custom">,
  ErrorStateDefaults
> = {
  not_found: {
    title: "Page not found",
    description:
      "The page you're looking for doesn't exist or may have moved.",
    primaryLabel: "Go to Dashboard",
    secondaryLabel: "Go Back",
    showErrorId: false,
  },
  forbidden: {
    title: "Access denied",
    description: "You don't have permission to access this page.",
    primaryLabel: "Go to Dashboard",
    secondaryLabel: "Back",
    showErrorId: false,
  },
  server_error: {
    title: "Something went wrong",
    description: "We couldn't complete your request.",
    primaryLabel: "Try Again",
    secondaryLabel: "Go to Dashboard",
    showErrorId: true,
  },
  network_error: {
    title: "Connection problem",
    description: "Check your internet connection and try again.",
    primaryLabel: "Retry",
    secondaryLabel: null,
    showErrorId: false,
  },
  generic_error: {
    title: "Something went wrong",
    description:
      "We couldn't complete your request. Please try again or return to the dashboard.",
    primaryLabel: "Try Again",
    secondaryLabel: "Go to Dashboard",
    showErrorId: true,
  },
};

export function isErrorStateVariant(value: string): value is ErrorStateVariant {
  return (ERROR_STATE_VARIANTS as readonly string[]).includes(value);
}

export function errorStateVariantShowsErrorId(
  variant: ErrorStateVariant,
): boolean {
  if (variant === "custom") return false;
  return ERROR_STATE_DEFAULTS[variant].showErrorId;
}
