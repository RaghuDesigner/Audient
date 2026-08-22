"use client";

import { BillingDetailsCard } from "@/components/billing/BillingDetailsCard";
import { CheckoutActions } from "@/components/billing/CheckoutActions";
import { CheckoutSummary } from "@/components/billing/CheckoutSummary";
import { OrderSummary } from "@/components/billing/OrderSummary";
import { PaymentMethodCard } from "@/components/billing/PaymentMethodCard";
import { SelectedPlanCard } from "@/components/billing/SelectedPlanCard";
import { TermsAcceptance } from "@/components/billing/TermsAcceptance";
import {
  mockCheckoutBillingToDetailsValues,
  type MockCheckout,
} from "@/data/mock-checkout";
import { cn } from "@/utils/cn";

export type CheckoutContentProps = {
  data: MockCheckout;
  loading: boolean;
  termsAccepted: boolean;
  onTermsChange: (checked: boolean) => void;
  termsShowError?: boolean;
  onPayBlocked?: () => void;
  processing: boolean;
  totalDueCents: number;
  onPayNow: () => void;
  onBackToBilling: () => void;
  onChangePlan: () => void;
};

/**
 * SCREEN-013 body — summary, plan, billing, payment, order, terms, actions.
 */
export function CheckoutContent({
  data,
  loading,
  termsAccepted,
  onTermsChange,
  termsShowError = false,
  onPayBlocked,
  processing,
  totalDueCents,
  onPayNow,
  onBackToBilling,
  onChangePlan,
}: CheckoutContentProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-lg",
        "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] lg:items-start",
      )}
    >
      <div className="flex flex-col gap-lg">
        <CheckoutSummary
          state={loading ? "loading" : "default"}
          planName={data.plan}
          billingCycle={data.cycle}
          creditsIncluded={data.creditsIncluded}
          features={data.featureBullets}
          renewalDateLabel={data.renewalDateLabel}
          variant="default"
          context="checkout"
        />
        <SelectedPlanCard
          plan={data.plan}
          cycle={data.cycle}
          featureBullets={data.featureBullets}
          creditsIncluded={data.creditsIncluded}
          loading={loading}
          onChangePlan={onChangePlan}
        />
        <BillingDetailsCard
          state={loading ? "loading" : "read_only"}
          mode="read_only"
          values={mockCheckoutBillingToDetailsValues(data.billing)}
        />
        {!loading ? (
          <PaymentMethodCard
            plan={data.plan}
            cycle={data.cycle}
            id="payment-method"
          />
        ) : null}
        {!loading ? (
          <TermsAcceptance
            checked={termsAccepted}
            onCheckedChange={onTermsChange}
            showRequiredError={termsShowError}
            disabled={processing}
          />
        ) : null}
      </div>

      <aside className="flex flex-col gap-lg lg:sticky lg:top-lg">
        <OrderSummary
          plan={data.plan}
          cycle={data.cycle}
          coupon={data.appliedCoupon}
          loading={loading}
        />
      </aside>

      {!loading ? (
        <div className="lg:col-span-2">
          <CheckoutActions
            plan={data.plan}
            cycle={data.cycle}
            termsAccepted={termsAccepted}
            totalDueCents={totalDueCents}
            hasCoupon={Boolean(data.appliedCoupon)}
            processing={processing}
            onPayBlocked={onPayBlocked}
            onPayNow={onPayNow}
            onBackToBilling={onBackToBilling}
          />
        </div>
      ) : null}
    </div>
  );
}
