import { PaymentFailureClient } from "@/app/payment-failure/payment-failure-client";
import { LoginModalProvider } from "@/providers/login-modal-provider";
import { UpgradePlansModalProvider } from "@/providers/upgrade-plans-modal-provider";
import { getMockPaymentFailure } from "@/data/mock-payment-failure";
import type { MockPaymentFailure } from "@/data/mock-payment-failure";
import {
  parsePaymentFailureAmountCents,
  parsePaymentFailureCycle,
  parsePaymentFailurePlan,
  parsePaymentFailureReason,
  parsePaymentFailureState,
} from "@/utils/payment-failure";

type PaymentFailurePageProps = {
  searchParams: Promise<{
    plan?: string;
    cycle?: string;
    amountCents?: string;
    coupon?: string;
    intentId?: string;
    reason?: string;
    state?: string;
  }>;
};

/**
 * SCREEN-016 — Payment Failure (`/payment-failure`).
 * Mock only. QA: `?plan=` `?reason=declined|network|timeout|session_expired|unknown`
 * `?state=loading|error|failure`. Guests → sign-in. Missing plan → Billing.
 */
export default async function PaymentFailurePage({
  searchParams,
}: PaymentFailurePageProps) {
  const query = await searchParams;
  const data = resolveMockPaymentFailure(query);

  return (
    <LoginModalProvider>
      <UpgradePlansModalProvider>
        <PaymentFailureClient initialData={data} />
      </UpgradePlansModalProvider>
    </LoginModalProvider>
  );
}

function resolveMockPaymentFailure(query: {
  plan?: string;
  cycle?: string;
  amountCents?: string;
  coupon?: string;
  intentId?: string;
  reason?: string;
  state?: string;
}): MockPaymentFailure | null {
  const plan = parsePaymentFailurePlan(query.plan);
  if (!plan) return null;

  return getMockPaymentFailure({
    plan,
    cycle: parsePaymentFailureCycle(query.cycle),
    reason: parsePaymentFailureReason(query.reason),
    intentId: query.intentId,
    amountCents: parsePaymentFailureAmountCents(query.amountCents),
    couponCode: query.coupon,
    state: parsePaymentFailureState(query.state),
  });
}
