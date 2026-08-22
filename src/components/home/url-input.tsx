"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export type UrlInputProps = {
  disabled?: boolean;
  /**
   * Guest / Free: field is not editable. Click / focus / GO open the
   * upgrade plans popup via `onProtectedAction`.
   */
  gated?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  /** Called when GO is pressed with the current value (ungated only). */
  onSubmit?: (value: string) => void;
  /** Guest / Free activation — open plan details popup. */
  onProtectedAction?: () => void;
  error?: string | null;
  autoFocus?: boolean;
  className?: string;
};

/**
 * Screen1 URL field + attached GO control.
 * Gated for Guest/Free (Pro / Business only for live URL audits).
 */
export function UrlInput({
  disabled = false,
  gated = false,
  value = "",
  onChange,
  onSubmit,
  onProtectedAction,
  error = null,
  autoFocus = false,
  className,
}: UrlInputProps) {
  const inputId = React.useId();
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (autoFocus && !gated) {
      inputRef.current?.focus();
    }
  }, [autoFocus, gated]);

  const openGate = () => {
    if (gated) {
      onProtectedAction?.();
    }
  };

  const handleGo = () => {
    if (gated) {
      openGate();
      return;
    }
    if (disabled) return;
    onSubmit?.(value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (gated) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openGate();
      }
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      handleGo();
    }
  };

  return (
    <div className={cn("flex w-full max-w-2xl flex-col gap-sm", className)}>
      <label
        htmlFor={inputId}
        className="text-center text-body-sm text-muted-foreground"
      >
        Paste your website link here
      </label>
      <div
        className={cn(
          "flex w-full overflow-hidden rounded-md border bg-background",
          error ? "border-error" : "border-border",
          !gated &&
            "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          gated &&
            "cursor-pointer focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        )}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="url"
          inputMode="url"
          autoComplete="url"
          readOnly={gated}
          disabled={disabled && !gated}
          value={gated ? "" : value}
          placeholder="https://"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hintId}
          aria-haspopup={gated ? "dialog" : undefined}
          onChange={(event) => {
            if (gated) return;
            onChange?.(event.target.value);
          }}
          onFocus={openGate}
          onClick={openGate}
          onKeyDown={handleKeyDown}
          className={cn(
            "min-h-12 flex-1 bg-transparent px-md text-body-sm text-foreground",
            "placeholder:text-muted-foreground",
            "focus:outline-none",
            gated && "cursor-pointer",
            disabled && !gated && "cursor-not-allowed opacity-50",
          )}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={disabled && !gated}
          onClick={handleGo}
          aria-label={
            gated
              ? "GO — unlock URL audits with Pro or Business"
              : "GO — validate website URL"
          }
          aria-haspopup={gated ? "dialog" : undefined}
          className={cn(
            "min-h-12 shrink-0 rounded-none rounded-r-md px-lg",
            "bg-muted-foreground text-primary-foreground",
            "hover:bg-muted-foreground/90 active:bg-muted-foreground/80",
            "font-bold uppercase tracking-wide",
          )}
        >
          GO
        </Button>
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-center text-info text-error">
          {error}
        </p>
      ) : (
        <p id={hintId} className="sr-only">
          {gated
            ? "Website URL audits require a Pro or Business plan. Activate this field or GO to view plan details."
            : "Enter a public https website URL, then press GO."}
        </p>
      )}
    </div>
  );
}
