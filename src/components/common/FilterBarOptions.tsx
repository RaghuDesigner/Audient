"use client";

import { Caption } from "@/components/ui/typography";
import {
  FILTER_BAR_CUSTOM_RANGE_ERROR,
  FILTER_BAR_HISTORY_OPTIONS,
  type FilterBarFilters,
} from "@/config/filter-bar";
import type { AuditHistoryDatePreset } from "@/config/audit-history";
import { isCustomDateRangeValid } from "@/utils/filter-bar";

export function FilterBarCheckboxSet({
  legend,
  values,
  labels,
  selected,
  disabled,
  onToggleValue,
}: {
  legend: string;
  values: readonly string[];
  labels: Record<string, string> | Readonly<Record<string, string>>;
  selected: readonly string[];
  disabled: boolean;
  onToggleValue: (value: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-sm border-0 p-0">
      <legend className="sr-only">{legend}</legend>
      {values.map((value) => (
        <label
          key={value}
          className="flex min-h-11 cursor-pointer items-center gap-sm text-body-sm"
        >
          <input
            type="checkbox"
            className="size-4 accent-primary"
            checked={selected.includes(value)}
            disabled={disabled}
            onChange={() => onToggleValue(value)}
          />
          {labels[value]}
        </label>
      ))}
    </fieldset>
  );
}

export function FilterBarDatePanel({
  panelId,
  legend,
  filters,
  disabled,
  onChange,
}: {
  panelId: string;
  legend: string;
  filters: FilterBarFilters;
  disabled: boolean;
  onChange: (next: FilterBarFilters) => void;
}) {
  const customInvalid =
    filters.datePreset === "custom" &&
    Boolean(filters.customRange.start || filters.customRange.end) &&
    !isCustomDateRangeValid(filters.customRange);

  return (
    <fieldset className="flex flex-col gap-sm border-0 p-0">
      <legend className="sr-only">{legend}</legend>
      {FILTER_BAR_HISTORY_OPTIONS.date.values.map((preset) => (
        <label
          key={preset}
          className="flex min-h-11 cursor-pointer items-center gap-sm text-body-sm"
        >
          <input
            type="radio"
            name={`${panelId}-date`}
            className="size-4 accent-primary"
            checked={filters.datePreset === preset}
            disabled={disabled}
            onChange={() =>
              onChange({
                ...filters,
                datePreset: preset as AuditHistoryDatePreset,
              })
            }
          />
          {FILTER_BAR_HISTORY_OPTIONS.date.labels[preset]}
        </label>
      ))}
      {filters.datePreset === "custom" ? (
        <div className="mt-sm flex flex-col gap-sm">
          <label className="flex flex-col gap-sm text-info font-semibold">
            Start
            <input
              type="date"
              className="min-h-11 rounded-md border border-border bg-background px-md text-body-sm"
              value={filters.customRange.start ?? ""}
              disabled={disabled}
              onChange={(event) =>
                onChange({
                  ...filters,
                  customRange: {
                    ...filters.customRange,
                    start: event.target.value || null,
                  },
                })
              }
            />
          </label>
          <label className="flex flex-col gap-sm text-info font-semibold">
            End
            <input
              type="date"
              className="min-h-11 rounded-md border border-border bg-background px-md text-body-sm"
              value={filters.customRange.end ?? ""}
              disabled={disabled}
              onChange={(event) =>
                onChange({
                  ...filters,
                  customRange: {
                    ...filters.customRange,
                    end: event.target.value || null,
                  },
                })
              }
            />
          </label>
          {customInvalid ? (
            <Caption className="text-destructive" role="alert">
              {FILTER_BAR_CUSTOM_RANGE_ERROR}
            </Caption>
          ) : null}
        </div>
      ) : null}
    </fieldset>
  );
}
