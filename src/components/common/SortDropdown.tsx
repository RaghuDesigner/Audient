"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  SORT_DROPDOWN_DEFAULT_VALUE,
  SORT_DROPDOWN_HISTORY_OPTIONS,
  SORT_DROPDOWN_LABELS,
  sortDropdownTriggerLabel,
  type SortDropdownModule,
  type SortDropdownState,
  type SortDropdownValue,
} from "@/config/sort-dropdown";
import { sortDropdownAnalytics } from "@/lib/analytics/sort-dropdown-events";
import { cn } from "@/utils/cn";

export type SortDropdownProps = {
  value: SortDropdownValue;
  onChange: (value: SortDropdownValue) => void;
  options?: readonly SortDropdownValue[];
  state?: SortDropdownState;
  module?: SortDropdownModule;
  ariaLabel?: string;
  className?: string;
};

/**
 * COMPONENT-023 — Sort Dropdown.
 * Single-select ordering control. Parent applies sort to the list.
 */
export function SortDropdown({
  value = SORT_DROPDOWN_DEFAULT_VALUE,
  onChange,
  options = SORT_DROPDOWN_HISTORY_OPTIONS,
  state = "closed",
  module = "history",
  ariaLabel,
  className,
}: SortDropdownProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const menuId = React.useId();
  const [open, setOpen] = React.useState(false);
  const disabled = state === "disabled" || state === "loading";

  const close = React.useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) {
      queueMicrotask(() => triggerRef.current?.focus());
    }
  }, []);

  React.useEffect(() => {
    if (!open) return;
    itemRefs.current[options.findIndex((option) => option === value)]?.focus();

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && rootRef.current?.contains(target)) return;
      close(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [close, open, options, value]);

  const select = (next: SortDropdownValue) => {
    close();
    if (next === value) return;
    sortDropdownAnalytics.changed({
      module,
      sort: next,
      previousSort: value,
    });
    onChange(next);
  };

  const handleListKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const last = options.length - 1;
    let nextIndex: number | null = null;
    if (event.key === "ArrowDown") nextIndex = index === last ? 0 : index + 1;
    if (event.key === "ArrowUp") nextIndex = index === 0 ? last : index - 1;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = last;
    if (nextIndex == null) return;
    event.preventDefault();
    itemRefs.current[nextIndex]?.focus();
  };

  return (
    <div ref={rootRef} className={cn("relative w-full sm:w-auto", className)}>
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={ariaLabel ?? sortDropdownTriggerLabel(value)}
        aria-busy={state === "loading" || undefined}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        iconRight={<ChevronDown className="size-4" aria-hidden />}
        className="w-full justify-between sm:min-w-48"
      >
        {SORT_DROPDOWN_LABELS[value]}
      </Button>

      {open ? (
        <ul
          id={menuId}
          role="listbox"
          aria-label={ariaLabel ?? sortDropdownTriggerLabel(value)}
          className={cn(
            "absolute right-0 z-dropdown mt-sm min-w-full",
            "rounded-md border border-border bg-popover py-sm shadow-md",
          )}
        >
          {options.map((option, index) => {
            const selected = option === value;
            return (
              <li key={option} role="none">
                <button
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={cn(
                    "flex min-h-11 w-full items-center justify-between gap-sm px-md",
                    "text-left text-body-sm text-popover-foreground",
                    "hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                  )}
                  onClick={() => select(option)}
                  onKeyDown={(event) => handleListKeyDown(event, index)}
                >
                  {SORT_DROPDOWN_LABELS[option]}
                  {selected ? (
                    <Check className="size-4 shrink-0" aria-hidden />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
