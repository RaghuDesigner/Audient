/**
 * COMPONENT — Billing Details Card constants.
 * Customer billing identity & address — no UI / no Stripe / no persist.
 * @see docs/components/COMPONENT_BILLING_DETAILS_CARD.md
 */

export const BILLING_DETAILS_CARD_STATES = [
  "default",
  "loading",
  "validation_error",
  "read_only",
] as const;

export type BillingDetailsCardState =
  (typeof BILLING_DETAILS_CARD_STATES)[number];

export const BILLING_DETAILS_CARD_MODES = ["edit", "read_only"] as const;

export type BillingDetailsCardMode =
  (typeof BILLING_DETAILS_CARD_MODES)[number];

export const BILLING_DETAILS_CARD_FIELDS = [
  "fullName",
  "email",
  "companyName",
  "billingAddress",
  "country",
  "stateRegion",
  "postalCode",
  "taxId",
] as const;

export type BillingDetailsCardField =
  (typeof BILLING_DETAILS_CARD_FIELDS)[number];

export type BillingDetailsCardErrors = Partial<
  Record<BillingDetailsCardField, string>
>;

export const BILLING_DETAILS_CARD_COPY = {
  title: "Billing details",
  fullName: "Full name",
  email: "Email address",
  companyName: "Company name",
  companyOptional: "optional",
  billingAddress: "Billing address",
  country: "Country",
  stateRegion: "State / province",
  postalCode: "Postal code",
  taxId: "Tax ID",
  taxOptional: "optional",
  taxPlaceholder: "GST / VAT / tax identifier",
  selectCountry: "Select a country",
  selectState: "Select a state / province",
  loadingLabel: "Loading billing details",
  errorFullName: "Enter your full name",
  errorEmailRequired: "Enter your email address",
  errorEmailInvalid: "Enter a valid email address",
  errorAddress: "Enter your billing address",
  errorCountry: "Select a country",
  errorState: "Select a state / province",
  errorPostal: "Enter a postal code",
  errorTaxId: "Enter a valid tax ID (4–32 characters)",
} as const;

export const BILLING_DETAILS_CARD_ANALYTICS_SOURCES = {
  component: "billing_details_card",
  checkout: "billing_details_checkout",
  billingPayments: "billing_details_billing_payments",
} as const;

/** Mock tax ID length bounds (until tax provider). */
export const BILLING_DETAILS_CARD_TAX_ID_MIN = 4;
export const BILLING_DETAILS_CARD_TAX_ID_MAX = 32;
