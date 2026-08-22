"use client";

import * as React from "react";

import { TermsCheckbox } from "@/components/common/TermsCheckbox";
import { BodySmall, Caption } from "@/components/ui/typography";
import { CHECKOUT_COPY } from "@/config/checkout";
import { TERMS_CHECKBOX_COPY } from "@/config/terms-checkbox";
import { cn } from "@/utils/cn";

const chrome =
  "w-full rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg";

export type TermsAcceptanceProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Validation error when Pay attempted without accept. */
  showRequiredError?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
};

/**
 * SCREEN-013 — Terms Checkbox + Privacy Notice (adjacent copy).
 * Pay Now enablement is parent-owned via `checked`.
 */
export function TermsAcceptance({
  checked,
  onCheckedChange,
  showRequiredError = false,
  disabled = false,
  className,
  id,
}: TermsAcceptanceProps) {
  const titleId = React.useId();

  return (
    <section
      id={id}
      className={cn(chrome, className)}
      aria-labelledby={titleId}
    >
      <Caption id={titleId} className="sr-only">
        {TERMS_CHECKBOX_COPY.sectionLabel}
      </Caption>

      <TermsCheckbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        showError={showRequiredError}
        context="checkout"
      />

      <BodySmall className="mt-md text-muted-foreground">
        {CHECKOUT_COPY.privacyNotice}
      </BodySmall>
    </section>
  );
}
