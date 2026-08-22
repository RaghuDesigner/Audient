"use client";

import * as React from "react";
import { CreditCard, Landmark } from "lucide-react";

import { BodySmall, Caption } from "@/components/ui/typography";
import {
  BILLING_PAYMENTS_COPY,
  BILLING_PAYMENTS_FUTURE_METHODS,
  type BillingPaymentsCycle,
  type BillingPaymentsPlan,
} from "@/config/billing-payments";
import { billingPaymentsAnalytics } from "@/lib/analytics/billing-payments-events";
import { cn } from "@/utils/cn";

const chrome =
  "w-full rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg";

export type PaymentMethodCardProps = {
  plan: BillingPaymentsPlan;
  cycle?: BillingPaymentsCycle;
  className?: string;
  id?: string;
};

/**
 * SCREEN-012 — Payment Method Card.
 * Placeholder only — no card fields, no Stripe / Apple / Google / PayPal.
 */
export function PaymentMethodCard({
  plan,
  cycle = "monthly",
  className,
  id,
}: PaymentMethodCardProps) {
  const titleId = React.useId();
  const viewed = React.useRef(false);

  const trackViewed = React.useCallback(() => {
    if (viewed.current) return;
    viewed.current = true;
    billingPaymentsAnalytics.paymentMethodViewed({ plan, cycle });
  }, [cycle, plan]);

  React.useEffect(() => {
    trackViewed();
  }, [trackViewed]);

  return (
    <section
      id={id}
      tabIndex={id ? -1 : undefined}
      className={cn(chrome, className)}
      aria-labelledby={titleId}
      onFocusCapture={trackViewed}
    >
      <div className="flex flex-wrap items-center gap-sm">
        <CreditCard
          className="size-5 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <Caption id={titleId} className="text-muted-foreground">
          {BILLING_PAYMENTS_COPY.paymentMethod}
        </Caption>
      </div>

      <BodySmall className="mt-md text-foreground">
        {BILLING_PAYMENTS_COPY.paymentPlaceholder}
      </BodySmall>

      <ul
        className="mt-md flex flex-wrap gap-sm"
        aria-label={BILLING_PAYMENTS_COPY.paymentMethodsAria}
      >
        {BILLING_PAYMENTS_FUTURE_METHODS.map((method) => (
          <li key={method}>
            <span
              className={cn(
                "inline-flex min-h-9 items-center gap-sm rounded-md border border-border",
                "bg-muted px-md text-body-sm text-muted-foreground",
              )}
            >
              {method === "PayPal" ? (
                <Landmark className="size-4 shrink-0" aria-hidden />
              ) : (
                <CreditCard className="size-4 shrink-0" aria-hidden />
              )}
              {method}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
