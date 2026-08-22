"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Caption } from "@/components/ui/typography";
import {
  NOTIFICATION_FILTER_COPY,
  NOTIFICATION_FILTER_LABELS,
  NOTIFICATION_FILTER_VALUES,
  type NotificationFilterValue,
  type NotificationFilterVariant,
} from "@/config/notification-filter";
import { notificationFilterAnalytics } from "@/lib/analytics/notification-filter-events";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  countNotificationsMatchingFilter,
  isNotificationFilterValue,
  type NotificationFilterable,
} from "@/utils/notification-filter";
import { cn } from "@/utils/cn";

const selectClass = cn(
  "min-h-11 w-full rounded-md border border-border bg-background px-md",
  "text-body-sm text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

const tabBaseClass = cn(
  "inline-flex min-h-11 shrink-0 items-center gap-sm border px-md py-sm",
  "text-body-sm font-medium text-foreground",
  "transition-colors",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

export type NotificationFilterProps = {
  value: NotificationFilterValue;
  onChange: (value: NotificationFilterValue) => void;
  disabled?: boolean;
  /** Auto: dropdown below md, tablist md+. Force layout when set. */
  variant?: NotificationFilterVariant;
  /** Optional mock rows for per-filter count badges. */
  items?: readonly NotificationFilterable[];
  showCounts?: boolean;
  className?: string;
  id?: string;
};

/**
 * COMPONENT-040 — Notification Filter.
 * Single-select filters; client-side mock only — no backend.
 */
export function NotificationFilter({
  value,
  onChange,
  disabled = false,
  variant,
  items,
  showCounts = false,
  className,
  id,
}: NotificationFilterProps) {
  const labelId = React.useId();
  const isMdUp = useMediaQuery("(min-width: 768px)");
  const tabRefs = React.useRef(new Map<NotificationFilterValue, HTMLButtonElement>());

  const useDropdown =
    variant === "dropdown" || (variant !== "tabs" && variant !== "chips" && !isMdUp);

  const chipShape = variant === "chips";

  const selectFilter = React.useCallback(
    (next: NotificationFilterValue) => {
      if (disabled || next === value) return;
      notificationFilterAnalytics.filterUsed({
        filter: next,
        previousFilter: value,
      });
      onChange(next);
    },
    [disabled, onChange, value],
  );

  const focusTab = (filter: NotificationFilterValue) => {
    tabRefs.current.get(filter)?.focus();
  };

  const handleTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const lastIndex = NOTIFICATION_FILTER_VALUES.length - 1;
    let nextIndex: number | null = null;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = index === lastIndex ? 0 : index + 1;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = index === 0 ? lastIndex : index - 1;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = lastIndex;
        break;
      default:
        return;
    }

    event.preventDefault();
    const next = NOTIFICATION_FILTER_VALUES[nextIndex];
    if (!next) return;
    selectFilter(next);
    focusTab(next);
  };

  const countFor = (filter: NotificationFilterValue): number | null => {
    if (!showCounts || !items) return null;
    return countNotificationsMatchingFilter(items, filter);
  };

  if (useDropdown) {
    return (
      <div id={id} className={cn("w-full", className)}>
        <Caption
          id={labelId}
          className="mb-sm font-semibold text-foreground"
        >
          {NOTIFICATION_FILTER_COPY.mobileSelectLabel}
        </Caption>
        <select
          className={selectClass}
          value={value}
          disabled={disabled}
          aria-labelledby={labelId}
          onChange={(event) => {
            const next = event.target.value;
            if (isNotificationFilterValue(next)) {
              selectFilter(next);
            }
          }}
        >
          {NOTIFICATION_FILTER_VALUES.map((filter) => (
            <option key={filter} value={filter}>
              {NOTIFICATION_FILTER_LABELS[filter]}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <nav
      id={id}
      className={cn("w-full", className)}
      aria-labelledby={labelId}
    >
      <Caption id={labelId} className="sr-only">
        {NOTIFICATION_FILTER_COPY.groupLabel}
      </Caption>

      <div
        role="tablist"
        aria-labelledby={labelId}
        aria-orientation="horizontal"
        aria-disabled={disabled || undefined}
        className={cn(
          "flex gap-sm overflow-x-auto pb-xs",
          "md:flex-wrap md:overflow-visible md:pb-0",
          "-mx-xs px-xs md:mx-0 md:px-0",
        )}
      >
        {NOTIFICATION_FILTER_VALUES.map((filter, index) => {
          const selected = filter === value;
          const count = countFor(filter);

          return (
            <button
              key={filter}
              ref={(node) => {
                if (node) tabRefs.current.set(filter, node);
                else tabRefs.current.delete(filter);
              }}
              type="button"
              role="tab"
              id={`notification-filter-${filter}`}
              aria-selected={selected}
              aria-controls={undefined}
              tabIndex={selected ? 0 : -1}
              disabled={disabled}
              onClick={() => selectFilter(filter)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={cn(
                tabBaseClass,
                chipShape ? "rounded-full" : "rounded-md",
                selected
                  ? "border-primary bg-primary/5 font-semibold"
                  : "border-border bg-background hover:bg-muted/50",
              )}
            >
              <span>{NOTIFICATION_FILTER_LABELS[filter]}</span>
              {count != null && count > 0 ? (
                <Badge variant="secondary" size="sm" shape="rounded">
                  {count}
                </Badge>
              ) : null}
              {selected ? (
                <span className="sr-only">
                  {NOTIFICATION_FILTER_COPY.selectedSuffix(
                    NOTIFICATION_FILTER_LABELS[filter],
                  )}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
