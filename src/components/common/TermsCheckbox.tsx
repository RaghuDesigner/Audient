"use client";

import * as React from "react";
import Link from "next/link";

import { BodySmall, TextLink } from "@/components/ui/typography";
import {
  TERMS_CHECKBOX_COPY,
  TERMS_CHECKBOX_LEGAL,
  type TermsCheckboxContext,
} from "@/config/terms-checkbox";
import { termsCheckboxAnalytics } from "@/lib/analytics/terms-checkbox-events";
import {
  resolveTermsCheckboxState,
  shouldClearTermsError,
  termsCheckboxErrorMessage,
} from "@/utils/terms-checkbox";
import { cn } from "@/utils/cn";

export type TermsCheckboxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Inline validation when Pay attempted without accept. */
  errorMessage?: string | null;
  /** Force validation error UI even without custom message. */
  showError?: boolean;
  termsHref?: string;
  privacyHref?: string;
  termsVersion?: string;
  privacyVersion?: string;
  context?: TermsCheckboxContext | string;
  className?: string;
  id?: string;
};

/**
 * COMPONENT-037 — Terms Checkbox.
 * Explicit legal gate; parent binds to Pay Now `disabled={!checked || …}`.
 * Links open legal pages and do not toggle the checkbox.
 */
export function TermsCheckbox({
  checked,
  onCheckedChange,
  disabled = false,
  errorMessage = null,
  showError = false,
  termsHref = TERMS_CHECKBOX_LEGAL.termsHref,
  privacyHref = TERMS_CHECKBOX_LEGAL.privacyHref,
  termsVersion = TERMS_CHECKBOX_LEGAL.termsVersion,
  privacyVersion = TERMS_CHECKBOX_LEGAL.privacyVersion,
  context = "checkout",
  className,
  id,
}: TermsCheckboxProps) {
  const generatedId = React.useId();
  const checkboxId = id ?? generatedId;
  const errorId = `${checkboxId}-error`;

  const hasError =
    (showError || Boolean(errorMessage)) && !checked && !disabled;
  const displayError = hasError
    ? termsCheckboxErrorMessage(errorMessage)
    : null;
  const visualState = resolveTermsCheckboxState({
    checked,
    disabled,
    hasError,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const next = event.target.checked;
    const analyticsProps = { context, termsVersion, privacyVersion };
    if (next) {
      termsCheckboxAnalytics.termsAccepted(analyticsProps);
    } else if (checked) {
      termsCheckboxAnalytics.termsRejected(analyticsProps);
    }
    onCheckedChange(next);
  };

  /** Link activation must not flip the checkbox (stop label association). */
  const stopLabelToggle = (event: React.MouseEvent | React.KeyboardEvent) => {
    event.stopPropagation();
  };

  return (
    <div
      className={cn("w-full", className)}
      data-state={visualState}
    >
      <div className="flex gap-md">
        <span className="flex min-h-11 min-w-11 shrink-0 items-start justify-center pt-sm">
          <input
            id={checkboxId}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={displayError ? errorId : undefined}
            className={cn(
              "size-5 rounded-sm border border-border accent-primary",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-ring focus-visible:ring-offset-2",
              "focus-visible:ring-offset-background",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          />
        </span>

        <div className="min-w-0 flex-1">
          <label
            htmlFor={checkboxId}
            className={cn(
              "text-body-sm text-foreground",
              disabled && "cursor-not-allowed opacity-60",
            )}
          >
            {TERMS_CHECKBOX_COPY.labelPrefix}{" "}
            <TextLink asChild external>
              <Link
                href={termsHref}
                onClick={stopLabelToggle}
                onKeyDown={stopLabelToggle}
              >
                {TERMS_CHECKBOX_LEGAL.termsLabel}
              </Link>
            </TextLink>{" "}
            {TERMS_CHECKBOX_COPY.labelAnd}{" "}
            <TextLink asChild external>
              <Link
                href={privacyHref}
                onClick={stopLabelToggle}
                onKeyDown={stopLabelToggle}
              >
                {TERMS_CHECKBOX_LEGAL.privacyLabel}
              </Link>
            </TextLink>
            {TERMS_CHECKBOX_COPY.labelSuffix}
          </label>

          {displayError ? (
            <BodySmall
              id={errorId}
              className="mt-sm text-error"
              role="alert"
              aria-live="assertive"
            >
              {displayError}
            </BodySmall>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export { shouldClearTermsError };
