import { PaymentProcessingClient } from "@/app/payment/processing/payment-processing-client";
import { LoginModalProvider } from "@/providers/login-modal-provider";
import { UpgradePlansModalProvider } from "@/providers/upgrade-plans-modal-provider";
import { getMockPaymentProcessing } from "@/data/mock-payment-processing";
import type { MockPaymentProcessing } from "@/data/mock-payment-processing";
import {
  parsePaymentProcessingCycle,
  parsePaymentProcessingDelayMs,
  parsePaymentProcessingPlan,
  parsePaymentProcessingResult,
} from "@/utils/payment-processing";

type PaymentProcessingPageProps = {
  searchParams: Promise<{
    plan?: string;
    cycle?: string;
    amountCents?: string;
    coupon?: string;
    intentId?: string;
    result?: string;
    delayMs?: string;
  }>;
};

/**
 * SCREEN-014 — Payment Processing (`/payment/processing`).
 * Mock only. QA: `?plan=` `?cycle=` `?result=success|failure|timeout` `?delayMs=`.
 * Guests → sign-in. Missing plan → Billing & Payments.
 */
export default async function PaymentProcessingPage({
  searchParams,
}: PaymentProcessingPageProps) {
  const query = await searchParams;
  const data = resolveMockPaymentProcessing(query);

  return (
    <LoginModalProvider>
      <UpgradePlansModalProvider>
        <PaymentProcessingClient initialData={data} />
      </UpgradePlansModalProvider>
    </LoginModalProvider>
  );
}

function resolveMockPaymentProcessing(query: {
  plan?: string;
  cycle?: string;
  amountCents?: string;
  coupon?: string;
  intentId?: string;
  result?: string;
  delayMs?: string;
}): MockPaymentProcessing | null {
  const plan = parsePaymentProcessingPlan(query.plan);
  if (!plan) return null;

  const amountRaw = query.amountCents?.trim();
  const amountCents =
    amountRaw != null && amountRaw.length > 0
      ? Number.parseInt(amountRaw, 10)
      : null;

  return getMockPaymentProcessing({
    plan,
    cycle: parsePaymentProcessingCycle(query.cycle),
    amountCents:
      amountCents != null && Number.isFinite(amountCents) ? amountCents : null,
    coupon: query.coupon,
    intentId: query.intentId,
    result: parsePaymentProcessingResult(query.result),
    delayMs: parsePaymentProcessingDelayMs(query.delayMs),
  });
}
