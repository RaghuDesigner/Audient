"use client";

import { BillingCycleSelector } from "@/components/billing/BillingCycleSelector";
import { BillingDetailsCard } from "@/components/billing/BillingDetailsCard";
import { CouponCodeInput } from "@/components/billing/CouponCodeInput";
import { OrderSummary } from "@/components/billing/OrderSummary";
import { PaymentMethodCard } from "@/components/billing/PaymentMethodCard";
import { SelectedPlanCard } from "@/components/billing/SelectedPlanCard";
import { Button } from "@/components/ui/button";
import { BodySmall, Caption } from "@/components/ui/typography";
import { BILLING_PAYMENTS_COPY } from "@/config/billing-payments";
import type { MockBillingPayments } from "@/data/mock-billing-payments";
import type { BillingPaymentsAppliedCoupon } from "@/utils/billing-payments";
import { buildBillingPaymentsOrderSummary } from "@/utils/billing-payments";
import type { BillingDetailsValues } from "@/utils/billing-details-card";
import { cn } from "@/utils/cn";
import { ShieldCheck } from "lucide-react";

export type BillingPaymentsContentProps = {
  data: MockBillingPayments & { plan: NonNullable<MockBillingPayments["plan"]> };
  loading: boolean;
  cycle: NonNullable<MockBillingPayments["cycle"]>;
  onCycleChange: (cycle: NonNullable<MockBillingPayments["cycle"]>) => void;
  coupon: BillingPaymentsAppliedCoupon | null;
  onCouponApply: (coupon: BillingPaymentsAppliedCoupon) => void;
  onCouponRemove: () => void;
  billingDetails: BillingDetailsValues;
  onBillingDetailsChange: (values: BillingDetailsValues) => void;
  billingValidateToken?: number;
  processing: boolean;
  onProceed: () => void;
  onReturnMembership: () => void;
  onChangePlan: () => void;
};

/**
 * SCREEN-012 body — plan, cycle, order, coupon, payment, proceed.
 */
export function BillingPaymentsContent({
  data,
  loading,
  cycle,
  onCycleChange,
  coupon,
  onCouponApply,
  onCouponRemove,
  billingDetails,
  onBillingDetailsChange,
  billingValidateToken,
  processing,
  onProceed,
  onReturnMembership,
  onChangePlan,
}: BillingPaymentsContentProps) {
  const plan = data.plan;
  const order = buildBillingPaymentsOrderSummary({ plan, cycle, coupon });

  return (
    <div
      className={cn(
        "flex flex-col gap-lg",
        "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] lg:items-start",
      )}
    >
      <div className="flex flex-col gap-lg">
        <SelectedPlanCard
          plan={plan}
          cycle={cycle}
          featureBullets={data.featureBullets}
          creditsIncluded={data.creditsIncluded}
          loading={loading}
          onChangePlan={onChangePlan}
        />
        {!loading ? (
          <BillingCycleSelector
            value={cycle}
            onChange={onCycleChange}
            plan={plan}
            disabled={processing}
          />
        ) : null}
        {!loading ? (
          <CouponCodeInput
            plan={plan}
            cycle={cycle}
            appliedCoupon={coupon}
            onApply={onCouponApply}
            onRemove={onCouponRemove}
            disabled={processing}
          />
        ) : null}
        <BillingDetailsCard
          state={loading ? "loading" : "default"}
          mode="edit"
          values={billingDetails}
          validateToken={billingValidateToken}
          onChange={onBillingDetailsChange}
        />
        {!loading ? (
          <PaymentMethodCard
            plan={plan}
            cycle={cycle}
            id="payment-method"
          />
        ) : null}
        {!loading ? (
          <section className="w-full rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg">
            <div className="flex items-center gap-sm">
              <ShieldCheck
                className="size-5 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <Caption className="text-muted-foreground">
                {BILLING_PAYMENTS_COPY.securityTitle}
              </Caption>
            </div>
            <BodySmall className="mt-md text-muted-foreground">
              {BILLING_PAYMENTS_COPY.securitySsl}
            </BodySmall>
            <BodySmall className="mt-sm text-muted-foreground">
              {BILLING_PAYMENTS_COPY.securityPci}
            </BodySmall>
          </section>
        ) : null}
      </div>

      <aside className="flex flex-col gap-lg lg:sticky lg:top-lg">
        <OrderSummary
          plan={plan}
          cycle={cycle}
          coupon={coupon}
          loading={loading}
        />
        {!loading ? (
          <div className="flex flex-col-reverse gap-sm sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="md"
              disabled={processing}
              onClick={onReturnMembership}
            >
              {BILLING_PAYMENTS_COPY.returnMembership}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              isLoading={processing}
              onClick={onProceed}
            >
              {processing
                ? BILLING_PAYMENTS_COPY.processing
                : BILLING_PAYMENTS_COPY.proceed}
            </Button>
          </div>
        ) : null}
        {!loading ? (
          <BodySmall className="sr-only" role="status" aria-live="polite">
            {`${BILLING_PAYMENTS_COPY.total}: ${order.totalDueCents}`}
          </BodySmall>
        ) : null}
      </aside>
    </div>
  );
}
