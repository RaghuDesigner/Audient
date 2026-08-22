/**
 * COMPONENT-022 — Filter Bar helpers.
 * Active-state and date-range checks — no React / no API.
 */

import type { FilterBarCustomRange, FilterBarFilters } from "@/config/filter-bar";
import { FILTER_BAR_DEFAULT_FILTERS } from "@/config/filter-bar";

export function isCustomDateRangeValid(range: FilterBarCustomRange): boolean {
  if (!range.start || !range.end) return false;
  return range.start <= range.end;
}

export function isFilterBarActive(filters: FilterBarFilters): boolean {
  return (
    filters.status.length > 0 ||
    filters.type.length > 0 ||
    filters.membership.length > 0 ||
    filters.datePreset !== "all"
  );
}

export function countActiveFilterGroups(filters: FilterBarFilters): number {
  let count = 0;
  if (filters.status.length > 0) count += 1;
  if (filters.type.length > 0) count += 1;
  if (filters.membership.length > 0) count += 1;
  if (filters.datePreset !== "all") count += 1;
  return count;
}

export function resetFilterBarFilters(): FilterBarFilters {
  return {
    status: [],
    type: [],
    membership: [],
    datePreset: FILTER_BAR_DEFAULT_FILTERS.datePreset,
    customRange: { start: null, end: null },
  };
}
