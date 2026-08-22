"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { CheckoutContent } from "@/components/billing/CheckoutContent";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Footer } from "@/components/layout/footer";
import { SkipLink } from "@/components/layout/skip-link";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { BodyMedium, BodySmall } from "@/components/ui/typography";
import {
  CHECKOUT_BILLING_ROUTE,
  CHECKOUT_COPY,
  CHECKOUT_ROUTE,
} from "@/config/checkout";
import { MANAGE_MEMBERSHIP_ROUTE } from "@/config/manage-membership";
import {
  MOCK_CHECKOUT_PRO,
  type MockCheckout,
} from "@/data/mock-checkout";
import {
  useAuthenticatedHeaderCredits,
  useAuthenticatedHeaderTier,
} from "@/hooks/use-mock-membership-state";
import { useAuth } from "@/hooks/use-auth";
import { useRealBillingApi } from "@/hooks/use-real-billing-api";
import { checkoutAnalytics } from "@/lib/analytics/checkout-events";
import { createBillingCheckout } from "@/lib/billing/client";
import { buildBillingPaymentsOrderSummary } from "@/utils/billing-payments";
import { buildCheckoutBillingHref } from "@/utils/checkout";
import {
  buildPaymentProcessingHref,
  createMockPaymentIntentId,
} from "@/utils/payment-processing";
import { cn } from "@/utils/cn";
import { toast } from "@/components/ui/toast";

export type CheckoutScreenProps = {
  /** Phase-1 mock checkout context from Billing & Payments. */
  data?: MockCheckout;
  onRetry?: () => void;
};

/**
 * SCREEN-013 — Checkout.
 * Final confirmation before mock Pay Now — no Stripe / no entitlements.
 */
export function CheckoutScreen({
  data = MOCK_CHECKOUT_PRO,
  onRetry,
}: CheckoutScreenProps) {
  const router = useRouter();
  const { user } = useAuth();
  const useRealBilling = useRealBillingApi();
  const headerCredits = useAuthenticatedHeaderCredits();
  const headerTier = useAuthenticatedHeaderTier();
  const viewed = React.useRef(false);
  const payIntentStarted = React.useRef(false);
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [termsShowError, setTermsShowError] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);

  const loading = data.state === "loading";
  const isError = data.state === "error";
  const order = buildBillingPaymentsOrderSummary({
    plan: data.plan,
    cycle: data.cycle,
    coupon: data.appliedCoupon,
  });

  React.useEffect(() => {
    if (viewed.current || loading || isError) return;
    viewed.current = true;
    checkoutAnalytics.viewed({
      plan: data.plan,
      cycle: data.cycle,
      state: data.state,
    });
  }, [data.cycle, data.plan, data.state, isError, loading]);

  const goBilling = () => {
    router.push(
      buildCheckoutBillingHref({ plan: data.plan, cycle: data.cycle }),
    );
  };

  const handlePayNow = () => {
    if (processing || payIntentStarted.current) return;
    if (!termsAccepted) {
      setTermsShowError(true);
      return;
    }
    payIntentStarted.current = true;
    setProcessing(true);

    if (useRealBilling) {
      void (async () => {
        try {
          const created = await createBillingCheckout({
            kind: "subscription",
            plan: data.plan === "business" ? "business" : "pro",
            cycle: data.cycle === "yearly" ? "yearly" : "monthly",
          });
          window.location.assign(created.url);
        } catch (error) {
          payIntentStarted.current = false;
          setProcessing(false);
          toast.error(
            error instanceof Error
              ? error.message
              : "Unable to start Stripe checkout",
          );
        }
      })();
      return;
    }

    const intentId = createMockPaymentIntentId();
    router.push(
      buildPaymentProcessingHref({
        plan: data.plan,
        cycle: data.cycle,
        amountCents: order.totalDueCents,
        coupon: data.appliedCoupon?.code ?? null,
        intentId,
        result: data.forcePayError ? "failure" : "success",
      }),
    );
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
          "mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-lg",
          "px-md py-lg lg:px-lg",
        )}
      >
        <Breadcrumb
          items={[
            { label: CHECKOUT_COPY.breadcrumbDashboard, href: "/dashboard" },
            {
              label: CHECKOUT_COPY.breadcrumbMembership,
              href: MANAGE_MEMBERSHIP_ROUTE,
            },
            {
              label: CHECKOUT_COPY.breadcrumbBilling,
              href: CHECKOUT_BILLING_ROUTE,
            },
            {
              label: CHECKOUT_COPY.breadcrumbCurrent,
              href: CHECKOUT_ROUTE,
              current: true,
            },
          ]}
        />

        <header className="flex flex-col gap-sm">
          <h1 className="text-h2 font-bold text-foreground sm:text-h1">
            {CHECKOUT_COPY.title}
          </h1>
          <BodyMedium className="max-w-prose text-muted-foreground">
            {CHECKOUT_COPY.subtitle}
          </BodyMedium>
        </header>

        {isError ? (
          <Alert variant="error" assertive>
            <div className="flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between">
              <div>
                <BodySmall className="font-semibold">
                  {CHECKOUT_COPY.errorHeadline}
                </BodySmall>
                <BodySmall className="mt-sm">
                  {CHECKOUT_COPY.errorDescription}
                </BodySmall>
              </div>
              <div className="flex flex-wrap gap-sm">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    checkoutAnalytics.retryClicked({
                      plan: data.plan,
                      cycle: data.cycle,
                    });
                    onRetry?.();
                  }}
                >
                  {CHECKOUT_COPY.retry}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    checkoutAnalytics.backToBilling({
                      plan: data.plan,
                      cycle: data.cycle,
                    });
                    goBilling();
                  }}
                >
                  {CHECKOUT_COPY.backToBilling}
                </Button>
              </div>
            </div>
          </Alert>
        ) : (
          <CheckoutContent
            data={data}
            loading={loading}
            termsAccepted={termsAccepted}
            onTermsChange={(next) => {
              setTermsAccepted(next);
              if (next) setTermsShowError(false);
            }}
            termsShowError={termsShowError}
            onPayBlocked={() => setTermsShowError(true)}
            processing={processing}
            totalDueCents={order.totalDueCents}
            onPayNow={handlePayNow}
            onBackToBilling={goBilling}
            onChangePlan={() => router.push(MANAGE_MEMBERSHIP_ROUTE)}
          />
        )}
      </main>

      <Footer variant="minimal" />
    </div>
  );
}
