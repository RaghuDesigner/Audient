"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { AuthSessionFallback } from "@/components/auth/AuthSessionFallback";
import { PaymentSuccessScreen } from "@/components/billing/PaymentSuccessScreen";
import {
  PAYMENT_SUCCESS_COPY,
  PAYMENT_SUCCESS_DASHBOARD_ROUTE,
  PAYMENT_SUCCESS_ROUTE,
} from "@/config/payment-success";
import {
  getMockPaymentSuccess,
  type MockPaymentSuccess,
} from "@/data/mock-payment-success";
import { useRequireAuth } from "@/hooks/use-require-auth";

export type PaymentSuccessClientProps = {
  /** Null when plan missing — redirect to Dashboard. */
  initialData: MockPaymentSuccess | null;
};

/**
 * SCREEN-015 client shell — guest → sign-in; empty context → Dashboard.
 */
export function PaymentSuccessClient({
  initialData,
}: PaymentSuccessClientProps) {
  const router = useRouter();
  const { isReady } = useRequireAuth({
    redirectTo: PAYMENT_SUCCESS_ROUTE,
    intentType: "subscribe",
  });
  const [data, setData] = React.useState(initialData);

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  React.useEffect(() => {
    if (!isReady) return;
    if (data != null) return;
    router.replace(PAYMENT_SUCCESS_DASHBOARD_ROUTE);
  }, [data, isReady, router]);

  if (!isReady) {
    return (
      <AuthSessionFallback message={PAYMENT_SUCCESS_COPY.guestRedirect} />
    );
  }

  if (data == null) {
    return (
      <AuthSessionFallback message={PAYMENT_SUCCESS_COPY.emptyRedirect} />
    );
  }

  return (
    <PaymentSuccessScreen
      data={data}
      skipMembershipApply={data.state === "error"}
      onRetry={() =>
        setData(
          getMockPaymentSuccess({
            plan: data.plan,
            cycle: data.cycle,
            intentId: data.viewModel.intentId,
            amountCents: data.viewModel.amountPaidCents,
            couponCode: data.viewModel.appliedCoupon?.code,
            state: "success",
          }),
        )
      }
    />
  );
}
