"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { CheckoutSummary } from "@/components/billing/CheckoutSummary";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SkipLink } from "@/components/layout/skip-link";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { BodyMedium, BodySmall, Caption, H2 } from "@/components/ui/typography";
import {
  CHECKOUT_ROUTE,
} from "@/config/checkout";
import {
  PAYMENT_PROCESSING_COPY,
  type PaymentProcessingState,
} from "@/config/payment-processing";
import {
  MOCK_PAYMENT_PROCESSING_PRO,
  type MockPaymentProcessing,
} from "@/data/mock-payment-processing";
import { useAuth } from "@/hooks/use-auth";
import {
  useAuthenticatedHeaderCredits,
  useAuthenticatedHeaderTier,
} from "@/hooks/use-mock-membership-state";
import { paymentProcessingAnalytics } from "@/lib/analytics/payment-processing-events";
import {
  buildPaymentFailureHref,
  buildPaymentSuccessHref,
  formatPaymentProcessingAmount,
  paymentProcessingStageLabel,
} from "@/utils/payment-processing";
import { buildCheckoutHref } from "@/utils/checkout";
import { cn } from "@/utils/cn";

export type PaymentProcessingScreenProps = {
  data?: MockPaymentProcessing;
  onRetry?: (next: MockPaymentProcessing) => void;
};

/**
 * SCREEN-014 — Payment Processing.
 * Mock wait surface after Pay Now — no Stripe / no second charge intent.
 */
export function PaymentProcessingScreen({
  data = MOCK_PAYMENT_PROCESSING_PRO,
  onRetry,
}: PaymentProcessingScreenProps) {
  const router = useRouter();
  const { user } = useAuth();
  const headerCredits = useAuthenticatedHeaderCredits();
  const headerTier = useAuthenticatedHeaderTier();
  const [uiState, setUiState] =
    React.useState<PaymentProcessingState>("processing");
  const [stage, setStage] = React.useState<string>(
    PAYMENT_PROCESSING_COPY.statusProcessing,
  );
  const [runId, setRunId] = React.useState(0);
  const startedIntent = React.useRef<string | null>(null);
  const settled = React.useRef(false);

  const amountLabel = formatPaymentProcessingAmount(data.amountCents);
  const analyticsBase = {
    plan: data.plan,
    billingCycle: data.cycle,
    amountCents: data.amountCents,
    intentId: data.intentId,
  };

  React.useEffect(() => {
    const runKey = `${data.intentId}:${runId}`;
    if (startedIntent.current === runKey) return;
    startedIntent.current = runKey;
    settled.current = false;
    setUiState("processing");
    setStage(PAYMENT_PROCESSING_COPY.statusProcessing);

    paymentProcessingAnalytics.viewed(analyticsBase);
    paymentProcessingAnalytics.started(analyticsBase);

    const start = Date.now();
    const stageTimer = window.setInterval(() => {
      setStage(paymentProcessingStageLabel(Date.now() - start, data.delayMs));
    }, 400);

    const doneTimer = window.setTimeout(() => {
      if (settled.current) return;
      settled.current = true;
      window.clearInterval(stageTimer);

      if (data.result === "timeout") {
        setUiState("timeout");
        paymentProcessingAnalytics.timeout(analyticsBase);
        return;
      }

      if (data.result === "failure") {
        paymentProcessingAnalytics.failed(analyticsBase);
        router.replace(
          buildPaymentFailureHref({
            plan: data.plan,
            cycle: data.cycle,
            intentId: data.intentId,
            amountCents: data.amountCents,
            coupon: data.appliedCoupon?.code ?? null,
            reason: "declined",
          }),
        );
        return;
      }

      paymentProcessingAnalytics.completed(analyticsBase);
      router.replace(
        buildPaymentSuccessHref({
          plan: data.plan,
          cycle: data.cycle,
          intentId: data.intentId,
          amountCents: data.amountCents,
          coupon: data.appliedCoupon?.code ?? null,
        }),
      );
    }, data.delayMs);

    return () => {
      window.clearInterval(stageTimer);
      window.clearTimeout(doneTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- single intent run per runId
  }, [data.intentId, data.delayMs, data.result, runId]);

  const handleRetry = () => {
    if (uiState !== "timeout") return;
    settled.current = false;
    onRetry?.(data);
    setRunId((n) => n + 1);
  };

  const goCheckout = () => {
    router.push(
      buildCheckoutHref({ plan: data.plan, cycle: data.cycle }) ||
        CHECKOUT_ROUTE,
    );
  };

  const isProcessing = uiState === "processing";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SkipLink />
      <DashboardHeader
        credits={headerCredits ?? 0}
        displayName={user?.fullName ?? null}
        tier={headerTier}
        profileNavigation={{
          beforeAction: () => !isProcessing,
        }}
      />

      <main
        id="main-content"
        className={cn(
          "mx-auto flex w-full max-w-lg flex-1 flex-col items-center",
          "justify-center gap-lg px-md py-lg lg:px-lg",
        )}
        aria-busy={isProcessing || undefined}
      >
        {uiState === "timeout" ? (
          <Alert variant="error" assertive className="w-full">
            <BodySmall className="font-semibold">
              {PAYMENT_PROCESSING_COPY.timeoutHeadline}
            </BodySmall>
            <BodySmall className="mt-sm">
              {PAYMENT_PROCESSING_COPY.timeoutDescription}
            </BodySmall>
            <div className="mt-md flex flex-wrap gap-sm">
              <Button type="button" variant="primary" size="sm" onClick={handleRetry}>
                {PAYMENT_PROCESSING_COPY.retry}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={goCheckout}>
                {PAYMENT_PROCESSING_COPY.backToCheckout}
              </Button>
            </div>
          </Alert>
        ) : (
          <div className="flex w-full flex-col items-center gap-lg text-center">
            <Spinner
              size="lg"
              label={PAYMENT_PROCESSING_COPY.primaryMessage}
              className="size-12"
            />
            <div className="flex flex-col gap-sm">
              <H2 className="text-foreground">
                {PAYMENT_PROCESSING_COPY.primaryMessage}
              </H2>
              <BodyMedium className="text-muted-foreground">
                {PAYMENT_PROCESSING_COPY.supportingMessage}
              </BodyMedium>
              <Caption
                className="text-muted-foreground"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                {stage}
              </Caption>
            </div>
          </div>
        )}

        <div className="w-full">
          <CheckoutSummary
            state="default"
            planName={data.plan}
            billingCycle={data.cycle}
            priceLabel={amountLabel}
            currency={data.currency}
            creditsIncluded={data.creditsIncluded}
            features={null}
            variant="compact"
            context="checkout"
          />
        </div>

        <div className="flex w-full items-start gap-sm rounded-md border border-border bg-surface p-md text-left">
          <ShieldCheck
            className="mt-sm size-5 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <BodySmall className="text-muted-foreground">
            {PAYMENT_PROCESSING_COPY.securityMessage}
          </BodySmall>
        </div>
      </main>
    </div>
  );
}
