"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { ManageMembershipContent } from "@/components/billing/ManageMembershipContent";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Footer } from "@/components/layout/footer";
import { SkipLink } from "@/components/layout/skip-link";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { BodyMedium, BodySmall } from "@/components/ui/typography";
import { toast } from "@/components/ui/toast";
import {
  MANAGE_MEMBERSHIP_COPY,
  MANAGE_MEMBERSHIP_UPGRADE_SOURCES,
} from "@/config/manage-membership";
import { INVOICE_HISTORY_ROUTE } from "@/config/invoice-history";
import { BUY_CREDITS_CARD_COPY } from "@/config/buy-credits-card";
import type { PlanComparisonHighlight } from "@/config/plan-comparison";
import {
  MOCK_MANAGE_MEMBERSHIP_FREE,
  type MockManageMembership,
} from "@/data/mock-manage-membership";
import { useMockMembershipCredits } from "@/hooks/use-mock-membership-state";
import { useAuth } from "@/hooks/use-auth";
import { useRealBillingApi } from "@/hooks/use-real-billing-api";
import { isMockAuthUserId } from "@/lib/account/is-mock-auth-user";
import { buyCreditsCardAnalytics } from "@/lib/analytics/buy-credits-card-events";
import { applyMockCreditTopUp } from "@/lib/auth/mock-membership";
import { createBillingCheckout } from "@/lib/billing/client";
import { manageMembershipAnalytics } from "@/lib/analytics/manage-membership-events";
import { useUpgradePlansModalOptional } from "@/providers/upgrade-plans-modal-provider";
import { findBuyCreditsPack } from "@/utils/buy-credits-card";
import { CANONICAL_BUY_CREDITS_PACKS } from "@/utils/buy-credits-packs";
import {
  manageMembershipPlanToAuth,
  nextManageMembershipUpgrade,
} from "@/utils/manage-membership";
import { cn } from "@/utils/cn";

export type ManageMembershipScreenProps = {
  /** Phase-1 mock membership; swap for API hydrate later. */
  data?: MockManageMembership;
  onRetry?: () => void;
};

/**
 * SCREEN-011 / SCREEN-005 — Manage Membership.
 * Assembles plan / usage / comparison / billing / upgrade — mock only.
 */
export function ManageMembershipScreen({
  data = MOCK_MANAGE_MEMBERSHIP_FREE,
  onRetry,
}: ManageMembershipScreenProps) {
  const router = useRouter();
  const { user } = useAuth();
  const useRealBilling = useRealBillingApi();
  const { credits: liveCredits, refresh: refreshCredits } =
    useMockMembershipCredits();
  const upgradeModal = useUpgradePlansModalOptional();
  const viewed = React.useRef(false);
  const [purchasingCredits, setPurchasingCredits] = React.useState(false);

  const membershipData = React.useMemo((): MockManageMembership => {
    if (!liveCredits) return data;
    return {
      ...data,
      usage: {
        ...data.usage,
        creditsRemaining: liveCredits.remaining,
        creditsUsed: liveCredits.used,
        monthlyGrant: liveCredits.monthlyAllocation,
      },
    };
  }, [data, liveCredits]);

  const loading = membershipData.state === "loading";
  const isError = membershipData.state === "error";
  const nextPlan = nextManageMembershipUpgrade(membershipData.plan);
  const highlightTier: PlanComparisonHighlight =
    nextPlan === "pro" ? "pro" : nextPlan === "business" ? "business" : null;

  React.useEffect(() => {
    if (viewed.current || loading) return;
    viewed.current = true;
    manageMembershipAnalytics.viewed({
      plan: membershipData.plan,
      status: membershipData.status,
      state: membershipData.state,
    });
  }, [membershipData.plan, membershipData.state, membershipData.status, loading]);

  const openUpgrade = React.useCallback(
    (source: string) => {
      const target = nextManageMembershipUpgrade(membershipData.plan);
      manageMembershipAnalytics.upgradeClicked({
        plan: membershipData.plan,
        targetPlan: target ?? undefined,
        source,
      });
      upgradeModal?.openPlanComparison({
        source,
        reason: source,
        currentPlan: membershipData.plan,
        focusTier: target
          ? manageMembershipPlanToAuth(target)
          : "ENTERPRISE",
      });
      if (!upgradeModal) {
        toast.info(MANAGE_MEMBERSHIP_COPY.checkoutSoon);
      }
    },
    [membershipData.plan, upgradeModal],
  );

  const notifySoon = (message: string) => toast.info(message);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SkipLink />
      <DashboardHeader
        credits={membershipData.usage.creditsRemaining}
        displayName={user?.fullName ?? null}
        tier={membershipData.plan}
        onCreditsClick={() =>
          openUpgrade(MANAGE_MEMBERSHIP_UPGRADE_SOURCES.credits)
        }
      />

      <main
        id="main-content"
        className={cn(
          "mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-lg",
          "px-md py-lg lg:px-lg",
        )}
      >
        <header className="flex flex-col gap-sm">
          <h1 className="text-h2 font-bold text-foreground sm:text-h1">
            {MANAGE_MEMBERSHIP_COPY.title}
          </h1>
          <BodyMedium className="max-w-prose text-muted-foreground">
            {MANAGE_MEMBERSHIP_COPY.subtitle}
          </BodyMedium>
        </header>

        {isError ? (
          <Alert variant="error" assertive>
            <div className="flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between">
              <div>
                <BodySmall className="font-semibold">
                  {MANAGE_MEMBERSHIP_COPY.errorHeadline}
                </BodySmall>
                <BodySmall className="mt-sm">
                  {membershipData.statusDetail ??
                    MANAGE_MEMBERSHIP_COPY.errorDescription}
                </BodySmall>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  manageMembershipAnalytics.retryClicked({
                    plan: membershipData.plan,
                  });
                  onRetry?.();
                }}
              >
                {MANAGE_MEMBERSHIP_COPY.retry}
              </Button>
            </div>
          </Alert>
        ) : (
          <ManageMembershipContent
            data={membershipData}
            loading={loading}
            highlightTier={highlightTier}
            upgradeSources={MANAGE_MEMBERSHIP_UPGRADE_SOURCES}
            onUpgrade={openUpgrade}
            onReactivate={() =>
              openUpgrade(MANAGE_MEMBERSHIP_UPGRADE_SOURCES.reactivate)
            }
            onScrollToBilling={() => {
              manageMembershipAnalytics.billingClicked({
                plan: membershipData.plan,
                action: "manage_billing",
              });
              document
                .getElementById("manage-membership-billing")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            onManageBilling={() => {
              manageMembershipAnalytics.billingClicked({
                plan: membershipData.plan,
                action: "manage_billing",
              });
              notifySoon(MANAGE_MEMBERSHIP_COPY.billingPortalSoon);
            }}
            onInvoiceHistory={() => {
              manageMembershipAnalytics.billingClicked({
                plan: membershipData.plan,
                action: "invoice_history",
              });
              router.push(INVOICE_HISTORY_ROUTE);
            }}
            onAddPaymentMethod={() => {
              manageMembershipAnalytics.billingClicked({
                plan: membershipData.plan,
                action: "payment_method",
              });
              notifySoon(MANAGE_MEMBERSHIP_COPY.billingPortalSoon);
            }}
            onBuyCredits={() => {
              document
                .getElementById("manage-membership-buy-credits")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            purchasingCredits={purchasingCredits}
            onPurchaseCredits={(packId) => {
              const pack = findBuyCreditsPack(CANONICAL_BUY_CREDITS_PACKS, packId);
              if (!pack || membershipData.plan === "free") return;

              if (useRealBilling) {
                setPurchasingCredits(true);
                void (async () => {
                  try {
                    const created = await createBillingCheckout({
                      kind: "credit_topup",
                      packId: pack.id,
                    });
                    window.location.assign(created.url);
                  } catch (error) {
                    setPurchasingCredits(false);
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : BUY_CREDITS_CARD_COPY.purchaseError,
                    );
                  }
                })();
                return;
              }

              if (!isMockAuthUserId(user?.id)) {
                toast.info(
                  "Credit purchases will be available when Stripe is configured.",
                );
                return;
              }
              setPurchasingCredits(true);
              window.setTimeout(() => {
                setPurchasingCredits(false);
                const result = applyMockCreditTopUp({
                  creditsToAdd: pack.credits,
                });
                if (!result.ok) {
                  toast.error(BUY_CREDITS_CARD_COPY.purchaseError);
                  return;
                }
                refreshCredits();
                buyCreditsCardAnalytics.purchaseMockSuccess({
                  packId: pack.id,
                  credits: pack.credits,
                  tier: membershipData.plan,
                });
                manageMembershipAnalytics.creditsPurchased({
                  plan: membershipData.plan,
                  packId: pack.id,
                  source: MANAGE_MEMBERSHIP_UPGRADE_SOURCES.credits,
                });
                toast.success(BUY_CREDITS_CARD_COPY.purchaseSuccess);
              }, 700);
            }}
            onContactSales={() => {
              manageMembershipAnalytics.upgradeClicked({
                plan: membershipData.plan,
                source: MANAGE_MEMBERSHIP_UPGRADE_SOURCES.ctaBand,
              });
              notifySoon(MANAGE_MEMBERSHIP_COPY.checkoutSoon);
            }}
            onDowngrade={() => {
              manageMembershipAnalytics.downgradeClicked({
                plan: membershipData.plan,
                targetPlan: "free",
                source: MANAGE_MEMBERSHIP_UPGRADE_SOURCES.ctaBand,
              });
              notifySoon(MANAGE_MEMBERSHIP_COPY.checkoutSoon);
            }}
            onFaqExpand={(faqId) =>
              manageMembershipAnalytics.faqExpanded({
                faqId,
                plan: membershipData.plan,
              })
            }
          />
        )}
      </main>

      <Footer variant="minimal" />
    </div>
  );
}
