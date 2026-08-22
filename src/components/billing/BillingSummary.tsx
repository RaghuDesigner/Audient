"use client";

import * as React from "react";

import {
  BillingSummaryError,
  BillingSummaryField,
  BillingSummaryLoading,
  billingSummaryChrome,
} from "@/components/billing/BillingSummaryStates";
import { Button } from "@/components/ui/button";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  BILLING_SUMMARY_COPY,
  type BillingSummaryBillingCycle,
  type BillingSummaryPlan,
  type BillingSummaryState,
  type BillingSummaryVariant,
} from "@/config/billing-summary";
import { billingSummaryAnalytics } from "@/lib/analytics/billing-summary-events";
import {
  billingSummaryCycleLabel,
  billingSummaryPaymentDisplay,
  billingSummaryPlanLabel,
  billingSummaryStatusDetail,
  formatBillingSummaryRenewal,
  resolveBillingSummaryPrice,
  shouldShowBillingSummaryManagePayment,
} from "@/utils/billing-summary";
import { cn } from "@/utils/cn";

export type BillingSummaryProps = {
  state: BillingSummaryState;
  plan: BillingSummaryPlan;
  renewalDate?: string | Date | null;
  currentPrice?: string | number | null;
  billingCycle?: BillingSummaryBillingCycle;
  paymentMethodLabel?: string | null;
  hasInvoices?: boolean;
  statusDetail?: string | null;
  variant?: BillingSummaryVariant;
  onInvoiceHistory?: () => void;
  onManagePayment?: () => void;
  onManageBilling?: () => void;
  onRetry?: () => void;
  className?: string;
  id?: string;
};

/**
 * COMPONENT-036 — Billing Summary.
 * Plan · price · cycle · renewal · payment placeholder · invoice history — mock only.
 */
export function BillingSummary({
  state,
  plan,
  renewalDate = null,
  currentPrice = null,
  billingCycle = "monthly",
  paymentMethodLabel = null,
  hasInvoices = false,
  statusDetail = null,
  variant = "default",
  onInvoiceHistory,
  onManagePayment,
  onManageBilling,
  onRetry,
  className,
  id = "billing-summary",
}: BillingSummaryProps) {
  const viewed = React.useRef(false);
  const titleId = React.useId();
  const compact = variant === "compact";

  React.useEffect(() => {
    if (state === "loading" || viewed.current) return;
    viewed.current = true;
    billingSummaryAnalytics.viewed({ plan, state, variant });
  }, [plan, state, variant]);

  if (state === "loading") {
    return <BillingSummaryLoading className={className} />;
  }

  if (state === "error") {
    return (
      <BillingSummaryError
        plan={plan}
        statusDetail={statusDetail}
        titleId={titleId}
        onRetry={onRetry}
        className={className}
      />
    );
  }

  const price = resolveBillingSummaryPrice(plan, currentPrice, billingCycle);
  const renewal = formatBillingSummaryRenewal(plan, renewalDate);
  const payment = billingSummaryPaymentDisplay(plan, paymentMethodLabel);
  const detail = billingSummaryStatusDetail(state, statusDetail);
  const showManagePayment = shouldShowBillingSummaryManagePayment(plan, state);
  const isExpired = state === "expired";

  const summary = [
    `${billingSummaryPlanLabel(plan)} plan`,
    price,
    billingSummaryCycleLabel(billingCycle),
    renewal,
    payment.text,
    isExpired ? BILLING_SUMMARY_COPY.expiredDetail : null,
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <section
      id={id}
      className={cn(
        billingSummaryChrome,
        isExpired && "border-warning/50",
        className,
      )}
      aria-labelledby={titleId}
      aria-label={summary}
    >
      <h2
        id={titleId}
        className="text-body-sm font-bold text-foreground sm:text-body"
      >
        {BILLING_SUMMARY_COPY.title}
      </h2>

      {detail ? (
        <BodySmall
          className="mt-sm text-muted-foreground"
          role={isExpired ? "status" : undefined}
        >
          {detail}
        </BodySmall>
      ) : null}

      <dl
        className={cn(
          "mt-md grid gap-md",
          compact ? "grid-cols-1" : "sm:grid-cols-2",
        )}
      >
        <BillingSummaryField
          label={BILLING_SUMMARY_COPY.currentPlan}
          value={billingSummaryPlanLabel(plan)}
        />
        <BillingSummaryField
          label={BILLING_SUMMARY_COPY.currentPrice}
          value={price}
        />
        <BillingSummaryField
          label={BILLING_SUMMARY_COPY.billingCycle}
          value={billingSummaryCycleLabel(billingCycle)}
        />
        <BillingSummaryField
          label={
            plan === "free"
              ? BILLING_SUMMARY_COPY.renewalDate
              : BILLING_SUMMARY_COPY.nextBillingDate
          }
          value={renewal}
        />
        <BillingSummaryField
          label={BILLING_SUMMARY_COPY.paymentMethod}
          value={
            payment.kind === "add" ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto px-0 text-primary"
                onClick={() => {
                  billingSummaryAnalytics.managePaymentClicked({ plan });
                  onManagePayment?.();
                }}
              >
                {payment.text}
              </Button>
            ) : (
              <BodySmall
                className={cn(
                  "font-semibold",
                  payment.kind === "empty"
                    ? "text-muted-foreground"
                    : "text-foreground",
                )}
              >
                {payment.text}
              </BodySmall>
            )
          }
        />
      </dl>

      <div className="mt-md flex flex-col gap-sm sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => {
            billingSummaryAnalytics.invoiceHistoryClicked({ plan });
            onInvoiceHistory?.();
          }}
        >
          {BILLING_SUMMARY_COPY.invoiceHistory}
        </Button>
        {onManageBilling ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => {
              billingSummaryAnalytics.manageBillingClicked({ plan });
              onManageBilling();
            }}
          >
            {BILLING_SUMMARY_COPY.manageBilling}
          </Button>
        ) : null}
        {showManagePayment && onManagePayment && payment.kind !== "add" ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => {
              billingSummaryAnalytics.managePaymentClicked({ plan });
              onManagePayment();
            }}
          >
            {BILLING_SUMMARY_COPY.managePayment}
          </Button>
        ) : null}
      </div>

      {!hasInvoices ? (
        <Caption className="mt-sm text-muted-foreground">
          {BILLING_SUMMARY_COPY.invoicesEmpty}
        </Caption>
      ) : null}
    </section>
  );
}
