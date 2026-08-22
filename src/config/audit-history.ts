/**
 * SCREEN-009 / SCREEN-012–013 — Audit History constants.
 * Filter, sort, pagination, and empty-copy — no UI.
 */

export const AUDIT_HISTORY_ROUTE = "/history";

export const AUDIT_HISTORY_SEARCH_DEBOUNCE_MS = 300;

export const AUDIT_HISTORY_PAGE_SIZE = 10;

export const AUDIT_HISTORY_STATES = [
  "loading",
  "success",
  "empty",
  "error",
] as const;

export type AuditHistoryScreenState =
  (typeof AUDIT_HISTORY_STATES)[number];

/** Filter: audit lifecycle status (excludes loading skeleton). */
export const AUDIT_HISTORY_STATUSES = [
  "completed",
  "processing",
  "failed",
] as const;

export type AuditHistoryStatus = (typeof AUDIT_HISTORY_STATUSES)[number];

export const AUDIT_HISTORY_STATUS_LABELS: Record<AuditHistoryStatus, string> = {
  completed: "Completed",
  processing: "Processing",
  failed: "Failed",
};

/** Filter: input modality. */
export const AUDIT_HISTORY_TYPES = ["website", "screenshot"] as const;

export type AuditHistoryType = (typeof AUDIT_HISTORY_TYPES)[number];

export const AUDIT_HISTORY_TYPE_LABELS: Record<AuditHistoryType, string> = {
  website: "Website",
  screenshot: "Screenshot",
};

/** Filter: plan used for the audit. */
export const AUDIT_HISTORY_PLANS = ["free", "pro", "business"] as const;

export type AuditHistoryPlan = (typeof AUDIT_HISTORY_PLANS)[number];

export const AUDIT_HISTORY_PLAN_LABELS: Record<AuditHistoryPlan, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business",
};

/** Filter: relative date presets (custom range handled in hook state). */
export const AUDIT_HISTORY_DATE_PRESETS = [
  "all",
  "today",
  "last_7_days",
  "last_30_days",
  "custom",
] as const;

export type AuditHistoryDatePreset =
  (typeof AUDIT_HISTORY_DATE_PRESETS)[number];

export const AUDIT_HISTORY_DATE_PRESET_LABELS: Record<
  AuditHistoryDatePreset,
  string
> = {
  all: "All dates",
  today: "Today",
  last_7_days: "Last 7 Days",
  last_30_days: "Last 30 Days",
  custom: "Custom Range",
};

/** Sort dropdown — default newest first. */
export const AUDIT_HISTORY_SORTS = [
  "newest",
  "oldest",
  "highest_score",
  "lowest_score",
] as const;

export type AuditHistorySort = (typeof AUDIT_HISTORY_SORTS)[number];

export const AUDIT_HISTORY_SORT_LABELS: Record<AuditHistorySort, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  highest_score: "Highest score",
  lowest_score: "Lowest score",
};

export const AUDIT_HISTORY_DEFAULT_SORT: AuditHistorySort = "newest";

/** Page chrome. */
export const AUDIT_HISTORY_TITLE = "Audit History";

export const AUDIT_HISTORY_BREADCRUMB = {
  home: "Home",
  homeHref: "/dashboard",
  current: "History",
} as const;

export const AUDIT_HISTORY_COPY = {
  pageTitle: AUDIT_HISTORY_TITLE,
  pageDescription: "View and manage your previous UX audits.",
  guestRedirect: "Redirecting to sign in…",
  resultCount: (n: number) =>
    n === 1 ? "1 audit" : `${n} audits`,
  duplicateSoon: "Duplicate audit is coming soon.",
  pdfSoon: "PDF download is coming soon.",
  compareSoon: "Compare reports is coming soon.",
} as const;

export const AUDIT_HISTORY_ANALYTICS_SOURCE = "audit_history" as const;

export const AUDIT_HISTORY_QA_STATE_PARAM = "state" as const;

/**
 * Empty copy — SCREEN-013 / filtered empty.
 */
export const AUDIT_HISTORY_EMPTY = {
  never: {
    headline: "No audits yet",
    description:
      "Run your first UX audit to see your results here.",
    primaryLabel: "Start an Audit",
  },
  noMatches: {
    headline: "No matching audits",
    description:
      "Try a different search or clear filters to see more of your library.",
    primaryLabel: "Start an Audit",
    clearFiltersLabel: "Clear filters",
  },
  error: {
    headline: "Couldn’t load history",
    description: "Something went wrong loading your audits. Please try again.",
    primaryLabel: "Retry",
  },
} as const;

/** Period group key for “this calendar year” bucket. */
export const AUDIT_HISTORY_THIS_YEAR_KEY = "this_year";

/**
 * Human label for a period group key.
 * `this_year` → “This year”; otherwise the calendar year string.
 */
export function auditHistoryPeriodLabel(
  periodKey: string,
  now: Date = new Date(),
): string {
  if (periodKey === AUDIT_HISTORY_THIS_YEAR_KEY) {
    return "This year";
  }
  const year = Number(periodKey);
  if (!Number.isNaN(year) && year === now.getFullYear()) {
    return "This year";
  }
  return periodKey;
}
