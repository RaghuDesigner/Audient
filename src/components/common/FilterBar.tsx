"use client";

import * as React from "react";

import { FilterBarGroup } from "@/components/common/FilterBarGroup";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FILTER_BAR_CLEAR_LABEL,
  FILTER_BAR_DEFAULT_FILTERS,
  FILTER_BAR_MOBILE_TRIGGER_LABEL,
  FILTER_BAR_PANELS,
  type FilterBarFilters,
  type FilterBarModule,
  type FilterBarPanel,
  type FilterBarState,
} from "@/config/filter-bar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { filterBarAnalytics } from "@/lib/analytics/filter-bar-events";
import {
  countActiveFilterGroups,
  isFilterBarActive,
} from "@/utils/filter-bar";
import { cn } from "@/utils/cn";

export type FilterBarProps = {
  filters: FilterBarFilters;
  onChange: (filters: FilterBarFilters) => void;
  onClear: () => void;
  state?: FilterBarState;
  module?: FilterBarModule;
  className?: string;
};

/**
 * COMPONENT-022 — Filter Bar.
 * Status · type · membership · date. Parent applies filters to the list.
 */
export function FilterBar({
  filters = FILTER_BAR_DEFAULT_FILTERS,
  onChange,
  onClear,
  state = "default",
  module = "history",
  className,
}: FilterBarProps) {
  const isMdUp = useMediaQuery("(min-width: 768px)");
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = React.useState<FilterBarPanel | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const disabled = state === "disabled" || state === "loading";
  const active = isFilterBarActive(filters);
  const activeCount = countActiveFilterGroups(filters);
  const showGroups = isMdUp || mobileOpen;

  React.useEffect(() => {
    if (!expanded) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && rootRef.current?.contains(target)) return;
      setExpanded(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded]);

  const handleChange = (next: FilterBarFilters) => {
    const changed =
      next.status !== filters.status
        ? "status"
        : next.type !== filters.type
          ? "type"
          : next.membership !== filters.membership
            ? "membership"
            : "date";
    const value =
      changed === "status"
        ? next.status.join(",")
        : changed === "type"
          ? next.type.join(",")
          : changed === "membership"
            ? next.membership.join(",")
            : next.datePreset;
    filterBarAnalytics.applied({ module, filter: changed, value });
    onChange(next);
  };

  const handleClear = () => {
    filterBarAnalytics.cleared({ module });
    setExpanded(null);
    onClear();
  };

  return (
    <div ref={rootRef} className={cn("flex w-full flex-col gap-sm", className)}>
      <div className="flex flex-wrap items-center gap-sm">
        {!isMdUp ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {FILTER_BAR_MOBILE_TRIGGER_LABEL}
            {activeCount > 0 ? (
              <Badge variant="secondary" size="sm" shape="rounded">
                {activeCount}
              </Badge>
            ) : null}
          </Button>
        ) : null}

        {active ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={handleClear}
          >
            {FILTER_BAR_CLEAR_LABEL}
          </Button>
        ) : null}
      </div>

      {showGroups ? (
        <div
          className={cn(
            "grid grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-4",
          )}
          aria-busy={state === "loading" || undefined}
        >
          {FILTER_BAR_PANELS.map((panel) => (
            <FilterBarGroup
              key={panel}
              panel={panel}
              filters={filters}
              expanded={expanded === panel}
              disabled={disabled}
              onToggle={(next) =>
                setExpanded((current) => (current === next ? null : next))
              }
              onChange={handleChange}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
