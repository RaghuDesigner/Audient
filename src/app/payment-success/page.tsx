import { PaymentSuccessClient } from "@/app/payment-success/payment-success-client";
import { LoginModalProvider } from "@/providers/login-modal-provider";
import { UpgradePlansModalProvider } from "@/providers/upgrade-plans-modal-provider";
import { getMockPaymentSuccess } from "@/data/mock-payment-success";
import type { MockPaymentSuccess } from "@/data/mock-payment-success";
import {
  parsePaymentSuccessAmountCents,
  parsePaymentSuccessCycle,
  parsePaymentSuccessPlan,
  parsePaymentSuccessState,
} from "@/utils/payment-success";

type PaymentSuccessPageProps = {
  searchParams: Promise<{
    plan?: string;
    cycle?: string;
    amountCents?: string;
    coupon?: string;
    intentId?: string;
    state?: string;
  }>;
};

/**
 * SCREEN-015 — Payment Success (`/payment-success`).
 * Mock only. QA: `?plan=` `?cycle=` `?state=loading|error|success` `?amountCents=` `?coupon=`.
 * Guests → sign-in. Missing plan → Dashboard.
 */
export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const query = await searchParams;
  const data = resolveMockPaymentSuccess(query);

  return (
    <LoginModalProvider>
      <UpgradePlansModalProvider>
        <PaymentSuccessClient initialData={data} />
      </UpgradePlansModalProvider>
    </LoginModalProvider>
  );
}

function resolveMockPaymentSuccess(query: {
  plan?: string;
  cycle?: string;
  amountCents?: string;
  coupon?: string;
  intentId?: string;
  state?: string;
}): MockPaymentSuccess | null {
  const plan = parsePaymentSuccessPlan(query.plan);
  if (!plan) return null;

  return getMockPaymentSuccess({
    plan,
    cycle: parsePaymentSuccessCycle(query.cycle),
    intentId: query.intentId,
    amountCents: parsePaymentSuccessAmountCents(query.amountCents),
    couponCode: query.coupon,
    state: parsePaymentSuccessState(query.state),
  });
}
