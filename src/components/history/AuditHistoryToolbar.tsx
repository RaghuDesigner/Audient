"use client";

import { FilterBar } from "@/components/common/FilterBar";
import { SearchBar } from "@/components/common/SearchBar";
import { SortDropdown } from "@/components/common/SortDropdown";
import { Caption } from "@/components/ui/typography";
import {
  AUDIT_HISTORY_COPY,
  AUDIT_HISTORY_SEARCH_DEBOUNCE_MS,
} from "@/config/audit-history";
import type { FilterBarFilters } from "@/config/filter-bar";
import {
  SEARCH_BAR_DEFAULT_ARIA_LABEL,
  SEARCH_BAR_HISTORY_PLACEHOLDER,
} from "@/config/search-bar";
import type { SortDropdownValue } from "@/config/sort-dropdown";
import { cn } from "@/utils/cn";

export type AuditHistoryToolbarProps = {
  query: string;
  filters: FilterBarFilters;
  sort: SortDropdownValue;
  resultCount: number;
  disabled?: boolean;
  loading?: boolean;
  onSearch: (query: string) => void;
  onFiltersChange: (filters: FilterBarFilters) => void;
  onFiltersClear: () => void;
  onSortChange: (sort: SortDropdownValue) => void;
  className?: string;
};

/**
 * SCREEN-009 toolbar — search · filters · sort.
 */
export function AuditHistoryToolbar({
  query,
  filters,
  sort,
  resultCount,
  disabled = false,
  loading = false,
  onSearch,
  onFiltersChange,
  onFiltersClear,
  onSortChange,
  className,
}: AuditHistoryToolbarProps) {
  const controlState = disabled || loading ? "disabled" : "default";

  return (
    <div className={cn("flex flex-col gap-md", className)}>
      <SearchBar
        defaultValue={query}
        onSearch={onSearch}
        module="history"
        placeholder={SEARCH_BAR_HISTORY_PLACEHOLDER}
        ariaLabel={SEARCH_BAR_DEFAULT_ARIA_LABEL}
        debounceMs={AUDIT_HISTORY_SEARCH_DEBOUNCE_MS}
        state={controlState}
      />

      <div className="flex flex-col gap-md lg:flex-row lg:items-start lg:justify-between">
        <FilterBar
          filters={filters}
          onChange={onFiltersChange}
          onClear={onFiltersClear}
          state={controlState}
          module="history"
          className="min-w-0 flex-1"
        />
        <SortDropdown
          value={sort}
          onChange={onSortChange}
          state={controlState === "disabled" ? "disabled" : "closed"}
          module="history"
          className="lg:shrink-0"
        />
      </div>

      <Caption className="text-muted-foreground" aria-live="polite">
        {AUDIT_HISTORY_COPY.resultCount(resultCount)}
      </Caption>
    </div>
  );
}
