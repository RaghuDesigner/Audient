import { BillingCheckoutClient } from "@/app/billing/checkout/billing-checkout-client";
import {
  BILLING_PAYMENTS_PLANS,
  BILLING_PAYMENTS_STATES,
  type BillingPaymentsPlan,
  type BillingPaymentsState,
} from "@/config/billing-payments";
import {
  getMockBillingPayments,
  MOCK_BILLING_PAYMENTS_COUPONS,
  type MockBillingPayments,
} from "@/data/mock-billing-payments";
import { LoginModalProvider } from "@/providers/login-modal-provider";
import { UpgradePlansModalProvider } from "@/providers/upgrade-plans-modal-provider";
import { parseBillingPaymentsCycle } from "@/utils/billing-payments";

type BillingCheckoutPageProps = {
  searchParams: Promise<{
    plan?: string;
    cycle?: string;
    state?: string;
    coupon?: string;
  }>;
};

/**
 * SCREEN-012 — Billing & Payments (`/billing/checkout`).
 * Proceed → `/checkout`. QA: `?plan=` `?cycle=` `?state=` `?coupon=`.
 */
export default async function BillingCheckoutPage({
  searchParams,
}: BillingCheckoutPageProps) {
  const query = await searchParams;
  const data = resolveMockBillingPayments(query);

  return (
    <LoginModalProvider>
      <UpgradePlansModalProvider>
        <BillingCheckoutClient initialData={data} />
      </UpgradePlansModalProvider>
    </LoginModalProvider>
  );
}

function resolveMockBillingPayments(query: {
  plan?: string;
  cycle?: string;
  state?: string;
  coupon?: string;
}): MockBillingPayments {
  const plan = parsePlan(query.plan);
  const state = parseState(query.state);
  const cycle = parseBillingPaymentsCycle(query.cycle);
  const couponCode = query.coupon?.trim().toUpperCase();
  const appliedCoupon =
    couponCode != null && couponCode.length > 0
      ? (MOCK_BILLING_PAYMENTS_COUPONS.find((c) => c.code === couponCode) ??
        null)
      : null;

  if (state === "empty" || plan == null) {
    return getMockBillingPayments(null, {
      state: "empty",
      cycle,
      appliedCoupon,
    });
  }

  if (state === "loading") {
    return getMockBillingPayments(plan, {
      state: "loading",
      cycle,
      appliedCoupon,
    });
  }

  if (state === "error") {
    return getMockBillingPayments(plan, {
      state: "error",
      cycle,
      appliedCoupon,
    });
  }

  return getMockBillingPayments(plan, {
    state: "success",
    cycle,
    appliedCoupon,
  });
}

function parsePlan(value?: string): BillingPaymentsPlan | null {
  if (!value) return "pro";
  const normalized = value.toLowerCase();
  if (normalized === "enterprise") return "business";
  return (BILLING_PAYMENTS_PLANS as readonly string[]).includes(normalized)
    ? (normalized as BillingPaymentsPlan)
    : null;
}

function parseState(value?: string): BillingPaymentsState | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  return (BILLING_PAYMENTS_STATES as readonly string[]).includes(normalized)
    ? (normalized as BillingPaymentsState)
    : undefined;
}
