"use client";

import { BillingSummarySection } from "@/components/billing/BillingSummarySection";
import { BuyCreditsCard } from "@/components/billing/BuyCreditsCard";
import { CurrentPlanCard } from "@/components/billing/CurrentPlanCard";
import { PlanComparisonTable } from "@/components/billing/PlanComparisonTable";
import { UpgradeCtaBand } from "@/components/billing/UpgradeCtaBand";
import { UsageCreditsSection } from "@/components/billing/UsageCreditsSection";
import type { CurrentPlanCardStatus, CurrentPlanCardUiState } from "@/config/current-plan-card";
import { MANAGE_MEMBERSHIP_COPY } from "@/config/manage-membership";
import type { ManageMembershipStatus } from "@/config/manage-membership";
import type { PlanComparisonHighlight } from "@/config/plan-comparison";
import { CANONICAL_BUY_CREDITS_PACKS } from "@/utils/buy-credits-packs";
import type { MockManageMembership } from "@/data/mock-manage-membership";
import { canBuyCreditsCard } from "@/utils/buy-credits-card";

export type ManageMembershipContentProps = {
  data: MockManageMembership;
  loading: boolean;
  highlightTier: PlanComparisonHighlight;
  onUpgrade: (source: string) => void;
  onReactivate: () => void;
  onScrollToBilling: () => void;
  onManageBilling: () => void;
  onInvoiceHistory: () => void;
  onAddPaymentMethod: () => void;
  onBuyCredits: () => void;
  onPurchaseCredits?: (packId: string) => void;
  purchasingCredits?: boolean;
  onContactSales: () => void;
  onDowngrade: () => void;
  onFaqExpand: (faqId: string) => void;
  upgradeSources: {
    currentPlan: string;
    credits: string;
    ctaBand: string;
    reactivate: string;
  };
};

/**
 * SCREEN-011 body sections — plan, usage, comparison, billing, upgrade/FAQ.
 */
export function ManageMembershipContent({
  data,
  loading,
  highlightTier,
  onUpgrade,
  onReactivate,
  onScrollToBilling,
  onManageBilling,
  onInvoiceHistory,
  onAddPaymentMethod,
  onBuyCredits,
  onPurchaseCredits,
  purchasingCredits = false,
  onContactSales,
  onDowngrade,
  onFaqExpand,
  upgradeSources,
}: ManageMembershipContentProps) {
  const cardState = resolveCurrentPlanUiState(loading, data);
  const cardStatus = mapManageStatusToCurrentPlan(data.status);
  const showBuyCredits = canBuyCreditsCard(data.plan);

  return (
    <>
      <CurrentPlanCard
        state={cardState}
        plan={data.plan}
        status={cardStatus}
        billingCycle={data.billingCycle}
        renewalDate={data.renewalDate}
        periodEndDate={data.periodEndDate}
        creditsRemaining={data.usage.creditsRemaining}
        reportsUsed={data.usage.reportsGenerated}
        storageUsed={data.usage.storageUsedPercent}
        currentPrice={data.billing.subscriptionCostLabel}
        statusDetail={data.statusDetail}
        onUpgrade={() => onUpgrade(upgradeSources.currentPlan)}
        onReactivate={onReactivate}
        onDowngrade={onDowngrade}
        onManageBilling={onScrollToBilling}
        onBuyCredits={showBuyCredits ? onBuyCredits : undefined}
      />

      <UsageCreditsSection
        plan={data.plan}
        creditsRemaining={data.usage.creditsRemaining}
        creditsUsed={data.usage.creditsUsed}
        monthlyGrant={data.usage.monthlyGrant}
        reportsGenerated={data.usage.reportsGenerated}
        storageUsedPercent={data.usage.storageUsedPercent}
        renewalDate={data.renewalDate}
        loading={loading}
        onBuyCredits={showBuyCredits ? onBuyCredits : undefined}
        onUpgrade={() => onUpgrade(upgradeSources.credits)}
      />

      {showBuyCredits ? (
        <BuyCreditsCard
          id="manage-membership-buy-credits"
          state={loading ? "loading" : "available"}
          tier={data.plan === "business" ? "business" : "pro"}
          creditsRemaining={data.usage.creditsRemaining}
          packs={CANONICAL_BUY_CREDITS_PACKS}
          purchasing={purchasingCredits}
          onBuy={onPurchaseCredits}
        />
      ) : null}

      <section aria-labelledby="manage-membership-compare">
        <h2
          id="manage-membership-compare"
          className="mb-md text-body-sm font-bold text-foreground sm:text-body"
        >
          {MANAGE_MEMBERSHIP_COPY.planComparison}
        </h2>
        {loading ? (
          <PlanComparisonTable
            variant="page"
            state="loading"
            currentPlan={data.plan}
          />
        ) : (
          <PlanComparisonTable
            variant="page"
            currentPlan={data.plan}
            recommendedPlan={highlightTier}
            onUpgrade={() => onUpgrade(upgradeSources.currentPlan)}
          />
        )}
      </section>

      <BillingSummarySection
        plan={data.plan}
        billingCycle={data.billingCycle}
        status={data.status}
        paymentMethodLabel={data.billing.paymentMethodLabel}
        nextBillingDate={data.billing.nextBillingDate}
        subscriptionCostLabel={data.billing.subscriptionCostLabel}
        hasInvoices={data.billing.hasInvoices}
        loading={loading}
        error={data.state === "error"}
        onManageBilling={onManageBilling}
        onInvoiceHistory={onInvoiceHistory}
        onAddPaymentMethod={onAddPaymentMethod}
      />

      <UpgradeCtaBand
        plan={data.plan}
        status={data.status}
        loading={loading}
        onUpgrade={() => onUpgrade(upgradeSources.ctaBand)}
        onContactSales={onContactSales}
        onDowngrade={onDowngrade}
        onReactivate={onReactivate}
        onFaqExpand={onFaqExpand}
      />
    </>
  );
}

function resolveCurrentPlanUiState(
  loading: boolean,
  data: MockManageMembership,
): CurrentPlanCardUiState {
  if (loading || data.state === "loading") return "loading";
  if (data.state === "error") return "error";
  if (data.state === "cancelled" || data.status === "cancelled") {
    return "cancelled";
  }
  if (data.state === "expired" || data.status === "expired") return "expired";
  return "active";
}

function mapManageStatusToCurrentPlan(
  status: ManageMembershipStatus,
): CurrentPlanCardStatus {
  if (status === "past_due") return "expired";
  if (status === "cancelled") return "cancelled";
  if (status === "expired") return "expired";
  return "active";
}
