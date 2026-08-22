/**
 * COMPONENT — Billing Details Card helpers.
 * Client validation + field visibility — no React / no API / no PII logging.
 */

import {
  BILLING_DETAILS_CARD_COPY,
  BILLING_DETAILS_CARD_TAX_ID_MAX,
  BILLING_DETAILS_CARD_TAX_ID_MIN,
  type BillingDetailsCardErrors,
  type BillingDetailsCardField,
  type BillingDetailsCardMode,
} from "@/config/billing-details-card";

export type BillingDetailsValues = {
  fullName: string;
  email: string;
  companyName: string;
  billingAddress: string;
  country: string;
  stateRegion: string;
  postalCode: string;
  taxId: string;
};

export type BillingDetailsCountryOption = {
  value: string;
  label: string;
  /** Show + require state/province when true. */
  requiresState?: boolean;
  /** Show + require postal code when true. */
  requiresPostal?: boolean;
  states?: readonly { value: string; label: string }[];
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emptyBillingDetailsValues(): BillingDetailsValues {
  return {
    fullName: "",
    email: "",
    companyName: "",
    billingAddress: "",
    country: "",
    stateRegion: "",
    postalCode: "",
    taxId: "",
  };
}

export function findBillingDetailsCountry(
  options: readonly BillingDetailsCountryOption[],
  country: string | null | undefined,
): BillingDetailsCountryOption | null {
  if (!country) return null;
  return options.find((c) => c.value === country) ?? null;
}

export function billingDetailsShowsState(
  options: readonly BillingDetailsCountryOption[],
  country: string | null | undefined,
): boolean {
  return Boolean(findBillingDetailsCountry(options, country)?.requiresState);
}

export function billingDetailsShowsPostal(
  options: readonly BillingDetailsCountryOption[],
  country: string | null | undefined,
): boolean {
  const match = findBillingDetailsCountry(options, country);
  if (!match) return false;
  return match.requiresPostal !== false;
}

export function validateBillingDetailsField(
  field: BillingDetailsCardField,
  values: BillingDetailsValues,
  options: readonly BillingDetailsCountryOption[],
): string | null {
  const country = findBillingDetailsCountry(options, values.country);

  switch (field) {
    case "fullName": {
      if (!values.fullName.trim()) return BILLING_DETAILS_CARD_COPY.errorFullName;
      return null;
    }
    case "email": {
      const email = values.email.trim();
      if (!email) return BILLING_DETAILS_CARD_COPY.errorEmailRequired;
      if (!EMAIL_PATTERN.test(email)) {
        return BILLING_DETAILS_CARD_COPY.errorEmailInvalid;
      }
      return null;
    }
    case "billingAddress": {
      if (!values.billingAddress.trim()) {
        return BILLING_DETAILS_CARD_COPY.errorAddress;
      }
      return null;
    }
    case "country": {
      if (!values.country.trim()) return BILLING_DETAILS_CARD_COPY.errorCountry;
      return null;
    }
    case "stateRegion": {
      if (!country?.requiresState) return null;
      if (!values.stateRegion.trim()) return BILLING_DETAILS_CARD_COPY.errorState;
      return null;
    }
    case "postalCode": {
      if (!billingDetailsShowsPostal(options, values.country)) return null;
      if (country?.requiresPostal === false) return null;
      if (!values.postalCode.trim()) return BILLING_DETAILS_CARD_COPY.errorPostal;
      return null;
    }
    case "taxId": {
      const tax = values.taxId.trim();
      if (!tax) return null;
      if (
        tax.length < BILLING_DETAILS_CARD_TAX_ID_MIN ||
        tax.length > BILLING_DETAILS_CARD_TAX_ID_MAX
      ) {
        return BILLING_DETAILS_CARD_COPY.errorTaxId;
      }
      return null;
    }
    case "companyName":
      return null;
    default:
      return null;
  }
}

/** Validate all visible fields — for Proceed / submit gate. */
export function validateBillingDetailsForm(
  values: BillingDetailsValues,
  options: readonly BillingDetailsCountryOption[],
): BillingDetailsCardErrors {
  const fields: BillingDetailsCardField[] = [
    "fullName",
    "email",
    "billingAddress",
    "country",
    "stateRegion",
    "postalCode",
    "taxId",
  ];
  const errors: BillingDetailsCardErrors = {};
  for (const field of fields) {
    const message = validateBillingDetailsField(field, values, options);
    if (message) errors[field] = message;
  }
  return errors;
}

export function isBillingDetailsValid(
  values: BillingDetailsValues,
  options: readonly BillingDetailsCountryOption[],
): boolean {
  return Object.keys(validateBillingDetailsForm(values, options)).length === 0;
}

export function firstBillingDetailsErrorField(
  errors: BillingDetailsCardErrors,
): BillingDetailsCardField | null {
  const order: BillingDetailsCardField[] = [
    "fullName",
    "email",
    "companyName",
    "billingAddress",
    "country",
    "stateRegion",
    "postalCode",
    "taxId",
  ];
  return order.find((field) => Boolean(errors[field])) ?? null;
}

export function countryLabelForCode(
  options: readonly BillingDetailsCountryOption[],
  country: string | null | undefined,
): string {
  if (!country) return "—";
  return findBillingDetailsCountry(options, country)?.label ?? country;
}

export function stateLabelForCode(
  options: readonly BillingDetailsCountryOption[],
  country: string | null | undefined,
  stateRegion: string | null | undefined,
): string {
  if (!stateRegion) return "—";
  const match = findBillingDetailsCountry(options, country);
  const state = match?.states?.find((s) => s.value === stateRegion);
  return state?.label ?? stateRegion;
}

/** Analytics-safe payload — never include email, address, or tax ID. */
export function billingDetailsAnalyticsPayload(input: {
  mode: BillingDetailsCardMode;
  values: Pick<BillingDetailsValues, "companyName" | "taxId" | "country">;
}): {
  mode: BillingDetailsCardMode;
  hasCompany: boolean;
  hasTaxId: boolean;
  country?: string;
} {
  return {
    mode: input.mode,
    hasCompany: Boolean(input.values.companyName.trim()),
    hasTaxId: Boolean(input.values.taxId.trim()),
    country: input.values.country.trim() || undefined,
  };
}

export function mergeBillingDetailsValues(
  base: BillingDetailsValues,
  patch: Partial<BillingDetailsValues>,
): BillingDetailsValues {
  return { ...base, ...patch };
}

export function displayTaxId(taxId: string | null | undefined): string {
  const trimmed = taxId?.trim();
  return trimmed && trimmed.length > 0
    ? trimmed
    : BILLING_DETAILS_CARD_COPY.taxPlaceholder;
}
