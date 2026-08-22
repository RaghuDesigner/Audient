"use client";

import { XCircle } from "lucide-react";

import { CheckoutSummary } from "@/components/billing/CheckoutSummary";
import { Button } from "@/components/ui/button";
import { BodyMedium, BodySmall, Caption, H2 } from "@/components/ui/typography";
import { PAYMENT_FAILURE_COPY } from "@/config/payment-failure";
import type { MockPaymentFailure } from "@/data/mock-payment-failure";
import {
  formatPaymentFailureCredits,
  formatPaymentFailureMoney,
} from "@/utils/payment-failure";
import { cn } from "@/utils/cn";

export type PaymentFailureContentProps = {
  data: MockPaymentFailure;
  retrying?: boolean;
  onTryAgain: () => void;
  onChangePaymentMethod: () => void;
  onBackToBilling: () => void;
  className?: string;
};

/**
 * SCREEN-016 body — failure chrome, safe reason, order snapshot, CTAs.
 * Never activates membership or grants credits.
 */
export function PaymentFailureContent({
  data,
  retrying = false,
  onTryAgain,
  onChangePaymentMethod,
  onBackToBilling,
  className,
}: PaymentFailureContentProps) {
  const { viewModel } = data;
  const amountLabel = formatPaymentFailureMoney(viewModel.amountCents);
  const actionsDisabled = retrying;

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-lg flex-col items-center gap-lg",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-md text-center">
        <XCircle
          className="size-14 text-destructive"
          aria-hidden
          strokeWidth={1.5}
        />
        <div className="flex flex-col gap-sm">
          <H2 id="payment-failure-heading" className="text-foreground">
            {PAYMENT_FAILURE_COPY.title}
          </H2>
          <BodyMedium className="text-muted-foreground">
            {PAYMENT_FAILURE_COPY.subtitle}
          </BodyMedium>
        </div>
      </div>

      <div
        className="w-full rounded-md border border-border bg-surface p-md text-left"
        role="status"
        aria-live="assertive"
        aria-atomic="true"
      >
        <Caption className="font-semibold uppercase tracking-wide text-muted-foreground">
          {PAYMENT_FAILURE_COPY.reasonLabel}
        </Caption>
        <BodySmall className="mt-sm font-semibold text-foreground">
          {viewModel.reasonLabel}
        </BodySmall>
        <BodySmall className="mt-sm text-muted-foreground">
          {PAYMENT_FAILURE_COPY.notChargedHint}
        </BodySmall>
      </div>

      <section
        className="w-full"
        aria-labelledby="payment-failure-order"
      >
        <Caption
          id="payment-failure-order"
          className="mb-sm block font-semibold uppercase tracking-wide text-muted-foreground"
        >
          {PAYMENT_FAILURE_COPY.orderSummary}
        </Caption>
        <CheckoutSummary
          state="default"
          planName={viewModel.plan}
          billingCycle={viewModel.cycle}
          priceLabel={amountLabel}
          currency={viewModel.currency}
          creditsIncluded={viewModel.creditsIncluded}
          features={null}
          variant="compact"
          context="checkout"
        />
        <div className="mt-sm flex flex-wrap justify-between gap-sm px-sm">
          <Caption className="text-muted-foreground">
            {PAYMENT_FAILURE_COPY.amount}
          </Caption>
          <BodySmall className="font-semibold text-foreground">
            {amountLabel}
          </BodySmall>
        </div>
        <div className="mt-sm flex flex-wrap justify-between gap-sm px-sm">
          <Caption className="text-muted-foreground">
            {PAYMENT_FAILURE_COPY.creditsIncluded}
          </Caption>
          <BodySmall className="text-foreground">
            {formatPaymentFailureCredits(viewModel.creditsIncluded)}
          </BodySmall>
        </div>
      </section>

      <div className="w-full rounded-md border border-border bg-surface p-md text-left">
        <Caption className="font-semibold uppercase tracking-wide text-muted-foreground">
          {PAYMENT_FAILURE_COPY.recommendedAction}
        </Caption>
        <BodySmall className="mt-sm text-foreground">
          {viewModel.recommendedAction}
        </BodySmall>
      </div>

      {retrying ? (
        <BodySmall
          className="text-center text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          {PAYMENT_FAILURE_COPY.retryingLabel}
        </BodySmall>
      ) : null}

      <div className="flex w-full flex-col gap-sm sm:flex-row sm:flex-wrap sm:justify-center">
        <Button
          type="button"
          variant="primary"
          className="w-full sm:w-auto"
          disabled={actionsDisabled}
          onClick={onTryAgain}
        >
          {PAYMENT_FAILURE_COPY.tryAgain}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          disabled={actionsDisabled}
          onClick={onChangePaymentMethod}
        >
          {PAYMENT_FAILURE_COPY.changePaymentMethod}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full sm:w-auto"
          disabled={actionsDisabled}
          onClick={onBackToBilling}
        >
          {PAYMENT_FAILURE_COPY.backToBilling}
        </Button>
      </div>
    </div>
  );
}
