"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { PaymentFailureContent } from "@/components/billing/PaymentFailureContent";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SkipLink } from "@/components/layout/skip-link";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { BodySmall } from "@/components/ui/typography";
import {
  PAYMENT_FAILURE_COPY,
  type PaymentFailureState,
} from "@/config/payment-failure";
import {
  MOCK_PAYMENT_FAILURE_DECLINED,
  type MockPaymentFailure,
} from "@/data/mock-payment-failure";
import { useAuth } from "@/hooks/use-auth";
import {
  useAuthenticatedHeaderCredits,
  useAuthenticatedHeaderTier,
} from "@/hooks/use-mock-membership-state";
import { paymentFailureAnalytics } from "@/lib/analytics/payment-failure-events";
import {
  buildPaymentFailureChangeMethodHref,
  buildPaymentFailureTryAgainHref,
  paymentFailureBillingHref,
} from "@/utils/payment-failure";
import { createMockPaymentIntentId } from "@/utils/payment-processing";
import { cn } from "@/utils/cn";

export type PaymentFailureScreenProps = {
  data?: MockPaymentFailure;
  onRetryLoad?: () => void;
};

/**
 * SCREEN-016 — Payment Failure.
 * Friendly decline + safe recovery — no Stripe / no entitlements / no auto-retry charge.
 */
export function PaymentFailureScreen({
  data = MOCK_PAYMENT_FAILURE_DECLINED,
  onRetryLoad,
}: PaymentFailureScreenProps) {
  const router = useRouter();
  const { user } = useAuth();
  const headerCredits = useAuthenticatedHeaderCredits();
  const headerTier = useAuthenticatedHeaderTier();
  const viewed = React.useRef(false);
  const retryStarted = React.useRef(false);
  const [uiState, setUiState] = React.useState<PaymentFailureState>(() =>
    data.state === "error"
      ? "error"
      : data.state === "loading"
        ? "loading"
        : "loading",
  );

  const vm = data.viewModel;

  React.useEffect(() => {
    if (data.state === "error") {
      setUiState("error");
      paymentFailureAnalytics.errorViewed({
        plan: vm.plan,
        billingCycle: vm.cycle,
        reason: vm.reason,
        intentId: vm.intentId ?? undefined,
      });
      return;
    }

    if (data.state === "loading") {
      setUiState("loading");
      return;
    }

    setUiState("failure");
    if (!viewed.current) {
      viewed.current = true;
      paymentFailureAnalytics.viewed({
        plan: vm.plan,
        billingCycle: vm.cycle,
        reason: vm.reason,
        amountCents: vm.amountCents,
        intentId: vm.intentId ?? undefined,
      });
    }
  }, [data.state, vm.amountCents, vm.cycle, vm.intentId, vm.plan, vm.reason]);

  const handleTryAgain = () => {
    if (retryStarted.current || uiState === "retrying") return;
    retryStarted.current = true;
    setUiState("retrying");

    paymentFailureAnalytics.retryClicked({
      plan: vm.plan,
      billingCycle: vm.cycle,
      reason: vm.reason,
      intentId: vm.intentId ?? undefined,
    });

    const newIntentId = createMockPaymentIntentId();
    paymentFailureAnalytics.retryStarted({
      plan: vm.plan,
      billingCycle: vm.cycle,
      reason: vm.reason,
      newIntentId,
      previousIntentId: vm.intentId ?? undefined,
    });

    router.push(
      buildPaymentFailureTryAgainHref({
        plan: vm.plan,
        cycle: vm.cycle,
        failedIntentId: vm.intentId,
        coupon: vm.appliedCoupon?.code ?? null,
      }),
    );
  };

  const handleChangeMethod = () => {
    if (uiState === "retrying") return;
    paymentFailureAnalytics.changePaymentMethod({
      plan: vm.plan,
      billingCycle: vm.cycle,
      reason: vm.reason,
      intentId: vm.intentId ?? undefined,
    });
    router.push(
      buildPaymentFailureChangeMethodHref({
        plan: vm.plan,
        cycle: vm.cycle,
      }),
    );
  };

  const handleBackToBilling = () => {
    if (uiState === "retrying") return;
    paymentFailureAnalytics.backToBilling({
      plan: vm.plan,
      billingCycle: vm.cycle,
      reason: vm.reason,
      intentId: vm.intentId ?? undefined,
    });
    router.push(paymentFailureBillingHref());
  };

  const handleRetryLoad = () => {
    retryStarted.current = false;
    viewed.current = false;
    onRetryLoad?.();
    if (data.state === "error") return;
    setUiState("failure");
    paymentFailureAnalytics.viewed({
      plan: vm.plan,
      billingCycle: vm.cycle,
      reason: vm.reason,
      amountCents: vm.amountCents,
      intentId: vm.intentId ?? undefined,
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SkipLink />
      <DashboardHeader
        credits={headerCredits ?? 0}
        displayName={user?.fullName ?? null}
        tier={headerTier}
      />
      <main
        id="main-content"
        className={cn(
          "mx-auto flex w-full max-w-3xl flex-1 flex-col px-md py-lg lg:px-lg",
        )}
        aria-busy={uiState === "loading" || uiState === "retrying" || undefined}
        aria-labelledby={
          uiState === "failure" || uiState === "retrying"
            ? "payment-failure-heading"
            : undefined
        }
      >
        {uiState === "loading" ? (
          <div
            className="flex flex-1 flex-col items-center justify-center gap-md py-2xl"
            role="status"
            aria-live="polite"
          >
            <Spinner size="lg" label={PAYMENT_FAILURE_COPY.loadingLabel} />
            <BodySmall className="text-muted-foreground">
              {PAYMENT_FAILURE_COPY.loadingLabel}
            </BodySmall>
          </div>
        ) : null}

        {uiState === "error" ? (
          <Alert variant="error" assertive className="mx-auto w-full max-w-lg">
            <BodySmall className="font-semibold">
              {PAYMENT_FAILURE_COPY.errorHeadline}
            </BodySmall>
            <BodySmall className="mt-sm">
              {PAYMENT_FAILURE_COPY.errorDescription}
            </BodySmall>
            <div className="mt-md flex flex-wrap gap-sm">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleRetryLoad}
              >
                {PAYMENT_FAILURE_COPY.retry}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBackToBilling}
              >
                {PAYMENT_FAILURE_COPY.backToBilling}
              </Button>
            </div>
          </Alert>
        ) : null}

        {uiState === "failure" || uiState === "retrying" ? (
          <PaymentFailureContent
            data={data}
            retrying={uiState === "retrying"}
            onTryAgain={handleTryAgain}
            onChangePaymentMethod={handleChangeMethod}
            onBackToBilling={handleBackToBilling}
          />
        ) : null}
      </main>
    </div>
  );
}
