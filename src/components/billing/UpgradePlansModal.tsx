"use client";

import { PlanComparisonModal } from "@/components/billing/PlanComparisonModal";
import {
  mapFocusTierToHighlight,
  type PlanComparisonCurrentPlan,
} from "@/config/plan-comparison";
import type { PlanTier } from "@/config/plans";

export type UpgradePlansModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Gate reason / analytics source (Locked Card, Banner, URL, Header). */
  reason?: string;
  source?: string;
  /** Emphasize Pro or Business column. */
  focusTier?: PlanTier;
  highlightTier?: "pro" | "business" | null;
  currentPlan?: PlanComparisonCurrentPlan;
  /** Optional CTA after selecting Pro (Phase-1: close only). */
  onSelectPlan?: (tier: PlanTier) => void;
  onUpgradePro?: () => void;
  onContactSales?: () => void;
  onContinueFree?: () => void;
};

/**
 * Compatibility entry for gated flows — renders COMPONENT-013 Plan Comparison Modal.
 * Prefer `PlanComparisonModal` for new call sites.
 */
export function UpgradePlansModal({
  open,
  onOpenChange,
  reason,
  source,
  focusTier,
  highlightTier,
  currentPlan = null,
  onSelectPlan,
  onUpgradePro,
  onContactSales,
  onContinueFree,
}: UpgradePlansModalProps) {
  return (
    <PlanComparisonModal
      open={open}
      onOpenChange={onOpenChange}
      source={source ?? reason ?? "upgrade_modal"}
      currentPlan={currentPlan}
      highlightTier={
        highlightTier ?? mapFocusTierToHighlight(focusTier ?? null)
      }
      onUpgradePlan={(plan) => {
        if (plan === "pro") {
          onUpgradePro?.();
        }
        onSelectPlan?.(plan === "business" ? "ENTERPRISE" : "PRO");
      }}
      onContactSales={onContactSales}
      onContinueFree={onContinueFree}
    />
  );
}
