/**
 * COMPONENT-037 — Terms Checkbox helpers.
 * Consent gate for Pay / continue — no React / no payment gateway.
 */

import {
  TERMS_CHECKBOX_COPY,
  type TermsCheckboxState,
} from "@/config/terms-checkbox";

/**
 * Derive display state from controlled props.
 * Prefer explicit `state` when parent passes validation_error or disabled.
 */
export function resolveTermsCheckboxState(input: {
  checked: boolean;
  disabled?: boolean;
  hasError?: boolean;
  state?: TermsCheckboxState | null;
}): TermsCheckboxState {
  if (input.state) return input.state;
  if (input.disabled) return "disabled";
  if (input.hasError && !input.checked) return "validation_error";
  return input.checked ? "checked" : "unchecked";
}

/** Parent Pay Now / continue — terms required; other validity still applies. */
export function canEnablePayWithTerms(input: {
  termsAccepted: boolean;
  processing?: boolean;
  formValid?: boolean;
  disabled?: boolean;
}): boolean {
  if (input.disabled) return false;
  if (input.processing) return false;
  if (input.formValid === false) return false;
  return input.termsAccepted;
}

/** Checking the box clears Validation Error. */
export function shouldClearTermsError(
  nextChecked: boolean,
  hasError: boolean,
): boolean {
  return nextChecked && hasError;
}

export function termsCheckboxErrorMessage(
  custom?: string | null,
): string {
  if (custom != null && custom.trim().length > 0) return custom;
  return TERMS_CHECKBOX_COPY.errorRequired;
}

/** Never pre-check — default for new checkout sessions. */
export function defaultTermsCheckboxChecked(): boolean {
  return false;
}
