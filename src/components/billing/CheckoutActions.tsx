"use client";

import { Button } from "@/components/ui/button";
import {
  CHECKOUT_COPY,
  type CheckoutCycle,
  type CheckoutPlan,
} from "@/config/checkout";
import { checkoutAnalytics } from "@/lib/analytics/checkout-events";
import { canEnablePayWithTerms } from "@/utils/terms-checkbox";
import { cn } from "@/utils/cn";

export type CheckoutActionsProps = {
  plan: CheckoutPlan;
  cycle: CheckoutCycle;
  termsAccepted: boolean;
  totalDueCents: number;
  hasCoupon?: boolean;
  processing?: boolean;
  /** Attempt Pay when terms missing — parent shows Terms error. */
  onPayBlocked?: () => void;
  onPayNow: () => void;
  onBackToBilling: () => void;
  className?: string;
  id?: string;
};

/**
 * SCREEN-013 — Pay Now + Back to Billing.
 * Pay Now gated on Terms; mock only — no Stripe charge.
 */
export function CheckoutActions({
  plan,
  cycle,
  termsAccepted,
  totalDueCents,
  hasCoupon = false,
  processing = false,
  onPayBlocked,
  onPayNow,
  onBackToBilling,
  className,
  id,
}: CheckoutActionsProps) {
  const canPay = canEnablePayWithTerms({
    termsAccepted,
    processing,
  });

  const handlePay = () => {
    if (processing) return;
    if (!termsAccepted) {
      onPayBlocked?.();
      return;
    }
    checkoutAnalytics.checkoutStarted({
      plan,
      cycle,
      totalDueCents,
      hasCoupon,
    });
    onPayNow();
  };

  const handleBack = () => {
    if (processing) return;
    checkoutAnalytics.backToBilling({ plan, cycle });
    onBackToBilling();
  };

  return (
    <div
      id={id}
      className={cn(
        "flex w-full flex-col-reverse gap-sm sm:flex-row sm:justify-end",
        className,
      )}
    >
      <Button
        type="button"
        variant="outline"
        size="md"
        disabled={processing}
        onClick={handleBack}
      >
        {CHECKOUT_COPY.backToBilling}
      </Button>

      <Button
        type="button"
        variant="primary"
        size="md"
        disabled={processing}
        isLoading={processing}
        aria-disabled={!canPay || undefined}
        className={cn(!canPay && !processing && "opacity-50")}
        onClick={handlePay}
      >
        {processing ? CHECKOUT_COPY.processing : CHECKOUT_COPY.payNow}
      </Button>
    </div>
  );
}
