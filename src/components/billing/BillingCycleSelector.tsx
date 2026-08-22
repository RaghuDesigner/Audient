"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Caption } from "@/components/ui/typography";
import {
  BILLING_PAYMENTS_COPY,
  BILLING_PAYMENTS_CYCLE_LABELS,
  BILLING_PAYMENTS_CYCLES,
  type BillingPaymentsCycle,
  type BillingPaymentsPlan,
} from "@/config/billing-payments";
import { billingPaymentsAnalytics } from "@/lib/analytics/billing-payments-events";
import { billingPaymentsSaveBadgeLabel } from "@/utils/billing-payments";
import { cn } from "@/utils/cn";

const chrome =
  "w-full rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg";

export type BillingCycleSelectorProps = {
  value: BillingPaymentsCycle;
  onChange: (cycle: BillingPaymentsCycle) => void;
  plan?: BillingPaymentsPlan;
  disabled?: boolean;
  className?: string;
  id?: string;
};

/**
 * SCREEN-012 — Billing Cycle Selector.
 * Monthly / Yearly radiogroup; yearly shows illustrative Save badge.
 */
export function BillingCycleSelector({
  value,
  onChange,
  plan = "pro",
  disabled = false,
  className,
  id,
}: BillingCycleSelectorProps) {
  const labelId = React.useId();
  const saveLabel = billingPaymentsSaveBadgeLabel();

  const select = (cycle: BillingPaymentsCycle) => {
    if (disabled || cycle === value) return;
    billingPaymentsAnalytics.billingCycleChanged({
      plan,
      fromCycle: value,
      toCycle: cycle,
    });
    onChange(cycle);
  };

  return (
    <section
      id={id}
      className={cn(chrome, className)}
      aria-labelledby={labelId}
    >
      <Caption id={labelId} className="text-muted-foreground">
        {BILLING_PAYMENTS_COPY.billingCycle}
      </Caption>

      <div
        role="radiogroup"
        aria-labelledby={labelId}
        aria-disabled={disabled || undefined}
        className="mt-md grid grid-cols-2 gap-sm"
      >
        {BILLING_PAYMENTS_CYCLES.map((cycle) => {
          const selected = cycle === value;
          const showSave = cycle === "yearly";

          return (
            <button
              key={cycle}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => select(cycle)}
              className={cn(
                "flex min-h-11 flex-col items-start justify-center gap-sm rounded-md border px-md py-sm text-left",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "disabled:cursor-not-allowed disabled:opacity-60",
                selected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background",
              )}
            >
              <span className="flex w-full flex-wrap items-center gap-sm">
                <span className="text-body-sm font-semibold text-foreground">
                  {BILLING_PAYMENTS_CYCLE_LABELS[cycle]}
                </span>
                {showSave ? (
                  <Badge variant="secondary" size="sm" shape="rounded">
                    {saveLabel}
                  </Badge>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
