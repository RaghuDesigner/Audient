"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { inputShellVariants } from "@/components/ui/input-variants";
import { Caption } from "@/components/ui/typography";
import {
  BILLING_DETAILS_CARD_COPY,
  type BillingDetailsCardErrors,
  type BillingDetailsCardField,
} from "@/config/billing-details-card";
import type {
  BillingDetailsCountryOption,
  BillingDetailsValues,
} from "@/utils/billing-details-card";
import {
  billingDetailsShowsPostal,
  billingDetailsShowsState,
  findBillingDetailsCountry,
} from "@/utils/billing-details-card";
import { cn } from "@/utils/cn";

export type BillingDetailsCardFormProps = {
  values: BillingDetailsValues;
  errors: BillingDetailsCardErrors;
  countryOptions: readonly BillingDetailsCountryOption[];
  emailReadOnly?: boolean;
  disabled?: boolean;
  onFieldChange: (field: BillingDetailsCardField, value: string) => void;
  onFieldBlur: (field: BillingDetailsCardField) => void;
  fieldRefs: React.MutableRefObject<
    Partial<Record<BillingDetailsCardField, HTMLElement | null>>
  >;
};

function SelectField({
  id,
  label,
  value,
  errorMessage,
  disabled,
  required,
  optionalHint,
  onChange,
  onBlur,
  children,
  selectRef,
}: {
  id: string;
  label: string;
  value: string;
  errorMessage?: string;
  disabled?: boolean;
  required?: boolean;
  optionalHint?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  children: React.ReactNode;
  selectRef?: (el: HTMLSelectElement | null) => void;
}) {
  const errorId = `${id}-error`;
  const hasError = Boolean(errorMessage);

  return (
    <div className="flex w-full flex-col gap-sm">
      <label
        htmlFor={id}
        className="text-info font-semibold text-foreground sm:text-body-sm"
      >
        {label}
        {optionalHint ? (
          <span className="ml-sm font-normal text-muted-foreground">
            ({optionalHint})
          </span>
        ) : null}
        {required ? (
          <span className="text-error" aria-hidden>
            {" "}*
          </span>
        ) : null}
      </label>
      <div
        className={cn(
          inputShellVariants({
            variant: hasError ? "error" : disabled ? "disabled" : "default",
            size: "md",
          }),
        )}
      >
        <select
          ref={selectRef}
          id={id}
          value={value}
          disabled={disabled}
          required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={cn(
            "min-w-0 flex-1 bg-transparent text-foreground outline-none",
            "disabled:cursor-not-allowed",
          )}
        >
          {children}
        </select>
      </div>
      {hasError ? (
        <Caption id={errorId} className="text-error" role="alert">
          {errorMessage}
        </Caption>
      ) : null}
    </div>
  );
}

/** Editable fields for Billing Details Card. */
export function BillingDetailsCardForm({
  values,
  errors,
  countryOptions,
  emailReadOnly = false,
  disabled = false,
  onFieldChange,
  onFieldBlur,
  fieldRefs,
}: BillingDetailsCardFormProps) {
  const showState = billingDetailsShowsState(countryOptions, values.country);
  const showPostal = billingDetailsShowsPostal(countryOptions, values.country);
  const country = findBillingDetailsCountry(countryOptions, values.country);
  const setRef = (field: BillingDetailsCardField) => (el: HTMLElement | null) => {
    fieldRefs.current[field] = el;
  };

  return (
    <div className="mt-md grid gap-md sm:grid-cols-2">
      <Input
        ref={(el) => setRef("fullName")(el)}
        label={BILLING_DETAILS_CARD_COPY.fullName}
        required
        value={values.fullName}
        disabled={disabled}
        errorMessage={errors.fullName}
        autoComplete="name"
        onChange={(e) => onFieldChange("fullName", e.target.value)}
        onBlur={() => onFieldBlur("fullName")}
      />
      <Input
        ref={(el) => setRef("email")(el)}
        label={BILLING_DETAILS_CARD_COPY.email}
        type="email"
        required
        value={values.email}
        disabled={disabled || emailReadOnly}
        readOnly={emailReadOnly}
        errorMessage={errors.email}
        autoComplete="email"
        onChange={(e) => onFieldChange("email", e.target.value)}
        onBlur={() => onFieldBlur("email")}
      />
      <Input
        ref={(el) => setRef("companyName")(el)}
        label={`${BILLING_DETAILS_CARD_COPY.companyName} (${BILLING_DETAILS_CARD_COPY.companyOptional})`}
        value={values.companyName}
        disabled={disabled}
        errorMessage={errors.companyName}
        autoComplete="organization"
        containerClassName="sm:col-span-2"
        onChange={(e) => onFieldChange("companyName", e.target.value)}
        onBlur={() => onFieldBlur("companyName")}
      />
      <Input
        ref={(el) => setRef("billingAddress")(el)}
        label={BILLING_DETAILS_CARD_COPY.billingAddress}
        required
        value={values.billingAddress}
        disabled={disabled}
        errorMessage={errors.billingAddress}
        autoComplete="street-address"
        containerClassName="sm:col-span-2"
        onChange={(e) => onFieldChange("billingAddress", e.target.value)}
        onBlur={() => onFieldBlur("billingAddress")}
      />
      <SelectField
        id="billing-details-country"
        label={BILLING_DETAILS_CARD_COPY.country}
        value={values.country}
        required
        disabled={disabled}
        errorMessage={errors.country}
        selectRef={(el) => setRef("country")(el)}
        onChange={(v) => onFieldChange("country", v)}
        onBlur={() => onFieldBlur("country")}
      >
        <option value="">{BILLING_DETAILS_CARD_COPY.selectCountry}</option>
        {countryOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </SelectField>
      {showState ? (
        <SelectField
          id="billing-details-state"
          label={BILLING_DETAILS_CARD_COPY.stateRegion}
          value={values.stateRegion}
          required
          disabled={disabled}
          errorMessage={errors.stateRegion}
          selectRef={(el) => setRef("stateRegion")(el)}
          onChange={(v) => onFieldChange("stateRegion", v)}
          onBlur={() => onFieldBlur("stateRegion")}
        >
          <option value="">{BILLING_DETAILS_CARD_COPY.selectState}</option>
          {(country?.states ?? []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </SelectField>
      ) : null}
      {showPostal ? (
        <Input
          ref={(el) => setRef("postalCode")(el)}
          label={BILLING_DETAILS_CARD_COPY.postalCode}
          required
          value={values.postalCode}
          disabled={disabled}
          errorMessage={errors.postalCode}
          autoComplete="postal-code"
          onChange={(e) => onFieldChange("postalCode", e.target.value)}
          onBlur={() => onFieldBlur("postalCode")}
        />
      ) : null}
      <Input
        ref={(el) => setRef("taxId")(el)}
        label={`${BILLING_DETAILS_CARD_COPY.taxId} (${BILLING_DETAILS_CARD_COPY.taxOptional})`}
        value={values.taxId}
        disabled={disabled}
        errorMessage={errors.taxId}
        placeholder={BILLING_DETAILS_CARD_COPY.taxPlaceholder}
        autoComplete="off"
        onChange={(e) => onFieldChange("taxId", e.target.value)}
        onBlur={() => onFieldBlur("taxId")}
      />
    </div>
  );
}
