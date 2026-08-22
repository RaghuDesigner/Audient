/**
 * SCREEN-009 — Audit History list helpers.
 * Client-side search, filter, sort — mock only.
 */

import type { AuditHistoryCardTier } from "@/config/audit-history-card";
import type { FilterBarFilters } from "@/config/filter-bar";
import type { SortDropdownValue } from "@/config/sort-dropdown";
import type { MockAuditHistoryCard } from "@/data/mock-audit-history-card";
import type { AuthPlanTier } from "@/types/auth";
import { isCustomDateRangeValid } from "@/utils/filter-bar";
import { normalizeSearchQuery } from "@/utils/search-bar";

export function authPlanTierToHistoryCardTier(
  planTier?: AuthPlanTier | null,
): AuditHistoryCardTier {
  if (planTier === "ENTERPRISE") return "business";
  if (planTier === "PRO") return "pro";
  return "free";
}

export function matchesAuditHistorySearch(
  audit: MockAuditHistoryCard,
  query: string,
): boolean {
  const normalized = normalizeSearchQuery(query).toLowerCase();
  if (!normalized) return true;

  const name = audit.websiteName.toLowerCase();
  const url = (audit.websiteUrl ?? "").toLowerCase();
  const id = audit.auditId.toLowerCase();

  return (
    name.includes(normalized) ||
    url.includes(normalized) ||
    id.startsWith(normalized) ||
    id.includes(normalized)
  );
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function matchesDateFilter(
  audit: MockAuditHistoryCard,
  filters: FilterBarFilters,
  now: Date,
): boolean {
  const preset = filters.datePreset;
  if (preset === "all") return true;

  const auditDate = new Date(audit.auditDate);
  if (Number.isNaN(auditDate.getTime())) return false;

  const today = startOfLocalDay(now);

  if (preset === "today") {
    return startOfLocalDay(auditDate).getTime() === today.getTime();
  }

  if (preset === "last_7_days") {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    return auditDate >= start;
  }

  if (preset === "last_30_days") {
    const start = new Date(today);
    start.setDate(start.getDate() - 29);
    return auditDate >= start;
  }

  if (preset === "custom") {
    const { customRange } = filters;
    if (!isCustomDateRangeValid(customRange)) return true;
    const start = customRange.start as string;
    const end = customRange.end as string;
    const key = audit.auditDate.slice(0, 10);
    return key >= start && key <= end;
  }

  return true;
}

export function matchesAuditHistoryFilters(
  audit: MockAuditHistoryCard,
  filters: FilterBarFilters,
  now: Date = new Date(),
): boolean {
  if (audit.status === "loading") return false;

  if (filters.status.length > 0 && !filters.status.includes(audit.status)) {
    return false;
  }

  if (filters.type.length > 0 && !filters.type.includes(audit.auditType)) {
    return false;
  }

  if (
    filters.membership.length > 0 &&
    (audit.planUsed == null || !filters.membership.includes(audit.planUsed))
  ) {
    return false;
  }

  return matchesDateFilter(audit, filters, now);
}

export function sortAuditHistory(
  audits: readonly MockAuditHistoryCard[],
  sort: SortDropdownValue,
): MockAuditHistoryCard[] {
  const copy = [...audits];

  copy.sort((a, b) => {
    if (sort === "newest" || sort === "oldest" || sort === "recently_viewed") {
      const delta =
        new Date(b.auditDate).getTime() - new Date(a.auditDate).getTime();
      if (delta !== 0) return sort === "oldest" ? -delta : delta;
      return a.auditId.localeCompare(b.auditId);
    }

    const aScore = a.score;
    const bScore = b.score;
    const aMissing = aScore == null;
    const bMissing = bScore == null;
    if (aMissing && bMissing) return a.auditId.localeCompare(b.auditId);
    if (aMissing) return 1;
    if (bMissing) return -1;

    const delta = (bScore as number) - (aScore as number);
    if (delta !== 0) return sort === "score_asc" ? -delta : delta;
    return a.auditId.localeCompare(b.auditId);
  });

  return copy;
}

export function queryAuditHistory(input: {
  audits: readonly MockAuditHistoryCard[];
  query: string;
  filters: FilterBarFilters;
  sort: SortDropdownValue;
  now?: Date;
}): MockAuditHistoryCard[] {
  const now = input.now ?? new Date();
  const filtered = input.audits.filter(
    (audit) =>
      matchesAuditHistorySearch(audit, input.query) &&
      matchesAuditHistoryFilters(audit, input.filters, now),
  );
  return sortAuditHistory(filtered, input.sort);
}
