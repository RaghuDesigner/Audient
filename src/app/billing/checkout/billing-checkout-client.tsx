"use client";

import * as React from "react";

import { AuthSessionFallback } from "@/components/auth/AuthSessionFallback";
import { BillingPaymentsScreen } from "@/components/billing/BillingPaymentsScreen";
import {
  BILLING_PAYMENTS_COPY,
  BILLING_PAYMENTS_ROUTE,
} from "@/config/billing-payments";
import {
  getMockBillingPayments,
  type MockBillingPayments,
} from "@/data/mock-billing-payments";
import { useRequireAuth } from "@/hooks/use-require-auth";

export type BillingCheckoutClientProps = {
  initialData: MockBillingPayments;
};

/**
 * SCREEN-012 client shell — guest → sign-in; mock retry for QA.
 */
export function BillingCheckoutClient({
  initialData,
}: BillingCheckoutClientProps) {
  const { isReady } = useRequireAuth({
    redirectTo: BILLING_PAYMENTS_ROUTE,
    intentType: "subscribe",
  });
  const [data, setData] = React.useState(initialData);

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  React.useEffect(() => {
    if (!isReady) return;
    const hash =
      typeof window !== "undefined"
        ? window.location.hash.replace(/^#/, "")
        : "";
    if (hash !== "payment-method") return;
    const el = document.getElementById("payment-method");
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    if (el instanceof HTMLElement) {
      el.focus({ preventScroll: true });
    }
  }, [isReady, data]);

  if (!isReady) {
    return (
      <AuthSessionFallback message={BILLING_PAYMENTS_COPY.guestRedirect} />
    );
  }

  return (
    <BillingPaymentsScreen
      data={data}
      onRetry={() =>
        setData(
          getMockBillingPayments(data.plan ?? "pro", {
            state: "success",
          }),
        )
      }
    />
  );
}
