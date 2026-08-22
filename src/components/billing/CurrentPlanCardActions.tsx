"use client";

import { Button } from "@/components/ui/button";
import { CURRENT_PLAN_CARD_COPY } from "@/config/current-plan-card";
import type {
  CurrentPlanCardPlan,
  CurrentPlanCardStatus,
} from "@/config/current-plan-card";
import {
  currentPlanPrimaryCtaLabel,
  nextCurrentPlanUpgrade,
  shouldShowCurrentPlanBuyCredits,
  shouldShowCurrentPlanDowngrade,
  shouldShowCurrentPlanManageBilling,
  shouldShowCurrentPlanUpgrade,
} from "@/utils/current-plan-card";
import { currentPlanCardAnalytics } from "@/lib/analytics/current-plan-card-events";
import { cn } from "@/utils/cn";

export type CurrentPlanCardActionsProps = {
  plan: CurrentPlanCardPlan;
  status: CurrentPlanCardStatus;
  variant?: "default" | "compact";
  showBuyCredits?: boolean;
  onUpgrade?: () => void;
  onDowngrade?: () => void;
  onManageBilling?: () => void;
  onBuyCredits?: () => void;
  onReactivate?: () => void;
  className?: string;
};

/**
 * COMPONENT-033 — Current Plan Card action row.
 */
export function CurrentPlanCardActions({
  plan,
  status,
  variant = "default",
  showBuyCredits,
  onUpgrade,
  onDowngrade,
  onManageBilling,
  onBuyCredits,
  onReactivate,
  className,
}: CurrentPlanCardActionsProps) {
  const showUpgrade = shouldShowCurrentPlanUpgrade({ plan, status });
  const showDowngrade = shouldShowCurrentPlanDowngrade({ plan, status });
  const showBilling = shouldShowCurrentPlanManageBilling({
    plan,
    status,
    variant,
  });
  const showBuy = shouldShowCurrentPlanBuyCredits({
    plan,
    status,
    showBuyCredits,
  });
  const primaryLabel = currentPlanPrimaryCtaLabel(plan, status);
  const isLapsed = status === "cancelled" || status === "expired";
  const nextPlan = nextCurrentPlanUpgrade(plan);

  return (
    <div
      className={cn(
        "flex flex-col gap-sm sm:flex-row sm:flex-wrap",
        "[&>button]:w-full sm:[&>button]:w-auto",
        className,
      )}
    >
      {showUpgrade ? (
        <Button
          type="button"
          variant="primary"
          size="sm"
          className="text-primary-foreground"
          onClick={() => {
            currentPlanCardAnalytics.upgradeClicked({
              plan,
              target: nextPlan ?? undefined,
            });
            if (isLapsed) {
              if (onReactivate) {
                onReactivate();
              } else {
                onUpgrade?.();
              }
              return;
            }
            onUpgrade?.();
          }}
        >
          {primaryLabel}
          {nextPlan ? (
            <span className="sr-only">{` (${nextPlan})`}</span>
          ) : null}
        </Button>
      ) : null}

      {showBuy ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            currentPlanCardAnalytics.buyCreditsClicked({ plan });
            onBuyCredits?.();
          }}
        >
          {CURRENT_PLAN_CARD_COPY.buyCredits}
        </Button>
      ) : null}

      {showBilling && !(variant === "compact" && plan === "free") ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            currentPlanCardAnalytics.manageBillingClicked({ plan });
            onManageBilling?.();
          }}
        >
          {CURRENT_PLAN_CARD_COPY.manageBilling}
        </Button>
      ) : null}

      {showDowngrade ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            currentPlanCardAnalytics.downgradeClicked({
              plan,
              target: "free",
            });
            onDowngrade?.();
          }}
        >
          {CURRENT_PLAN_CARD_COPY.downgrade}
        </Button>
      ) : null}
    </div>
  );
}
