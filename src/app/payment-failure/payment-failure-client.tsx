"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { AuthSessionFallback } from "@/components/auth/AuthSessionFallback";
import { PaymentFailureScreen } from "@/components/billing/PaymentFailureScreen";
import {
  PAYMENT_FAILURE_BILLING_ROUTE,
  PAYMENT_FAILURE_COPY,
  PAYMENT_FAILURE_ROUTE,
} from "@/config/payment-failure";
import {
  getMockPaymentFailure,
  type MockPaymentFailure,
} from "@/data/mock-payment-failure";
import { useRequireAuth } from "@/hooks/use-require-auth";

export type PaymentFailureClientProps = {
  /** Null when plan missing — redirect to Billing. */
  initialData: MockPaymentFailure | null;
};

/**
 * SCREEN-016 client shell — guest → sign-in; empty context → Billing.
 * Does not apply membership or auto-retry charges.
 */
export function PaymentFailureClient({
  initialData,
}: PaymentFailureClientProps) {
  const router = useRouter();
  const { isReady } = useRequireAuth({
    redirectTo: PAYMENT_FAILURE_ROUTE,
    intentType: "subscribe",
  });
  const [data, setData] = React.useState(initialData);

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  React.useEffect(() => {
    if (!isReady) return;
    if (data != null) return;
    router.replace(PAYMENT_FAILURE_BILLING_ROUTE);
  }, [data, isReady, router]);

  if (!isReady) {
    return (
      <AuthSessionFallback message={PAYMENT_FAILURE_COPY.guestRedirect} />
    );
  }

  if (data == null) {
    return (
      <AuthSessionFallback message={PAYMENT_FAILURE_COPY.emptyRedirect} />
    );
  }

  return (
    <PaymentFailureScreen
      data={data}
      onRetryLoad={() =>
        setData(
          getMockPaymentFailure({
            plan: data.plan,
            cycle: data.cycle,
            reason: data.reason,
            intentId: data.viewModel.intentId,
            amountCents: data.viewModel.amountCents,
            couponCode: data.viewModel.appliedCoupon?.code,
            state: "failure",
          }),
        )
      }
    />
  );
}
