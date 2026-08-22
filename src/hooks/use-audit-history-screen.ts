"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import {
  FILTER_BAR_DEFAULT_FILTERS,
  type FilterBarFilters,
} from "@/config/filter-bar";
import { AUDIT_HISTORY_PAGE_SIZE } from "@/config/audit-history";
import {
  SORT_DROPDOWN_DEFAULT_VALUE,
  type SortDropdownValue,
} from "@/config/sort-dropdown";
import type { MockAuditHistoryCard } from "@/data/mock-audit-history-card";
import { auditHistoryAnalytics } from "@/lib/analytics/audit-history-events";
import {
  auditProcessingRoute,
  auditReportRoute,
} from "@/utils/audit-processing-route";
import { queryAuditHistory } from "@/utils/audit-history";
import { resetFilterBarFilters } from "@/utils/filter-bar";
import { clampPage, totalPages as computeTotalPages } from "@/utils/pagination";

type AuditStatus = Exclude<MockAuditHistoryCard["status"], "loading">;

export function useAuditHistoryScreen(input: {
  auditsProp: MockAuditHistoryCard[];
  loading: boolean;
  isError: boolean;
}) {
  const router = useRouter();
  const viewed = React.useRef(false);
  const [audits, setAudits] = React.useState(input.auditsProp);
  const [query, setQuery] = React.useState("");
  const [filters, setFilters] = React.useState<FilterBarFilters>(
    FILTER_BAR_DEFAULT_FILTERS,
  );
  const [sort, setSort] = React.useState<SortDropdownValue>(
    SORT_DROPDOWN_DEFAULT_VALUE,
  );
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(AUDIT_HISTORY_PAGE_SIZE);
  const [searchKey, setSearchKey] = React.useState(0);
  const [pendingDelete, setPendingDelete] =
    React.useState<MockAuditHistoryCard | null>(null);
  const [deleteState, setDeleteState] = React.useState<"default" | "deleting">(
    "default",
  );

  React.useEffect(() => {
    setAudits(input.auditsProp);
  }, [input.auditsProp]);

  const filtered = React.useMemo(
    () => queryAuditHistory({ audits, query, filters, sort }),
    [audits, filters, query, sort],
  );

  const pages = computeTotalPages(filtered.length, pageSize);
  const safePage = clampPage(page, pages);
  const pageItems = React.useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageSize, safePage]);

  React.useEffect(() => {
    setPage(1);
  }, [query, filters, sort, pageSize]);

  React.useEffect(() => {
    if (viewed.current || input.loading || input.isError) return;
    viewed.current = true;
    auditHistoryAnalytics.viewed({ catalogCount: audits.length });
  }, [audits.length, input.isError, input.loading]);

  const startAudit = () => router.push("/");

  const openAudit = (auditId: string, status: AuditStatus) => {
    auditHistoryAnalytics.opened({ auditId, status });
    if (status === "completed") {
      router.push(auditReportRoute(auditId));
      return;
    }
    if (status === "failed") {
      router.push(auditProcessingRoute(auditId, { fail: "1" }));
      return;
    }
    router.push(auditProcessingRoute(auditId));
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    setDeleteState("deleting");
    const id = pendingDelete.auditId;
    setAudits((prev) => prev.filter((audit) => audit.auditId !== id));
    auditHistoryAnalytics.deleted({ auditId: id });
    setPendingDelete(null);
    setDeleteState("default");
  };

  const clearQueryAndFilters = () => {
    setQuery("");
    setFilters(resetFilterBarFilters());
    setSearchKey((key) => key + 1);
  };

  const onSearch = (next: string) => {
    if (next === query) return;
    auditHistoryAnalytics.searchUsed({ hasQuery: next.length > 0 });
    setQuery(next);
  };

  return {
    audits,
    query,
    filters,
    sort,
    page: safePage,
    pages,
    pageSize,
    pageItems,
    filteredCount: filtered.length,
    searchKey,
    pendingDelete,
    deleteState,
    showNeverEmpty:
      !input.loading && !input.isError && audits.length === 0,
    showFilteredEmpty:
      !input.loading &&
      !input.isError &&
      audits.length > 0 &&
      filtered.length === 0,
    setFilters,
    setSort,
    setPage,
    setPageSize,
    setPendingDelete,
    startAudit,
    openAudit,
    confirmDelete,
    clearQueryAndFilters,
    onSearch,
    clearFilters: () => setFilters(resetFilterBarFilters()),
    cancelDelete: () => {
      if (deleteState === "deleting") return;
      setPendingDelete(null);
    },
  };
}
