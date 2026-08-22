"use client";

import { UsageWidget } from "@/components/billing/UsageWidget";
import type { ManageMembershipPlan } from "@/config/manage-membership";
import type { UsageWidgetState } from "@/config/usage-widget";
import { canBuyManageMembershipCredits } from "@/utils/manage-membership";

export type UsageCreditsSectionProps = {
  plan: ManageMembershipPlan;
  creditsRemaining: number;
  creditsUsed: number;
  monthlyGrant: number;
  reportsGenerated: number;
  storageUsedPercent?: number | null;
  renewalDate?: string | Date | null;
  loading?: boolean;
  error?: boolean;
  onBuyCredits?: () => void;
  onUpgrade?: () => void;
  onRetry?: () => void;
  className?: string;
};

/**
 * SCREEN-011 — Usage & Credits section.
 * Thin adapter over COMPONENT-034 UsageWidget (replaces CreditsWidget + ad-hoc stats).
 */
export function UsageCreditsSection({
  plan,
  creditsRemaining,
  creditsUsed,
  monthlyGrant,
  reportsGenerated,
  storageUsedPercent = null,
  renewalDate = null,
  loading = false,
  error = false,
  onBuyCredits,
  onUpgrade,
  onRetry,
  className,
}: UsageCreditsSectionProps) {
  const state: UsageWidgetState | undefined = loading
    ? "loading"
    : error
      ? "error"
      : undefined;

  return (
    <UsageWidget
      id="manage-membership-usage"
      state={state}
      tier={plan}
      creditsRemaining={creditsRemaining}
      creditsUsed={creditsUsed}
      monthlyGrant={monthlyGrant}
      reportsGenerated={reportsGenerated}
      storageUsed={storageUsedPercent}
      storageLimit={storageUsedPercent != null ? 100 : null}
      renewalDate={renewalDate}
      showApiCallsPlaceholder={plan === "business"}
      showBuyCredits={canBuyManageMembershipCredits(plan)}
      onBuyCredits={onBuyCredits}
      onUpgrade={onUpgrade}
      onRetry={onRetry}
      className={className}
    />
  );
}
