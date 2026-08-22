import { CheckoutClient } from "@/app/checkout/checkout-client";
import { LoginModalProvider } from "@/providers/login-modal-provider";
import { UpgradePlansModalProvider } from "@/providers/upgrade-plans-modal-provider";
import { MOCK_BILLING_PAYMENTS_COUPONS } from "@/data/mock-billing-payments";
import {
  getMockCheckout,
  type MockCheckout,
} from "@/data/mock-checkout";
import {
  parseCheckoutCycle,
  parseCheckoutPlan,
  parseCheckoutState,
} from "@/utils/checkout";

type CheckoutPageProps = {
  searchParams: Promise<{
    plan?: string;
    cycle?: string;
    state?: string;
    coupon?: string;
    payError?: string;
  }>;
};

/**
 * SCREEN-013 — Checkout (`/checkout`).
 * Phase-1 mock only. QA: `?plan=` `?cycle=` `?state=` `?coupon=` `?payError=1`.
 * Guests → `/sign-in?next=/checkout`. Missing plan → Billing & Payments.
 */
export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const query = await searchParams;
  const data = resolveMockCheckout(query);

  return (
    <LoginModalProvider>
      <UpgradePlansModalProvider>
        <CheckoutClient initialData={data} />
      </UpgradePlansModalProvider>
    </LoginModalProvider>
  );
}

function resolveMockCheckout(query: {
  plan?: string;
  cycle?: string;
  state?: string;
  coupon?: string;
  payError?: string;
}): MockCheckout | null {
  const plan = parseCheckoutPlan(query.plan);
  if (!plan) return null;

  const cycle = parseCheckoutCycle(query.cycle);
  const state = parseCheckoutState(query.state);
  const couponCode = query.coupon?.trim().toUpperCase();
  const appliedCoupon =
    couponCode != null && couponCode.length > 0
      ? (MOCK_BILLING_PAYMENTS_COUPONS.find((c) => c.code === couponCode) ??
        null)
      : null;
  const forcePayError =
    query.payError === "1" || query.payError === "true";

  if (state === "loading") {
    return getMockCheckout(plan, {
      state: "loading",
      cycle,
      appliedCoupon,
      forcePayError,
    });
  }

  if (state === "error") {
    return getMockCheckout(plan, {
      state: "error",
      cycle,
      appliedCoupon,
      forcePayError,
    });
  }

  return getMockCheckout(plan, {
    state: "success",
    cycle,
    appliedCoupon,
    forcePayError,
  });
}
