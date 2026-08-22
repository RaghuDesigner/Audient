"use client";

import { CheckCircle2 } from "lucide-react";

import { CheckoutSummary } from "@/components/billing/CheckoutSummary";
import { Button } from "@/components/ui/button";
import { BodyMedium, BodySmall, Caption, H2 } from "@/components/ui/typography";
import { PAYMENT_SUCCESS_COPY } from "@/config/payment-success";
import type { MockPaymentSuccess } from "@/data/mock-payment-success";
import {
  formatPaymentSuccessCredits,
  formatPaymentSuccessMoney,
} from "@/utils/payment-success";
import { cn } from "@/utils/cn";

export type PaymentSuccessContentProps = {
  data: MockPaymentSuccess;
  onGoDashboard: () => void;
  onViewInvoice: () => void;
  onStartNewAudit: () => void;
  className?: string;
};

function SummaryRow({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-md">
      <Caption className="text-muted-foreground">{label}</Caption>
      <BodySmall
        className={cn(
          "text-right text-foreground",
          emphasize && "font-semibold",
        )}
      >
        {value}
      </BodySmall>
    </div>
  );
}

/**
 * SCREEN-015 body — success chrome, summaries, credits, CTAs.
 */
export function PaymentSuccessContent({
  data,
  onGoDashboard,
  onViewInvoice,
  onStartNewAudit,
  className,
}: PaymentSuccessContentProps) {
  const { viewModel } = data;
  const amountLabel = formatPaymentSuccessMoney(viewModel.amountPaidCents);
  const discountLabel =
    viewModel.discountCents > 0
      ? `−${formatPaymentSuccessMoney(viewModel.discountCents)}`
      : formatPaymentSuccessMoney(0);
  const taxLabel = formatPaymentSuccessMoney(viewModel.taxCents);
  const totalLabel = formatPaymentSuccessMoney(viewModel.totalCents);

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-lg flex-col items-center gap-lg",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-md text-center">
        <CheckCircle2
          className="size-14 text-success"
          aria-hidden
          strokeWidth={1.5}
        />
        <div className="flex flex-col gap-sm">
          <H2 id="payment-success-heading" className="text-foreground">
            {PAYMENT_SUCCESS_COPY.title}
          </H2>
          <BodyMedium className="text-muted-foreground">
            {PAYMENT_SUCCESS_COPY.subtitle}
          </BodyMedium>
        </div>
      </div>

      <section
        className="w-full"
        aria-labelledby="payment-success-subscription"
      >
        <Caption
          id="payment-success-subscription"
          className="mb-sm block font-semibold uppercase tracking-wide text-muted-foreground"
        >
          {PAYMENT_SUCCESS_COPY.subscriptionSummary}
        </Caption>
        <CheckoutSummary
          state="default"
          planName={viewModel.plan}
          billingCycle={viewModel.cycle}
          priceLabel={amountLabel}
          currency={viewModel.currency}
          creditsIncluded={viewModel.creditsAdded}
          features={data.featureBullets}
          renewalDateLabel={viewModel.renewalDateLabel}
          variant="default"
          context="payment_success"
        />
      </section>

      <section
        className="w-full rounded-md border border-border bg-surface p-md"
        aria-labelledby="payment-success-payment"
      >
        <Caption
          id="payment-success-payment"
          className="mb-md block font-semibold uppercase tracking-wide text-muted-foreground"
        >
          {PAYMENT_SUCCESS_COPY.paymentSummary}
        </Caption>
        <div className="flex flex-col gap-sm">
          <SummaryRow
            label={PAYMENT_SUCCESS_COPY.amountPaid}
            value={amountLabel}
          />
          <SummaryRow
            label={PAYMENT_SUCCESS_COPY.discount}
            value={discountLabel}
          />
          <SummaryRow label={PAYMENT_SUCCESS_COPY.tax} value={taxLabel} />
          <SummaryRow
            label={PAYMENT_SUCCESS_COPY.total}
            value={totalLabel}
            emphasize
          />
          <SummaryRow
            label={PAYMENT_SUCCESS_COPY.currency}
            value={viewModel.currency}
          />
          <SummaryRow
            label={PAYMENT_SUCCESS_COPY.paymentReference}
            value={viewModel.paymentReference}
          />
        </div>
      </section>

      <section
        className="w-full rounded-md border border-border bg-surface p-md"
        aria-label="Credits"
      >
        <div className="flex flex-col gap-sm">
          <SummaryRow
            label={PAYMENT_SUCCESS_COPY.creditsAdded}
            value={formatPaymentSuccessCredits(viewModel.creditsAdded)}
            emphasize
          />
          <SummaryRow
            label={PAYMENT_SUCCESS_COPY.totalCredits}
            value={formatPaymentSuccessCredits(viewModel.totalCreditsAvailable)}
          />
          <SummaryRow
            label={PAYMENT_SUCCESS_COPY.nextBillingDate}
            value={viewModel.renewalDateLabel}
          />
        </div>
      </section>

      <div className="flex w-full flex-col gap-sm sm:flex-row sm:flex-wrap sm:justify-center">
        <Button
          type="button"
          variant="primary"
          className="w-full sm:w-auto"
          onClick={onGoDashboard}
        >
          {PAYMENT_SUCCESS_COPY.goToDashboard}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={onViewInvoice}
        >
          {PAYMENT_SUCCESS_COPY.viewInvoice}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full sm:w-auto"
          onClick={onStartNewAudit}
        >
          {PAYMENT_SUCCESS_COPY.startNewAudit}
        </Button>
      </div>
    </div>
  );
}
