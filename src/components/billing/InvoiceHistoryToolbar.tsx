"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Caption } from "@/components/ui/typography";
import {
  INVOICE_HISTORY_COPY,
  INVOICE_HISTORY_DATE_PRESET_LABELS,
  INVOICE_HISTORY_DATE_PRESETS,
  INVOICE_HISTORY_PLAN_FILTER,
  INVOICE_HISTORY_PLAN_LABELS,
  INVOICE_HISTORY_SEARCH_MAX_LENGTH,
  INVOICE_HISTORY_STATUS_FILTER,
  INVOICE_STATUS_LABELS,
  type InvoiceHistoryDatePreset,
  type InvoiceHistoryPlanFilter,
  type InvoiceHistoryStatusFilter,
} from "@/config/invoice-history";
import type { InvoiceHistoryFilters } from "@/utils/invoice-history";
import { cn } from "@/utils/cn";

export type InvoiceHistoryToolbarProps = {
  filters: InvoiceHistoryFilters;
  searchDraft: string;
  filtersActive: boolean;
  disabled?: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: InvoiceHistoryStatusFilter) => void;
  onPlanChange: (value: InvoiceHistoryPlanFilter) => void;
  onDateChange: (value: InvoiceHistoryDatePreset) => void;
  onClear: () => void;
  className?: string;
};

const selectClass = cn(
  "min-h-11 w-full rounded-md border border-border bg-background px-md",
  "text-body-sm text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

/**
 * Invoice History search + filters (client-side mock).
 */
export function InvoiceHistoryToolbar({
  filters,
  searchDraft,
  filtersActive,
  disabled = false,
  onSearchChange,
  onStatusChange,
  onPlanChange,
  onDateChange,
  onClear,
  className,
}: InvoiceHistoryToolbarProps) {
  return (
    <div
      className={cn("flex w-full flex-col gap-md", className)}
      role="search"
      aria-label={INVOICE_HISTORY_COPY.searchLabel}
    >
      <Input
        type="search"
        label={INVOICE_HISTORY_COPY.searchLabel}
        placeholder={INVOICE_HISTORY_COPY.searchPlaceholder}
        value={searchDraft}
        maxLength={INVOICE_HISTORY_SEARCH_MAX_LENGTH}
        disabled={disabled}
        onChange={(e) => onSearchChange(e.target.value)}
        prefixIcon={<Search className="size-4" aria-hidden />}
        autoComplete="off"
      />

      <div className="grid gap-md sm:grid-cols-3">
        <div className="flex flex-col gap-sm">
          <Caption
            className="font-semibold text-foreground"
            id="invoice-filter-status-label"
          >
            {INVOICE_HISTORY_COPY.filterStatus}
          </Caption>
          <select
            id="invoice-filter-status"
            className={selectClass}
            value={filters.status}
            disabled={disabled}
            aria-labelledby="invoice-filter-status-label"
            onChange={(e) =>
              onStatusChange(e.target.value as InvoiceHistoryStatusFilter)
            }
          >
            {INVOICE_HISTORY_STATUS_FILTER.map((value) => (
              <option key={value} value={value}>
                {value === "all"
                  ? INVOICE_HISTORY_COPY.allStatuses
                  : INVOICE_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-sm">
          <Caption
            className="font-semibold text-foreground"
            id="invoice-filter-plan-label"
          >
            {INVOICE_HISTORY_COPY.filterPlan}
          </Caption>
          <select
            id="invoice-filter-plan"
            className={selectClass}
            value={filters.plan}
            disabled={disabled}
            aria-labelledby="invoice-filter-plan-label"
            onChange={(e) =>
              onPlanChange(e.target.value as InvoiceHistoryPlanFilter)
            }
          >
            {INVOICE_HISTORY_PLAN_FILTER.map((value) => (
              <option key={value} value={value}>
                {value === "all"
                  ? INVOICE_HISTORY_COPY.allPlans
                  : INVOICE_HISTORY_PLAN_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-sm">
          <Caption
            className="font-semibold text-foreground"
            id="invoice-filter-date-label"
          >
            {INVOICE_HISTORY_COPY.filterDate}
          </Caption>
          <select
            id="invoice-filter-date"
            className={selectClass}
            value={filters.datePreset}
            disabled={disabled}
            aria-labelledby="invoice-filter-date-label"
            onChange={(e) =>
              onDateChange(e.target.value as InvoiceHistoryDatePreset)
            }
          >
            {INVOICE_HISTORY_DATE_PRESETS.map((value) => (
              <option key={value} value={value}>
                {INVOICE_HISTORY_DATE_PRESET_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtersActive ? (
        <div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={onClear}
          >
            {INVOICE_HISTORY_COPY.clearFilters}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
