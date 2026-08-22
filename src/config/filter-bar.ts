/**
 * COMPONENT-022 — Filter Bar constants.
 * Bar chrome + controlled filter shape. Option enums live in audit-history.
 */

import {
  AUDIT_HISTORY_DATE_PRESETS,
  AUDIT_HISTORY_DATE_PRESET_LABELS,
  AUDIT_HISTORY_PLAN_LABELS,
  AUDIT_HISTORY_PLANS,
  AUDIT_HISTORY_STATUS_LABELS,
  AUDIT_HISTORY_STATUSES,
  AUDIT_HISTORY_TYPE_LABELS,
  AUDIT_HISTORY_TYPES,
  type AuditHistoryDatePreset,
  type AuditHistoryPlan,
  type AuditHistoryStatus,
  type AuditHistoryType,
} from "@/config/audit-history";

export const FILTER_BAR_MODULES = ["history", "reports"] as const;

export type FilterBarModule = (typeof FILTER_BAR_MODULES)[number];

export const FILTER_BAR_STATES = ["default", "loading", "disabled"] as const;

export type FilterBarState = (typeof FILTER_BAR_STATES)[number];

/** Which filter panel is expanded (null = all collapsed). */
export const FILTER_BAR_PANELS = [
  "status",
  "type",
  "membership",
  "date",
] as const;

export type FilterBarPanel = (typeof FILTER_BAR_PANELS)[number];

export const FILTER_BAR_CLEAR_LABEL = "Clear filters";

export const FILTER_BAR_MOBILE_TRIGGER_LABEL = "Filters";

/** Group labels for fieldsets / triggers. */
export const FILTER_BAR_GROUP_LABELS: Record<FilterBarPanel, string> = {
  status: "Status",
  type: "Audit type",
  membership: "Membership",
  date: "Date",
};

/** Inclusive custom date range (ISO date strings `YYYY-MM-DD`). */
export type FilterBarCustomRange = {
  start: string | null;
  end: string | null;
};

/**
 * Controlled filter object — COMPONENT_FILTER_BAR §6.
 * Empty arrays / `all` date = no constraint for that group.
 */
export type FilterBarFilters = {
  status: AuditHistoryStatus[];
  type: AuditHistoryType[];
  membership: AuditHistoryPlan[];
  datePreset: AuditHistoryDatePreset;
  customRange: FilterBarCustomRange;
};

export const FILTER_BAR_DEFAULT_FILTERS: FilterBarFilters = {
  status: [],
  type: [],
  membership: [],
  datePreset: "all",
  customRange: { start: null, end: null },
};

/** History option sets — re-exported so FilterBar imports one config. */
export const FILTER_BAR_HISTORY_OPTIONS = {
  status: {
    values: AUDIT_HISTORY_STATUSES,
    labels: AUDIT_HISTORY_STATUS_LABELS,
  },
  type: {
    values: AUDIT_HISTORY_TYPES,
    labels: AUDIT_HISTORY_TYPE_LABELS,
  },
  membership: {
    values: AUDIT_HISTORY_PLANS,
    labels: AUDIT_HISTORY_PLAN_LABELS,
  },
  date: {
    values: AUDIT_HISTORY_DATE_PRESETS,
    labels: AUDIT_HISTORY_DATE_PRESET_LABELS,
  },
} as const;

export const FILTER_BAR_CUSTOM_RANGE_ERROR =
  "Start date must be on or before end date.";
