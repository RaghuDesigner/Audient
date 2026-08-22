/**
 * COMPONENT-037 — Terms Checkbox constants.
 * Explicit legal consent gate — no UI / no payment / no persist.
 * @see docs/components/COMPONENT_TERMS_CHECKBOX.md
 */

export const TERMS_CHECKBOX_STATES = [
  "unchecked",
  "checked",
  "validation_error",
  "disabled",
] as const;

export type TermsCheckboxState = (typeof TERMS_CHECKBOX_STATES)[number];

export const TERMS_CHECKBOX_CONTEXTS = [
  "checkout",
  "billing_payments",
  "sign_up",
  "credit_purchase",
] as const;

export type TermsCheckboxContext = (typeof TERMS_CHECKBOX_CONTEXTS)[number];

export const TERMS_CHECKBOX_LEGAL = {
  termsHref: "/terms",
  privacyHref: "/privacy",
  termsLabel: "Terms of Service",
  privacyLabel: "Privacy Policy",
  /** Mock version stamps for future acceptance audit log. */
  termsVersion: "2026-08-01",
  privacyVersion: "2026-08-01",
} as const;

export const TERMS_CHECKBOX_COPY = {
  /** Exact legal-approved default — do not invent marketing alternates. */
  label: "I agree to the Terms of Service and Privacy Policy.",
  labelPrefix: "I agree to the",
  labelAnd: "and",
  labelSuffix: ".",
  errorRequired:
    "Accept the Terms of Service and Privacy Policy to continue.",
  sectionLabel: "Terms acceptance",
} as const;

export const TERMS_CHECKBOX_ANALYTICS_SOURCES = {
  component: "terms_checkbox",
  checkout: "terms_checkbox_checkout",
} as const;
