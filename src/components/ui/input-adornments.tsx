"use client";

import * as React from "react";
import { Eye, EyeOff, X } from "lucide-react";

import { cn } from "@/utils/cn";

const adornmentButtonClassName = cn(
  "inline-flex size-11 shrink-0 items-center justify-center rounded-md",
  "text-muted-foreground transition-colors hover:text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
);

type InputPrefixProps = {
  icon?: React.ReactNode;
};

export function InputPrefix({ icon }: InputPrefixProps) {
  if (!icon) return null;
  return (
    <span
      className="inline-flex shrink-0 text-muted-foreground"
      aria-hidden="true"
    >
      {icon}
    </span>
  );
}

type InputTrailingProps = {
  suffixIcon?: React.ReactNode;
  showClear?: boolean;
  showToggle?: boolean;
  passwordRevealed?: boolean;
  onClear?: () => void;
  onTogglePassword?: () => void;
};

/** Clear, password toggle, and optional suffix icon (after the field). */
export function InputTrailing({
  suffixIcon,
  showClear = false,
  showToggle = false,
  passwordRevealed = false,
  onClear,
  onTogglePassword,
}: InputTrailingProps) {
  return (
    <>
      {showClear ? (
        <button
          type="button"
          onClick={onClear}
          className={adornmentButtonClassName}
          aria-label="Clear"
        >
          <X aria-hidden="true" />
        </button>
      ) : null}

      {showToggle ? (
        <button
          type="button"
          onClick={onTogglePassword}
          className={adornmentButtonClassName}
          aria-label={passwordRevealed ? "Hide password" : "Show password"}
          aria-pressed={passwordRevealed}
        >
          {passwordRevealed ? (
            <EyeOff aria-hidden="true" />
          ) : (
            <Eye aria-hidden="true" />
          )}
        </button>
      ) : null}

      {!showClear && !showToggle && suffixIcon ? (
        <span
          className="inline-flex shrink-0 text-muted-foreground"
          aria-hidden="true"
        >
          {suffixIcon}
        </span>
      ) : null}
    </>
  );
}

type InputMessagesProps = {
  errorId: string;
  successId: string;
  helperId: string;
  counterId: string;
  errorMessage?: string;
  successMessage?: string;
  helperText?: string;
  showCharacterCount?: boolean;
  maxLength?: number;
  characterCount: number;
};

/** Helper / error / success / character counter region. */
export function InputMessages({
  errorId,
  successId,
  helperId,
  counterId,
  errorMessage,
  successMessage,
  helperText,
  showCharacterCount = false,
  maxLength,
  characterCount,
}: InputMessagesProps) {
  const hasError = Boolean(errorMessage);
  const hasSuccess = Boolean(successMessage) && !hasError;

  return (
    <div className="flex items-start justify-between gap-sm">
      <div className="min-w-0 flex-1">
        {hasError ? (
          <p id={errorId} role="alert" className="text-info text-error">
            {errorMessage}
          </p>
        ) : null}
        {hasSuccess ? (
          <p id={successId} role="status" className="text-info text-success">
            {successMessage}
          </p>
        ) : null}
        {!hasError && !hasSuccess && helperText ? (
          <p id={helperId} className="text-info text-muted-foreground">
            {helperText}
          </p>
        ) : null}
      </div>

      {showCharacterCount && maxLength != null ? (
        <p
          id={counterId}
          className="text-info shrink-0 text-muted-foreground tabular-nums"
          aria-live="polite"
        >
          {characterCount}/{maxLength}
        </p>
      ) : null}
    </div>
  );
}
