"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Caption } from "@/components/ui/typography";
import {
  BILLING_PAYMENTS_COPY,
  type BillingPaymentsCycle,
  type BillingPaymentsPlan,
} from "@/config/billing-payments";
import { billingPaymentsAnalytics } from "@/lib/analytics/billing-payments-events";
import {
  applyBillingPaymentsCoupon,
  couponApplyErrorMessage,
  type BillingPaymentsAppliedCoupon,
} from "@/utils/billing-payments";
import { cn } from "@/utils/cn";

const chrome =
  "w-full rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg";

export type CouponCodeInputProps = {
  plan: BillingPaymentsPlan;
  cycle: BillingPaymentsCycle;
  appliedCoupon?: BillingPaymentsAppliedCoupon | null;
  onApply: (coupon: BillingPaymentsAppliedCoupon) => void;
  onRemove: () => void;
  disabled?: boolean;
  className?: string;
  id?: string;
};

/**
 * SCREEN-012 — Coupon Code Input.
 * Mock validation only — inline success/error, no toast-only.
 */
export function CouponCodeInput({
  plan,
  cycle,
  appliedCoupon = null,
  onApply,
  onRemove,
  disabled = false,
  className,
  id,
}: CouponCodeInputProps) {
  const titleId = React.useId();
  const [draft, setDraft] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (appliedCoupon) {
      setDraft(appliedCoupon.code);
      setError(null);
    }
  }, [appliedCoupon]);

  const handleApply = () => {
    if (disabled) return;
    const result = applyBillingPaymentsCoupon(draft);
    if (!result.ok) {
      setError(couponApplyErrorMessage(result.error));
      billingPaymentsAnalytics.couponFailed({
        plan,
        cycle,
        reason: result.error,
      });
      return;
    }
    setError(null);
    setDraft(result.coupon.code);
    billingPaymentsAnalytics.couponApplied({
      plan,
      cycle,
      couponCode: result.coupon.code,
      percentOff: result.coupon.percentOff,
    });
    onApply(result.coupon);
  };

  const handleRemove = () => {
    if (disabled || !appliedCoupon) return;
    billingPaymentsAnalytics.couponRemoved({
      plan,
      cycle,
      couponCode: appliedCoupon.code,
    });
    setDraft("");
    setError(null);
    onRemove();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (appliedCoupon) return;
      handleApply();
    }
  };

  return (
    <section
      id={id}
      className={cn(chrome, className)}
      aria-labelledby={titleId}
    >
      <Caption id={titleId} className="text-muted-foreground">
        {BILLING_PAYMENTS_COPY.coupon}
      </Caption>

      <div className="mt-md flex flex-col gap-sm sm:flex-row sm:items-end">
        <Input
          aria-labelledby={titleId}
          containerClassName="min-w-0 flex-1"
          placeholder={BILLING_PAYMENTS_COPY.couponPlaceholder}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled || Boolean(appliedCoupon)}
          readOnly={Boolean(appliedCoupon)}
          errorMessage={error ?? undefined}
          successMessage={
            appliedCoupon ? BILLING_PAYMENTS_COPY.couponApplied : undefined
          }
          autoComplete="off"
          spellCheck={false}
          inputMode="text"
        />

        {appliedCoupon ? (
          <Button
            type="button"
            variant="outline"
            size="md"
            disabled={disabled}
            onClick={handleRemove}
          >
            {BILLING_PAYMENTS_COPY.removeCoupon}
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            size="md"
            disabled={disabled}
            onClick={handleApply}
          >
            {BILLING_PAYMENTS_COPY.applyCoupon}
          </Button>
        )}
      </div>
    </section>
  );
}
