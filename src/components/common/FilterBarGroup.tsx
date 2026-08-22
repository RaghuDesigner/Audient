"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import {
  FilterBarCheckboxSet,
  FilterBarDatePanel,
} from "@/components/common/FilterBarOptions";
import {
  FILTER_BAR_GROUP_LABELS,
  FILTER_BAR_HISTORY_OPTIONS,
  type FilterBarFilters,
  type FilterBarPanel,
} from "@/config/filter-bar";
import type {
  AuditHistoryPlan,
  AuditHistoryStatus,
  AuditHistoryType,
} from "@/config/audit-history";
import { cn } from "@/utils/cn";

export type FilterBarGroupProps = {
  panel: FilterBarPanel;
  filters: FilterBarFilters;
  expanded: boolean;
  disabled?: boolean;
  onToggle: (panel: FilterBarPanel) => void;
  onChange: (next: FilterBarFilters) => void;
};

const triggerClass = cn(
  "inline-flex min-h-11 items-center justify-between gap-sm",
  "rounded-md border border-border bg-background px-md",
  "text-body-sm font-medium text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

function toggleValue<T extends string>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

/**
 * One Filter Bar panel — status / type / membership / date.
 */
export function FilterBarGroup({
  panel,
  filters,
  expanded,
  disabled = false,
  onToggle,
  onChange,
}: FilterBarGroupProps) {
  const panelId = React.useId();
  const label = FILTER_BAR_GROUP_LABELS[panel];

  return (
    <div className="relative min-w-0">
      <button
        type="button"
        className={cn(triggerClass, "w-full sm:min-w-40")}
        aria-expanded={expanded}
        aria-controls={panelId}
        aria-haspopup="true"
        disabled={disabled}
        onClick={() => onToggle(panel)}
      >
        <span>{label}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {expanded ? (
        <div
          id={panelId}
          className={cn(
            "absolute left-0 z-dropdown mt-sm min-w-56",
            "rounded-md border border-border bg-popover p-md shadow-md",
          )}
        >
          {panel === "status" ? (
            <FilterBarCheckboxSet
              legend={label}
              values={FILTER_BAR_HISTORY_OPTIONS.status.values}
              labels={FILTER_BAR_HISTORY_OPTIONS.status.labels}
              selected={filters.status}
              disabled={disabled}
              onToggleValue={(value) =>
                onChange({
                  ...filters,
                  status: toggleValue(filters.status, value as AuditHistoryStatus),
                })
              }
            />
          ) : null}

          {panel === "type" ? (
            <FilterBarCheckboxSet
              legend={label}
              values={FILTER_BAR_HISTORY_OPTIONS.type.values}
              labels={FILTER_BAR_HISTORY_OPTIONS.type.labels}
              selected={filters.type}
              disabled={disabled}
              onToggleValue={(value) =>
                onChange({
                  ...filters,
                  type: toggleValue(filters.type, value as AuditHistoryType),
                })
              }
            />
          ) : null}

          {panel === "membership" ? (
            <FilterBarCheckboxSet
              legend={label}
              values={FILTER_BAR_HISTORY_OPTIONS.membership.values}
              labels={FILTER_BAR_HISTORY_OPTIONS.membership.labels}
              selected={filters.membership}
              disabled={disabled}
              onToggleValue={(value) =>
                onChange({
                  ...filters,
                  membership: toggleValue(
                    filters.membership,
                    value as AuditHistoryPlan,
                  ),
                })
              }
            />
          ) : null}

          {panel === "date" ? (
            <FilterBarDatePanel
              panelId={panelId}
              legend={label}
              filters={filters}
              disabled={disabled}
              onChange={onChange}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
