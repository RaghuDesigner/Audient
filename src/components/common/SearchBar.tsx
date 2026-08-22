"use client";

import * as React from "react";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { inputShellVariants } from "@/components/ui/input-variants";
import {
  SEARCH_BAR_CLEAR_LABEL,
  SEARCH_BAR_DEFAULT_DEBOUNCE_MS,
  SEARCH_BAR_HELP_PLACEHOLDER,
  SEARCH_BAR_HISTORY_PLACEHOLDER,
  type SearchBarModule,
  type SearchBarState,
} from "@/config/search-bar";
import {
  normalizeSearchQuery,
  shouldEmitSearchQuery,
} from "@/utils/search-bar";
import { cn } from "@/utils/cn";

export type SearchBarProps = {
  value?: string;
  defaultValue?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  placeholder?: string;
  ariaLabel?: string;
  module?: SearchBarModule;
  state?: SearchBarState;
  debounceMs?: number;
  minLength?: number;
  className?: string;
  id?: string;
};

const MODULE_PLACEHOLDERS: Partial<Record<SearchBarModule, string>> = {
  history: SEARCH_BAR_HISTORY_PLACEHOLDER,
  help: SEARCH_BAR_HELP_PLACEHOLDER,
};

/**
 * COMPONENT-021 — Search Bar.
 * Debounced query emission with accessible clear control.
 */
export function SearchBar({
  value: valueProp,
  defaultValue = "",
  onSearch,
  onClear,
  placeholder: placeholderProp,
  ariaLabel,
  module = "history",
  state = "default",
  debounceMs = SEARCH_BAR_DEFAULT_DEBOUNCE_MS,
  minLength = 0,
  className,
  id: idProp,
}: SearchBarProps) {
  const inputId = React.useId();
  const id = idProp ?? inputId;
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const value = valueProp ?? uncontrolled;
  const disabled = state === "disabled" || state === "loading";
  const placeholder =
    placeholderProp ?? MODULE_PLACEHOLDERS[module] ?? SEARCH_BAR_HISTORY_PLACEHOLDER;

  const emit = React.useCallback(
    (next: string) => {
      const normalized = normalizeSearchQuery(next);
      if (!shouldEmitSearchQuery(normalized, minLength)) return;
      onSearch(normalized);
    },
    [minLength, onSearch],
  );

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      emit(value);
    }, debounceMs);
    return () => window.clearTimeout(timer);
  }, [debounceMs, emit, value]);

  const setValue = (next: string) => {
    if (valueProp == null) {
      setUncontrolled(next);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleClear = () => {
    setValue("");
    onClear?.();
    emit("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      emit(value);
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      <Search
        className="pointer-events-none absolute left-md top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        id={id}
        type="search"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        aria-busy={state === "loading" || undefined}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={cn(
          inputShellVariants({ variant: "default", size: "md" }),
          "w-full min-h-11 bg-background pl-10 pr-11",
          "[&::-webkit-search-cancel-button]:hidden",
        )}
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-sm top-1/2 min-h-9 min-w-9 -translate-y-1/2 px-sm"
          onClick={handleClear}
          aria-label={SEARCH_BAR_CLEAR_LABEL}
        >
          <X className="size-4" aria-hidden />
        </Button>
      ) : null}
    </div>
  );
}
