"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { AuthSessionFallback } from "@/components/auth/AuthSessionFallback";
import { PaymentProcessingScreen } from "@/components/billing/PaymentProcessingScreen";
import {
  PAYMENT_PROCESSING_COPY,
  PAYMENT_PROCESSING_ROUTE,
} from "@/config/payment-processing";
import { CHECKOUT_BILLING_ROUTE } from "@/config/checkout";
import { type MockPaymentProcessing } from "@/data/mock-payment-processing";
import { useRequireAuth } from "@/hooks/use-require-auth";

export type PaymentProcessingClientProps = {
  /** Null when plan missing — redirect to Billing & Payments. */
  initialData: MockPaymentProcessing | null;
};

/**
 * SCREEN-014 client shell — guest → sign-in; empty context → billing; single intent.
 */
export function PaymentProcessingClient({
  initialData,
}: PaymentProcessingClientProps) {
  const router = useRouter();
  const { isReady } = useRequireAuth({
    redirectTo: PAYMENT_PROCESSING_ROUTE,
    intentType: "subscribe",
  });
  const [data, setData] = React.useState(initialData);

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  React.useEffect(() => {
    if (!isReady) return;
    if (data != null) return;
    router.replace(CHECKOUT_BILLING_ROUTE);
  }, [data, isReady, router]);

  if (!isReady) {
    return (
      <AuthSessionFallback message={PAYMENT_PROCESSING_COPY.guestRedirect} />
    );
  }

  if (data == null) {
    return (
      <AuthSessionFallback message={PAYMENT_PROCESSING_COPY.emptyRedirect} />
    );
  }

  return (
    <PaymentProcessingScreen
      data={data}
      onRetry={(current) => setData({ ...current })}
    />
  );
}
