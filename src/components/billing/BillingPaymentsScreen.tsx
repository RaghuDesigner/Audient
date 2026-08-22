"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { BillingPaymentsContent } from "@/components/billing/BillingPaymentsContent";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Footer } from "@/components/layout/footer";
import { SkipLink } from "@/components/layout/skip-link";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { BodyMedium, BodySmall } from "@/components/ui/typography";
import {
  BILLING_PAYMENTS_COPY,
  BILLING_PAYMENTS_ROUTE,
  type BillingPaymentsCycle,
} from "@/config/billing-payments";
import { MANAGE_MEMBERSHIP_ROUTE } from "@/config/manage-membership";
import {
  getMockBillingDetailsValues,
  MOCK_BILLING_DETAILS_COUNTRIES,
} from "@/data/mock-billing-details-card";
import {
  MOCK_BILLING_PAYMENTS_PRO,
  type MockBillingPayments,
} from "@/data/mock-billing-payments";
import { useAuth } from "@/hooks/use-auth";
import {
  useAuthenticatedHeaderCredits,
  useAuthenticatedHeaderTier,
} from "@/hooks/use-mock-membership-state";
import { billingPaymentsAnalytics } from "@/lib/analytics/billing-payments-events";
import {
  buildBillingPaymentsOrderSummary,
  type BillingPaymentsAppliedCoupon,
} from "@/utils/billing-payments";
import {
  isBillingDetailsValid,
  type BillingDetailsValues,
} from "@/utils/billing-details-card";
import { buildCheckoutHref } from "@/utils/checkout";
import { cn } from "@/utils/cn";

export type BillingPaymentsScreenProps = {
  data?: MockBillingPayments;
  onRetry?: () => void;
};

/** SCREEN-012 — Billing & Payments → Proceed to `/checkout`. Mock only. */
export function BillingPaymentsScreen({
  data = MOCK_BILLING_PAYMENTS_PRO,
  onRetry,
}: BillingPaymentsScreenProps) {
  const router = useRouter();
  const { user } = useAuth();
  const headerCredits = useAuthenticatedHeaderCredits();
  const headerTier = useAuthenticatedHeaderTier();
  const viewed = React.useRef(false);
  const [cycle, setCycle] = React.useState<BillingPaymentsCycle>(data.cycle);
  const [coupon, setCoupon] =
    React.useState<BillingPaymentsAppliedCoupon | null>(data.appliedCoupon);
  const [processing, setProcessing] = React.useState(false);
  const [billingValidateToken, setBillingValidateToken] = React.useState(0);
  const [billingDetails, setBillingDetails] =
    React.useState<BillingDetailsValues>(() =>
      getMockBillingDetailsValues({
        companyName: data.form.businessName,
        billingAddress: data.form.billingAddress,
        country: data.form.country,
        taxId: data.form.taxId,
      }),
    );

  const loading = data.state === "loading";
  const isError = data.state === "error";
  const isEmpty = data.state === "empty" || data.plan == null;
  const plan = data.plan;

  React.useEffect(() => {
    setCycle(data.cycle);
    setCoupon(data.appliedCoupon);
  }, [data.appliedCoupon, data.cycle]);

  React.useEffect(() => {
    if (viewed.current || loading) return;
    viewed.current = true;
    billingPaymentsAnalytics.viewed({
      plan: plan ?? undefined,
      cycle,
      state: data.state,
    });
  }, [cycle, data.state, loading, plan]);

  const handleProceed = () => {
    if (!plan || processing) return;
    if (!isBillingDetailsValid(billingDetails, MOCK_BILLING_DETAILS_COUNTRIES)) {
      setBillingValidateToken((n) => n + 1);
      return;
    }
    const order = buildBillingPaymentsOrderSummary({ plan, cycle, coupon });
    setProcessing(true);
    billingPaymentsAnalytics.proceedToCheckout({
      plan,
      cycle,
      totalDueCents: order.totalDueCents,
      hasCoupon: Boolean(coupon),
    });
    router.push(
      buildCheckoutHref({
        plan,
        cycle,
        coupon: coupon?.code ?? null,
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
            {
              label: BILLING_PAYMENTS_COPY.breadcrumbDashboard,
              href: "/dashboard",
            },
            {
              label: BILLING_PAYMENTS_COPY.breadcrumbMembership,
              href: MANAGE_MEMBERSHIP_ROUTE,
            },
            {
              label: BILLING_PAYMENTS_COPY.breadcrumbCurrent,
              href: BILLING_PAYMENTS_ROUTE,
              current: true,
            },
          ]}
        />

        <header className="flex flex-col gap-sm">
          <h1 className="text-h2 font-bold text-foreground sm:text-h1">
            {BILLING_PAYMENTS_COPY.title}
          </h1>
          <BodyMedium className="max-w-prose text-muted-foreground">
            {BILLING_PAYMENTS_COPY.subtitle}
          </BodyMedium>
        </header>

        {isError ? (
          <Alert variant="error" assertive>
            <div className="flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between">
              <div>
                <BodySmall className="font-semibold">
                  {BILLING_PAYMENTS_COPY.errorHeadline}
                </BodySmall>
                <BodySmall className="mt-sm">
                  {BILLING_PAYMENTS_COPY.errorDescription}
                </BodySmall>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  billingPaymentsAnalytics.retryClicked({
                    plan: plan ?? undefined,
                  });
                  onRetry?.();
                }}
              >
                {BILLING_PAYMENTS_COPY.retry}
              </Button>
            </div>
          </Alert>
        ) : isEmpty ? (
          <Alert variant="info">
            <BodySmall className="font-semibold">
              {BILLING_PAYMENTS_COPY.emptyHeadline}
            </BodySmall>
            <BodySmall className="mt-sm">
              {BILLING_PAYMENTS_COPY.emptyDescription}
            </BodySmall>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="mt-md"
              onClick={() => {
                billingPaymentsAnalytics.emptyCtaClicked();
                router.push(MANAGE_MEMBERSHIP_ROUTE);
              }}
            >
              {BILLING_PAYMENTS_COPY.emptyCta}
            </Button>
          </Alert>
        ) : plan ? (
          <BillingPaymentsContent
            data={{ ...data, plan }}
            loading={loading}
            cycle={cycle}
            onCycleChange={setCycle}
            coupon={coupon}
            onCouponApply={setCoupon}
            onCouponRemove={() => setCoupon(null)}
            billingDetails={billingDetails}
            onBillingDetailsChange={setBillingDetails}
            billingValidateToken={billingValidateToken}
            processing={processing}
            onProceed={handleProceed}
            onReturnMembership={() => {
              billingPaymentsAnalytics.returnToMembership({ plan });
              router.push(MANAGE_MEMBERSHIP_ROUTE);
            }}
            onChangePlan={() => router.push(MANAGE_MEMBERSHIP_ROUTE)}
          />
        ) : null}
      </main>

      <Footer variant="minimal" />
    </div>
  );
}
