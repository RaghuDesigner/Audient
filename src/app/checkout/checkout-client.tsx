"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { AuthSessionFallback } from "@/components/auth/AuthSessionFallback";
import { CheckoutScreen } from "@/components/billing/CheckoutScreen";
import {
  CHECKOUT_BILLING_ROUTE,
  CHECKOUT_COPY,
  CHECKOUT_ROUTE,
} from "@/config/checkout";
import {
  getMockCheckout,
  type MockCheckout,
} from "@/data/mock-checkout";
import { useRequireAuth } from "@/hooks/use-require-auth";

export type CheckoutClientProps = {
  /** Null when plan missing — redirect to Billing & Payments. */
  initialData: MockCheckout | null;
};

/**
 * SCREEN-013 client shell — guest → sign-in; empty plan → billing; mock retry.
 */
export function CheckoutClient({ initialData }: CheckoutClientProps) {
  const router = useRouter();
  const { isReady } = useRequireAuth({
    redirectTo: CHECKOUT_ROUTE,
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
    return <AuthSessionFallback message={CHECKOUT_COPY.guestRedirect} />;
  }

  if (data == null) {
    return <AuthSessionFallback message={CHECKOUT_COPY.emptyRedirect} />;
  }

  return (
    <CheckoutScreen
      data={data}
      onRetry={() =>
        setData(
          getMockCheckout(data.plan, {
            state: "success",
            cycle: data.cycle,
            appliedCoupon: data.appliedCoupon,
            forcePayError: data.forcePayError,
          }),
        )
      }
    />
  );
}
