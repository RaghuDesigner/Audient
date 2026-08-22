"use client";

import * as React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  BILLING_PAYMENTS_COPY,
  type BillingPaymentsCycle,
  type BillingPaymentsPlan,
} from "@/config/billing-payments";
import {
  buildBillingPaymentsOrderSummary,
  formatBillingPaymentsCredits,
  formatBillingPaymentsMoney,
  type BillingPaymentsAppliedCoupon,
  type BillingPaymentsOrderSummary,
} from "@/utils/billing-payments";
import { cn } from "@/utils/cn";

const chrome =
  "w-full rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg";

export type OrderSummaryProps = {
  plan: BillingPaymentsPlan;
  cycle: BillingPaymentsCycle;
  coupon?: BillingPaymentsAppliedCoupon | null;
  /** Override computed summary (tests / QA). */
  summary?: BillingPaymentsOrderSummary | null;
  loading?: boolean;
  className?: string;
  id?: string;
};

function OrderSummaryLoading({ className }: { className?: string }) {
  return (
    <section
      className={cn(chrome, className)}
      aria-busy="true"
      aria-label="Loading order summary"
    >
      <Skeleton className="h-4 w-32" />
      <div className="mt-md space-y-sm">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-full" />
      </div>
    </section>
  );
}

function Line({
  label,
  value,
  emphasize,
  muted,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-md">
      <dt
        className={cn(
          "text-body-sm",
          muted ? "text-muted-foreground" : "text-foreground",
          emphasize && "font-semibold",
        )}
      >
        {label}
      </dt>
      <dd
        className={cn(
          "text-body-sm tabular-nums",
          muted ? "text-muted-foreground" : "text-foreground",
          emphasize && "font-bold",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

/**
 * SCREEN-012 — Order Summary.
 * Recalculates from plan / cycle / coupon — mock amounts only.
 */
export function OrderSummary({
  plan,
  cycle,
  coupon = null,
  summary: summaryProp = null,
  loading = false,
  className,
  id,
}: OrderSummaryProps) {
  const titleId = React.useId();

  if (loading) {
    return <OrderSummaryLoading className={className} />;
  }

  const summary =
    summaryProp ??
    buildBillingPaymentsOrderSummary({ plan, cycle, coupon });

  const couponLabel = summary.appliedCoupon
    ? `${BILLING_PAYMENTS_COPY.couponDiscount} (${summary.appliedCoupon.label})`
    : BILLING_PAYMENTS_COPY.couponDiscount;

  return (
    <section
      id={id}
      className={cn(chrome, className)}
      aria-labelledby={titleId}
    >
      <Caption id={titleId} className="text-muted-foreground">
        {BILLING_PAYMENTS_COPY.orderSummary}
      </Caption>

      <dl className="mt-md space-y-sm">
        <Line
          label={BILLING_PAYMENTS_COPY.planPrice}
          value={formatBillingPaymentsMoney(summary.listPriceCents)}
        />
        {summary.cycleDiscountCents > 0 ? (
          <Line
            label={BILLING_PAYMENTS_COPY.discount}
            value={`−${formatBillingPaymentsMoney(summary.cycleDiscountCents)}`}
            muted
          />
        ) : null}
        {summary.couponDiscountCents > 0 ? (
          <Line
            label={couponLabel}
            value={`−${formatBillingPaymentsMoney(summary.couponDiscountCents)}`}
            muted
          />
        ) : null}
        <Line
          label={BILLING_PAYMENTS_COPY.taxes}
          value={formatBillingPaymentsMoney(summary.taxCents)}
          muted
        />
        <Line
          label={BILLING_PAYMENTS_COPY.creditsIncluded}
          value={`${formatBillingPaymentsCredits(summary.creditsIncluded)} / month`}
        />
        <div className="border-t border-border pt-sm">
          <Line
            label={BILLING_PAYMENTS_COPY.total}
            value={formatBillingPaymentsMoney(summary.totalDueCents)}
            emphasize
          />
        </div>
        <Line
          label={BILLING_PAYMENTS_COPY.currency}
          value={summary.currency}
          muted
        />
      </dl>

      <BodySmall
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {`${BILLING_PAYMENTS_COPY.total}: ${formatBillingPaymentsMoney(summary.totalDueCents)} ${summary.currency}`}
      </BodySmall>
    </section>
  );
}
