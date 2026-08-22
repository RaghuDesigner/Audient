"use client";

import * as React from "react";

import { BillingDetailsCardForm } from "@/components/billing/BillingDetailsCardForm";
import {
  BillingDetailsCardLoading,
  billingDetailsCardChrome,
} from "@/components/billing/BillingDetailsCardStates";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  BILLING_DETAILS_CARD_COPY,
  type BillingDetailsCardErrors,
  type BillingDetailsCardField,
  type BillingDetailsCardMode,
  type BillingDetailsCardState,
} from "@/config/billing-details-card";
import { MOCK_BILLING_DETAILS_COUNTRIES } from "@/data/mock-billing-details-card";
import { billingDetailsCardAnalytics } from "@/lib/analytics/billing-details-card-events";
import type {
  BillingDetailsCountryOption,
  BillingDetailsValues,
} from "@/utils/billing-details-card";
import {
  billingDetailsAnalyticsPayload,
  billingDetailsShowsPostal,
  billingDetailsShowsState,
  countryLabelForCode,
  displayTaxId,
  emptyBillingDetailsValues,
  firstBillingDetailsErrorField,
  stateLabelForCode,
  validateBillingDetailsField,
  validateBillingDetailsForm,
} from "@/utils/billing-details-card";
import { cn } from "@/utils/cn";

export type BillingDetailsCardProps = {
  state?: BillingDetailsCardState;
  mode?: BillingDetailsCardMode;
  values?: BillingDetailsValues;
  errors?: BillingDetailsCardErrors;
  countryOptions?: readonly BillingDetailsCountryOption[];
  emailReadOnly?: boolean;
  /** Parent submit gate — validates all fields and focuses first error. */
  validateToken?: number;
  onChange?: (values: BillingDetailsValues) => void;
  onErrorsChange?: (errors: BillingDetailsCardErrors) => void;
  onBlurValidate?: (field: BillingDetailsCardField) => void;
  className?: string;
  id?: string;
};

function ReadOnlyField({
  label,
  value,
  fullWidth,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "sm:col-span-2" : undefined}>
      <Caption asChild>
        <dt className="text-muted-foreground">{label}</dt>
      </Caption>
      <dd className="mt-sm">
        <BodySmall className="font-semibold text-foreground">{value}</BodySmall>
      </dd>
    </div>
  );
}

/**
 * Billing Details Card — edit or read-only customer billing identity.
 * @see docs/components/COMPONENT_BILLING_DETAILS_CARD.md
 */
export function BillingDetailsCard({
  state = "default",
  mode = "edit",
  values: valuesProp,
  errors: errorsProp,
  countryOptions = MOCK_BILLING_DETAILS_COUNTRIES,
  emailReadOnly = false,
  validateToken,
  onChange,
  onErrorsChange,
  onBlurValidate,
  className,
  id,
}: BillingDetailsCardProps) {
  const titleId = React.useId();
  const viewed = React.useRef(false);
  const fieldRefs = React.useRef<
    Partial<Record<BillingDetailsCardField, HTMLElement | null>>
  >({});
  const [internalValues, setInternalValues] = React.useState(
    valuesProp ?? emptyBillingDetailsValues(),
  );
  const [internalErrors, setInternalErrors] =
    React.useState<BillingDetailsCardErrors>({});

  const values = valuesProp ?? internalValues;
  const errors = errorsProp ?? internalErrors;
  const isReadOnly = mode === "read_only" || state === "read_only";
  const loading = state === "loading";

  React.useEffect(() => {
    if (valuesProp) setInternalValues(valuesProp);
  }, [valuesProp]);

  React.useEffect(() => {
    if (loading || viewed.current) return;
    viewed.current = true;
    billingDetailsCardAnalytics.viewed(
      billingDetailsAnalyticsPayload({ mode, values }),
    );
  }, [loading, mode, values]);

  React.useEffect(() => {
    if (validateToken == null || isReadOnly) return;
    const next = validateBillingDetailsForm(values, countryOptions);
    if (!errorsProp) setInternalErrors(next);
    onErrorsChange?.(next);
    const first = firstBillingDetailsErrorField(next);
    if (first) fieldRefs.current[first]?.focus();
  }, [validateToken]); // eslint-disable-line react-hooks/exhaustive-deps -- submit gate only

  if (loading) {
    return <BillingDetailsCardLoading className={className} />;
  }

  const setErrors = (next: BillingDetailsCardErrors) => {
    if (!errorsProp) setInternalErrors(next);
    onErrorsChange?.(next);
  };

  const handleChange = (field: BillingDetailsCardField, value: string) => {
    const next = { ...values, [field]: value };
    if (field === "country") {
      next.stateRegion = "";
      next.postalCode = "";
    }
    if (!valuesProp) setInternalValues(next);
    onChange?.(next);
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleBlur = (field: BillingDetailsCardField) => {
    onBlurValidate?.(field);
    const message = validateBillingDetailsField(field, values, countryOptions);
    const next = { ...errors, [field]: message ?? undefined };
    if (!message) delete next[field];
    else next[field] = message;
    setErrors(next);
    if (!message && mode === "edit") {
      billingDetailsCardAnalytics.updated(
        billingDetailsAnalyticsPayload({ mode, values }),
      );
    }
  };

  const showState = billingDetailsShowsState(countryOptions, values.country);
  const showPostal = billingDetailsShowsPostal(countryOptions, values.country);

  return (
    <section
      id={id}
      className={cn(billingDetailsCardChrome, className)}
      aria-labelledby={titleId}
    >
      <Caption id={titleId} className="text-muted-foreground">
        {BILLING_DETAILS_CARD_COPY.title}
      </Caption>

      {isReadOnly ? (
        <dl className="mt-md grid gap-md sm:grid-cols-2">
          <ReadOnlyField
            label={BILLING_DETAILS_CARD_COPY.fullName}
            value={values.fullName || "—"}
          />
          <ReadOnlyField
            label={BILLING_DETAILS_CARD_COPY.email}
            value={values.email || "—"}
          />
          {values.companyName.trim() ? (
            <ReadOnlyField
              label={BILLING_DETAILS_CARD_COPY.companyName}
              value={values.companyName}
              fullWidth
            />
          ) : null}
          <ReadOnlyField
            label={BILLING_DETAILS_CARD_COPY.billingAddress}
            value={values.billingAddress || "—"}
            fullWidth
          />
          <ReadOnlyField
            label={BILLING_DETAILS_CARD_COPY.country}
            value={countryLabelForCode(countryOptions, values.country)}
          />
          {showState ? (
            <ReadOnlyField
              label={BILLING_DETAILS_CARD_COPY.stateRegion}
              value={stateLabelForCode(
                countryOptions,
                values.country,
                values.stateRegion,
              )}
            />
          ) : null}
          {showPostal ? (
            <ReadOnlyField
              label={BILLING_DETAILS_CARD_COPY.postalCode}
              value={values.postalCode || "—"}
            />
          ) : null}
          <ReadOnlyField
            label={BILLING_DETAILS_CARD_COPY.taxId}
            value={displayTaxId(values.taxId)}
          />
        </dl>
      ) : (
        <BillingDetailsCardForm
          values={values}
          errors={errors}
          countryOptions={countryOptions}
          emailReadOnly={emailReadOnly}
          onFieldChange={handleChange}
          onFieldBlur={handleBlur}
          fieldRefs={fieldRefs}
        />
      )}
    </section>
  );
}

/** Imperative helper for parents — validate without mounting token. */
export function getBillingDetailsValidationErrors(
  values: BillingDetailsValues,
  countryOptions: readonly BillingDetailsCountryOption[] = MOCK_BILLING_DETAILS_COUNTRIES,
): BillingDetailsCardErrors {
  return validateBillingDetailsForm(values, countryOptions);
}
