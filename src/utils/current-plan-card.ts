/**
 * COMPONENT-033 — Current Plan Card helpers.
 * CTA visibility, labels, pricing from plans.ts — no React / no Stripe.
 */

import {
  CURRENT_PLAN_CARD_BILLING_CYCLE_LABELS,
  CURRENT_PLAN_CARD_COPY,
  CURRENT_PLAN_CARD_PLAN_LABELS,
  CURRENT_PLAN_CARD_STATUS_LABELS,
  type CurrentPlanCardBillingCycle,
  type CurrentPlanCardPlan,
  type CurrentPlanCardStatus,
  type CurrentPlanCardUiState,
} from "@/config/current-plan-card";
import { formatPrice, PLANS, type PlanTier } from "@/config/plans";
import type { AuthPlanTier } from "@/types/auth";

export function currentPlanCardPlanToAuth(
  plan: CurrentPlanCardPlan,
): PlanTier {
  if (plan === "business") return "ENTERPRISE";
  if (plan === "pro") return "PRO";
  return "FREE";
}

export function resolveCurrentPlanCardPlan(
  planTier?: AuthPlanTier | PlanTier | CurrentPlanCardPlan | null,
): CurrentPlanCardPlan {
  if (!planTier) return "free";
  const key = String(planTier).toUpperCase();
  if (key === "ENTERPRISE" || key === "BUSINESS") return "business";
  if (key === "PRO") return "pro";
  if (key === "FREE") return "free";
  if (planTier === "business" || planTier === "pro" || planTier === "free") {
    return planTier;
  }
  return "free";
}

export function currentPlanCardPlanLabel(plan: CurrentPlanCardPlan): string {
  return CURRENT_PLAN_CARD_PLAN_LABELS[plan];
}

export function currentPlanCardStatusLabel(
  status: CurrentPlanCardStatus,
): string {
  return CURRENT_PLAN_CARD_STATUS_LABELS[status];
}

export function currentPlanCardCycleLabel(
  cycle: CurrentPlanCardBillingCycle,
): string {
  return CURRENT_PLAN_CARD_BILLING_CYCLE_LABELS[cycle];
}

/** Next higher plan; null on Business. */
export function nextCurrentPlanUpgrade(
  plan: CurrentPlanCardPlan,
): CurrentPlanCardPlan | null {
  if (plan === "free") return "pro";
  if (plan === "pro") return "business";
  return null;
}

export function currentPlanUpgradeLabel(plan: CurrentPlanCardPlan): string {
  const next = nextCurrentPlanUpgrade(plan);
  if (next === "pro") return CURRENT_PLAN_CARD_COPY.upgradeToPro;
  if (next === "business") return CURRENT_PLAN_CARD_COPY.upgradeToBusiness;
  return CURRENT_PLAN_CARD_COPY.upgrade;
}

export function currentPlanPrimaryCtaLabel(
  plan: CurrentPlanCardPlan,
  status: CurrentPlanCardStatus,
): string {
  if (status === "expired") return CURRENT_PLAN_CARD_COPY.resubscribe;
  if (status === "cancelled") return CURRENT_PLAN_CARD_COPY.reactivate;
  return currentPlanUpgradeLabel(plan);
}

export function currentPlanCardMonthlyCredits(
  plan: CurrentPlanCardPlan,
): number {
  return PLANS[currentPlanCardPlanToAuth(plan)].monthlyCredits;
}

export function currentPlanCardPriceLabel(
  plan: CurrentPlanCardPlan,
  cycle: CurrentPlanCardBillingCycle = "monthly",
): string {
  void cycle; // yearly not confirmed in PRICING.md yet
  const cents = PLANS[currentPlanCardPlanToAuth(plan)].priceMonthlyCents;
  return `${formatPrice(cents)}/mo`;
}

export function canBuyCurrentPlanCredits(plan: CurrentPlanCardPlan): boolean {
  return PLANS[currentPlanCardPlanToAuth(plan)].topUpsEnabled;
}

export function shouldShowCurrentPlanUpgrade(input: {
  plan: CurrentPlanCardPlan;
  status: CurrentPlanCardStatus;
}): boolean {
  if (input.status === "expired" || input.status === "cancelled") return true;
  return nextCurrentPlanUpgrade(input.plan) != null;
}

export function shouldShowCurrentPlanDowngrade(input: {
  plan: CurrentPlanCardPlan;
  status: CurrentPlanCardStatus;
}): boolean {
  if (input.status !== "active" && input.status !== "trial") return false;
  return input.plan === "pro" || input.plan === "business";
}

export function shouldShowCurrentPlanManageBilling(input: {
  plan: CurrentPlanCardPlan;
  status: CurrentPlanCardStatus;
  variant?: "default" | "compact";
}): boolean {
  void input.variant;
  // Free may hide Manage Billing in compact; default shows for all paid + Free optional.
  if (input.status === "expired") return true;
  return true;
}

export function shouldShowCurrentPlanBuyCredits(input: {
  plan: CurrentPlanCardPlan;
  status: CurrentPlanCardStatus;
  showBuyCredits?: boolean;
}): boolean {
  if (input.showBuyCredits != null) return input.showBuyCredits;
  if (input.status === "expired" || input.status === "cancelled") return false;
  return canBuyCurrentPlanCredits(input.plan);
}

/** Map UI state → default subscription status when status omitted. */
export function statusFromCurrentPlanUiState(
  state: CurrentPlanCardUiState,
): CurrentPlanCardStatus {
  if (state === "expired") return "expired";
  if (state === "cancelled") return "cancelled";
  return "active";
}

/** Badge tone for status text badge (variant name for ui/Badge). */
export function currentPlanStatusBadgeVariant(
  status: CurrentPlanCardStatus,
): "success" | "info" | "warning" | "error" | "neutral" {
  switch (status) {
    case "active":
      return "success";
    case "trial":
      return "info";
    case "paused":
      return "warning";
    case "cancelled":
      return "neutral";
    case "expired":
      return "error";
  }
}

export function currentPlanStatusDetail(
  status: CurrentPlanCardStatus,
  custom?: string | null,
): string | null {
  if (custom) return custom;
  if (status === "cancelled") return CURRENT_PLAN_CARD_COPY.cancelledDetail;
  if (status === "expired") return CURRENT_PLAN_CARD_COPY.expiredDetail;
  if (status === "trial") return CURRENT_PLAN_CARD_COPY.trialDetail;
  return null;
}

export function formatCurrentPlanStorage(
  storageUsed: string | number | null | undefined,
): string | null {
  if (storageUsed == null) return null;
  if (typeof storageUsed === "string") return storageUsed;
  return `${Math.min(100, Math.max(0, Math.round(storageUsed)))}%`;
}
