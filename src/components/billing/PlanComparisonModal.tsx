"use client";

import * as React from "react";

import { PlanComparisonTable } from "@/components/billing/PlanComparisonTable";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  CONTACT_SALES,
  continueLabelForPlan,
  type PlanComparisonCurrentPlan,
  type PlanComparisonHighlight,
} from "@/config/plan-comparison";
import { planComparisonAnalytics } from "@/lib/analytics/plan-comparison-events";
import { cn } from "@/utils/cn";

export type PlanComparisonModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan?: PlanComparisonCurrentPlan;
  source?: string;
  highlightTier?: PlanComparisonHighlight;
  /** Preferred — Pro or Business → checkout handoff. */
  onUpgradePlan?: (plan: "pro" | "business") => void;
  /** @deprecated Prefer `onUpgradePlan("pro")`. */
  onUpgradePro?: () => void;
  onContactSales?: () => void;
  onContinueFree?: () => void;
  onClose?: () => void;
  className?: string;
};

/**
 * COMPONENT-013 — Plan Comparison Modal.
 * Four columns (Guest · Free · Pro · Business), feature matrix, sticky CTAs.
 */
export function PlanComparisonModal({
  open,
  onOpenChange,
  currentPlan = null,
  source = "unknown",
  highlightTier = null,
  onUpgradePlan,
  onUpgradePro,
  onContactSales,
  onContinueFree,
  onClose,
  className,
}: PlanComparisonModalProps) {
  const openedRef = React.useRef(false);
  const actionCloseRef = React.useRef(false);
  const isProCurrent = currentPlan === "pro";
  const isBusinessCurrent = currentPlan === "business";
  const continueLabel = continueLabelForPlan(currentPlan);

  React.useEffect(() => {
    if (!open) {
      openedRef.current = false;
      return;
    }
    if (openedRef.current) return;
    openedRef.current = true;
    planComparisonAnalytics.opened({
      source,
      currentPlan: currentPlan ?? undefined,
    });
  }, [open, source, currentPlan]);

  const closeAfterAction = () => {
    actionCloseRef.current = true;
    onOpenChange(false);
    onClose?.();
  };

  const handleUpgradePlan = (plan: "pro" | "business") => {
    if (plan === "pro") {
      planComparisonAnalytics.upgradeProClicked({
        source,
        currentPlan: currentPlan ?? undefined,
      });
      onUpgradePro?.();
    }
    onUpgradePlan?.(plan);
    closeAfterAction();
  };

  const handleContactSales = () => {
    planComparisonAnalytics.contactSalesClicked({ source });
    if (onContactSales) {
      onContactSales();
      return;
    }
    window.location.href = CONTACT_SALES.href;
  };

  const handleContinue = () => {
    planComparisonAnalytics.continueFreeClicked({
      source,
      currentPlan: currentPlan ?? undefined,
    });
    onContinueFree?.();
    closeAfterAction();
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          if (!actionCloseRef.current) {
            planComparisonAnalytics.dismissed({ source });
            onClose?.();
          }
          actionCloseRef.current = false;
        }
        onOpenChange(next);
      }}
      size="lg"
      scrollable
      showCloseButton
      title="Compare plans"
      description="Guest, Free, Pro, and Business — prices and credits match Audient pricing."
      className={cn(
        "max-w-[calc(100%-1rem)] border-border bg-background sm:max-w-5xl",
        className,
      )}
      footer={
        <div
          className={cn(
            "sticky bottom-0 z-raised w-full border-t border-border bg-background pt-md",
            "flex flex-col gap-sm",
            "sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
          )}
        >
          <Button type="button" variant="ghost" onClick={handleContinue}>
            {continueLabel}
          </Button>

          <div className="flex flex-col gap-sm sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleContactSales}
            >
              {CONTACT_SALES.label}
            </Button>
            <Button
              type="button"
              variant="primary"
              className="text-primary-foreground"
              disabled={isProCurrent || isBusinessCurrent}
              aria-disabled={isProCurrent || isBusinessCurrent || undefined}
              onClick={() => handleUpgradePlan("pro")}
            >
              {isProCurrent
                ? "Current plan"
                : isBusinessCurrent
                  ? "On Business"
                  : "Upgrade to Pro"}
            </Button>
          </div>
        </div>
      }
    >
      <PlanComparisonTable
        variant="modal"
        currentPlan={currentPlan}
        recommendedPlan={
          highlightTier ?? (isBusinessCurrent ? "business" : "pro")
        }
        showCtas={Boolean(onUpgradePlan)}
        onUpgrade={
          onUpgradePlan
            ? (plan) => {
                handleUpgradePlan(plan);
              }
            : undefined
        }
      />
    </Modal>
  );
}
