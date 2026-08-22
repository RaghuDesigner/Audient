"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { PaymentSuccessContent } from "@/components/billing/PaymentSuccessContent";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SkipLink } from "@/components/layout/skip-link";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { BodySmall } from "@/components/ui/typography";
import {
  PAYMENT_SUCCESS_COPY,
  type PaymentSuccessState,
} from "@/config/payment-success";
import {
  MOCK_PAYMENT_SUCCESS_PRO,
  type MockPaymentSuccess,
} from "@/data/mock-payment-success";
import { useMockMembershipCredits } from "@/hooks/use-mock-membership-state";
import { useHeaderPlanTier } from "@/hooks/use-app-state";
import { useAuth } from "@/hooks/use-auth";
import { paymentSuccessAnalytics } from "@/lib/analytics/payment-success-events";
import { applyMockPurchase } from "@/lib/auth/mock-membership";
import { useRealBillingApi } from "@/hooks/use-real-billing-api";
import { useAccountOptional } from "@/providers/account-provider";
import {
  paymentSuccessDashboardHref,
  paymentSuccessInvoiceHref,
  paymentSuccessNewAuditHref,
} from "@/utils/payment-success";
import { cn } from "@/utils/cn";

export type PaymentSuccessScreenProps = {
  data?: MockPaymentSuccess;
  /** Skip mock membership write (storybook / forced error fixtures / Stripe). */
  skipMembershipApply?: boolean;
  onRetry?: () => void;
};

/**
 * SCREEN-015 — Payment Success.
 * Confirms mock payment + applies mock plan tier — no Stripe / no real entitlements.
 */
export function PaymentSuccessScreen({
  data = MOCK_PAYMENT_SUCCESS_PRO,
  skipMembershipApply = false,
  onRetry,
}: PaymentSuccessScreenProps) {
  const router = useRouter();
  const { user, refreshSession } = useAuth();
  const useRealBilling = useRealBillingApi();
  const accountCtx = useAccountOptional();
  const { credits: liveCredits, refresh: refreshCredits } =
    useMockMembershipCredits();
  const accountHeaderTier = useHeaderPlanTier();
  const viewed = React.useRef(false);
  const appliedKey = React.useRef<string | null>(null);
  const [uiState, setUiState] = React.useState<PaymentSuccessState>(() =>
    data.state === "error" ? "error" : "loading",
  );

  const vm = data.viewModel;
  const runKey = `${vm.plan}:${vm.cycle}:${vm.intentId ?? "none"}`;
  const headerCredits =
    liveCredits?.remaining ?? data.viewModel.totalCreditsAvailable;
  const headerTier = user
    ? accountHeaderTier
    : vm.plan === "business"
      ? "business"
      : vm.plan === "pro"
        ? "pro"
        : "free";

  const trackBase = () => ({
    plan: vm.plan,
    billingCycle: vm.cycle,
    amountCents: vm.amountPaidCents,
    creditsAdded: vm.creditsAdded,
    intentId: vm.intentId ?? undefined,
    paymentReference: vm.paymentReference,
  });

  const activateMembership = React.useCallback(async (): Promise<boolean> => {
    if (skipMembershipApply || appliedKey.current === runKey) return true;

    // Stripe success redirect is presentation only — entitlements come from webhooks.
    if (useRealBilling) {
      appliedKey.current = runKey;
      await refreshSession();
      accountCtx?.refresh();
      refreshCredits();
      paymentSuccessAnalytics.subscriptionActivated(trackBase());
      return true;
    }

    const result = applyMockPurchase({
      plan: vm.plan,
      cycle: vm.cycle,
      intentId: vm.intentId,
      paymentReference: vm.paymentReference,
    });

    if (!result.ok) {
      paymentSuccessAnalytics.errorViewed({
        plan: vm.plan,
        billingCycle: vm.cycle,
        intentId: vm.intentId ?? undefined,
        reason: result.reason,
      });
      return false;
    }

    appliedKey.current = runKey;
    await refreshSession();
    refreshCredits();
    if (result.applied) {
      paymentSuccessAnalytics.subscriptionActivated(trackBase());
    }
    return true;
  // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by runKey
  }, [
    accountCtx,
    refreshCredits,
    refreshSession,
    runKey,
    skipMembershipApply,
    useRealBilling,
    vm.cycle,
    vm.intentId,
    vm.plan,
    vm.paymentReference,
  ]);

  React.useEffect(() => {
    if (data.state === "error") {
      setUiState("error");
      paymentSuccessAnalytics.errorViewed({
        plan: vm.plan,
        billingCycle: vm.cycle,
        intentId: vm.intentId ?? undefined,
        reason: "forced_error",
      });
      return;
    }
    if (data.state === "loading") {
      setUiState("loading");
      return;
    }

    let cancelled = false;
    setUiState("loading");
    void activateMembership().then((ok) => {
      if (cancelled) return;
      if (!ok) {
        setUiState("error");
        return;
      }
      setUiState("success");
      if (!viewed.current) {
        viewed.current = true;
        paymentSuccessAnalytics.viewed(trackBase());
      }
    });
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once per runKey
  }, [activateMembership, data.state, runKey]);

  const handleRetry = () => {
    appliedKey.current = null;
    viewed.current = false;
    paymentSuccessAnalytics.retryClicked({
      plan: vm.plan,
      billingCycle: vm.cycle,
      intentId: vm.intentId ?? undefined,
    });
    onRetry?.();
    if (data.state === "error") return;
    setUiState("loading");
    void activateMembership().then((ok) => {
      setUiState(ok ? "success" : "error");
      if (ok && !viewed.current) {
        viewed.current = true;
        paymentSuccessAnalytics.viewed(trackBase());
      }
    });
  };

  const goDashboard = () => {
    paymentSuccessAnalytics.goToDashboard({
      plan: vm.plan,
      billingCycle: vm.cycle,
      intentId: vm.intentId ?? undefined,
    });
    router.push(paymentSuccessDashboardHref());
  };

  const goInvoice = () => {
    paymentSuccessAnalytics.viewInvoice({
      plan: vm.plan,
      billingCycle: vm.cycle,
      intentId: vm.intentId ?? undefined,
    });
    router.push(paymentSuccessInvoiceHref());
  };

  const goNewAudit = () => {
    paymentSuccessAnalytics.startNewAudit({
      plan: vm.plan,
      billingCycle: vm.cycle,
      intentId: vm.intentId ?? undefined,
    });
    router.push(paymentSuccessNewAuditHref());
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SkipLink />
      <DashboardHeader
        credits={headerCredits}
        displayName={user?.fullName ?? null}
        tier={headerTier}
      />
      <main
        id="main-content"
        className={cn(
          "mx-auto flex w-full max-w-3xl flex-1 flex-col px-md py-lg lg:px-lg",
        )}
        aria-busy={uiState === "loading" || undefined}
        aria-labelledby={
          uiState === "success" ? "payment-success-heading" : undefined
        }
      >
        {uiState === "loading" ? (
          <div
            className="flex flex-1 flex-col items-center justify-center gap-md py-2xl"
            role="status"
            aria-live="polite"
          >
            <Spinner size="lg" label={PAYMENT_SUCCESS_COPY.loadingLabel} />
            <BodySmall className="text-muted-foreground">
              {PAYMENT_SUCCESS_COPY.loadingLabel}
            </BodySmall>
          </div>
        ) : null}
        {uiState === "error" ? (
          <Alert variant="error" assertive className="mx-auto w-full max-w-lg">
            <BodySmall className="font-semibold">
              {PAYMENT_SUCCESS_COPY.errorHeadline}
            </BodySmall>
            <BodySmall className="mt-sm">
              {PAYMENT_SUCCESS_COPY.errorDescription}
            </BodySmall>
            <div className="mt-md flex flex-wrap gap-sm">
              <Button type="button" variant="primary" size="sm" onClick={handleRetry}>
                {PAYMENT_SUCCESS_COPY.retry}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={goDashboard}>
                {PAYMENT_SUCCESS_COPY.goToDashboard}
              </Button>
            </div>
          </Alert>
        ) : null}
        {uiState === "success" ? (
          <PaymentSuccessContent
            data={data}
            onGoDashboard={goDashboard}
            onViewInvoice={goInvoice}
            onStartNewAudit={goNewAudit}
          />
        ) : null}
      </main>
    </div>
  );
}
