/**
 * SCREEN-011 / SCREEN-005 — Manage Membership helpers.
 * Plan mapping, CTAs, formatting — no React / no Stripe.
 */

import { formatPrice, PLANS, type PlanTier } from "@/config/plans";
import {
  MANAGE_MEMBERSHIP_BILLING_CYCLE_LABELS,
  MANAGE_MEMBERSHIP_COPY,
  MANAGE_MEMBERSHIP_PLAN_LABELS,
  MANAGE_MEMBERSHIP_STATUS_LABELS,
  type ManageMembershipBillingCycle,
  type ManageMembershipPlan,
  type ManageMembershipStatus,
} from "@/config/manage-membership";
import type { AuthPlanTier } from "@/types/auth";

export function shouldAccessManageMembership(isGuest: boolean): boolean {
  return !isGuest;
}

/** Map auth / report tiers → Manage Membership plan. */
export function resolveManageMembershipPlan(
  planTier?: AuthPlanTier | PlanTier | ManageMembershipPlan | null,
): ManageMembershipPlan {
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

export function manageMembershipPlanToAuth(
  plan: ManageMembershipPlan,
): PlanTier {
  if (plan === "business") return "ENTERPRISE";
  if (plan === "pro") return "PRO";
  return "FREE";
}

/** Next higher plan for Upgrade CTA; null on Business. */
export function nextManageMembershipUpgrade(
  plan: ManageMembershipPlan,
): ManageMembershipPlan | null {
  if (plan === "free") return "pro";
  if (plan === "pro") return "business";
  return null;
}

export function manageMembershipUpgradeLabel(
  plan: ManageMembershipPlan,
): string {
  const next = nextManageMembershipUpgrade(plan);
  if (next === "pro") return MANAGE_MEMBERSHIP_COPY.upgradeToPro;
  if (next === "business") return MANAGE_MEMBERSHIP_COPY.upgradeToBusiness;
  return MANAGE_MEMBERSHIP_COPY.contactSales;
}

export function manageMembershipPlanLabel(
  plan: ManageMembershipPlan,
): string {
  return MANAGE_MEMBERSHIP_PLAN_LABELS[plan];
}

export function manageMembershipStatusLabel(
  status: ManageMembershipStatus,
): string {
  return MANAGE_MEMBERSHIP_STATUS_LABELS[status];
}

export function manageMembershipCycleLabel(
  cycle: ManageMembershipBillingCycle,
): string {
  return MANAGE_MEMBERSHIP_BILLING_CYCLE_LABELS[cycle];
}

export function manageMembershipMonthlyPriceLabel(
  plan: ManageMembershipPlan,
): string {
  const tier = manageMembershipPlanToAuth(plan);
  return `${formatPrice(PLANS[tier].priceMonthlyCents)}/mo`;
}

export function manageMembershipMonthlyCredits(
  plan: ManageMembershipPlan,
): number {
  return PLANS[manageMembershipPlanToAuth(plan)].monthlyCredits;
}

export function canBuyManageMembershipCredits(
  plan: ManageMembershipPlan,
): boolean {
  return PLANS[manageMembershipPlanToAuth(plan)].topUpsEnabled;
}

export function shouldShowManageMembershipUpgrade(
  plan: ManageMembershipPlan,
  status: ManageMembershipStatus,
): boolean {
  if (status === "expired" || status === "cancelled") return true;
  return nextManageMembershipUpgrade(plan) != null;
}

export function creditUsagePercent(
  remaining: number,
  monthlyGrant: number,
): number {
  if (monthlyGrant <= 0) return 0;
  const used = Math.max(0, monthlyGrant - remaining);
  return Math.min(100, Math.round((used / monthlyGrant) * 100));
}

export function creditRemainingPercent(
  remaining: number,
  monthlyGrant: number,
): number {
  if (monthlyGrant <= 0) return 0;
  return Math.min(100, Math.round((remaining / monthlyGrant) * 100));
}

export function formatManageMembershipCost(
  plan: ManageMembershipPlan,
  cycle: ManageMembershipBillingCycle = "monthly",
): string {
  void cycle; // yearly not confirmed in PRICING.md yet
  return manageMembershipMonthlyPriceLabel(plan);
}
