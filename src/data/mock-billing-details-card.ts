/**
 * Phase-1 mock Billing Details Card.
 * Country catalog + value fixtures for QA; no API / no Stripe.
 */

import {
  BILLING_DETAILS_CARD_COPY,
  type BillingDetailsCardErrors,
} from "@/config/billing-details-card";
import type {
  BillingDetailsCountryOption,
  BillingDetailsValues,
} from "@/utils/billing-details-card";
import { emptyBillingDetailsValues } from "@/utils/billing-details-card";
import { MOCK_USER_DISPLAY_NAME } from "@/lib/auth/mock-session";

export const MOCK_BILLING_DETAILS_COUNTRIES: readonly BillingDetailsCountryOption[] =
  [
    {
      value: "US",
      label: "United States",
      requiresState: true,
      requiresPostal: true,
      states: [
        { value: "CA", label: "California" },
        { value: "NY", label: "New York" },
        { value: "TX", label: "Texas" },
        { value: "WA", label: "Washington" },
      ],
    },
    {
      value: "IN",
      label: "India",
      requiresState: true,
      requiresPostal: true,
      states: [
        { value: "KA", label: "Karnataka" },
        { value: "MH", label: "Maharashtra" },
        { value: "DL", label: "Delhi" },
      ],
    },
    {
      value: "GB",
      label: "United Kingdom",
      requiresState: false,
      requiresPostal: true,
    },
    {
      value: "CA",
      label: "Canada",
      requiresState: true,
      requiresPostal: true,
      states: [
        { value: "ON", label: "Ontario" },
        { value: "BC", label: "British Columbia" },
        { value: "QC", label: "Quebec" },
      ],
    },
    {
      value: "AU",
      label: "Australia",
      requiresState: true,
      requiresPostal: true,
      states: [
        { value: "NSW", label: "New South Wales" },
        { value: "VIC", label: "Victoria" },
      ],
    },
    {
      value: "DE",
      label: "Germany",
      requiresState: false,
      requiresPostal: true,
    },
    {
      value: "SG",
      label: "Singapore",
      requiresState: false,
      requiresPostal: true,
    },
  ] as const;

export const MOCK_BILLING_DETAILS_EMPTY: BillingDetailsValues =
  emptyBillingDetailsValues();

export const MOCK_BILLING_DETAILS_FILLED: BillingDetailsValues = {
  fullName: MOCK_USER_DISPLAY_NAME,
  email: "alex@acme.example",
  companyName: "Acme Design Co.",
  billingAddress: "123 Market Street, Suite 400",
  country: "US",
  stateRegion: "CA",
  postalCode: "94105",
  taxId: "",
};

export const MOCK_BILLING_DETAILS_WITH_TAX: BillingDetailsValues = {
  ...MOCK_BILLING_DETAILS_FILLED,
  taxId: "US-TAX-12345",
};

export const MOCK_BILLING_DETAILS_VALIDATION_ERRORS: BillingDetailsCardErrors = {
  fullName: BILLING_DETAILS_CARD_COPY.errorFullName,
  email: BILLING_DETAILS_CARD_COPY.errorEmailInvalid,
  billingAddress: BILLING_DETAILS_CARD_COPY.errorAddress,
  country: BILLING_DETAILS_CARD_COPY.errorCountry,
};

export function getMockBillingDetailsValues(
  overrides?: Partial<BillingDetailsValues>,
): BillingDetailsValues {
  return {
    ...MOCK_BILLING_DETAILS_FILLED,
    ...overrides,
  };
}
