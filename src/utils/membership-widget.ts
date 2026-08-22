/**
 * Membership Widget helpers — COMPONENT-018.
 * Benefits/prices from plans.ts / PRICING.md (no invented Team/API benefits).
 */

import { formatPrice, GUEST_AUDIT, PLANS } from "@/config/plans";
import { formatCreditsRenewal } from "@/utils/credits-widget";

export type MembershipWidgetState =
  | "loading"
  | "active"
  | "trial"
  | "expired";

export type MembershipWidgetPlan = "guest" | "free" | "pro" | "business";

export const MEMBERSHIP_PLAN_LABELS: Record<MembershipWidgetPlan, string> = {
  guest: "Guest",
  free: "Free",
  pro: "Pro",
  business: "Business",
};

export const MEMBERSHIP_STATE_LABELS: Record<
  Exclude<MembershipWidgetState, "loading">,
  string
> = {
  active: "Active",
  trial: "Trial",
  expired: "Expired",
};

export function defaultMembershipBenefits(
  plan: MembershipWidgetPlan,
): string[] {
  switch (plan) {
    case "guest":
      return [
        `${GUEST_AUDIT.maxScreenshotAudits} screenshot teaser audit`,
        "Brief on-screen summary",
        "Login to keep history & credits",
      ];
    case "free":
      return [
        `${PLANS.FREE.monthlyCredits.toLocaleString()} credits / month`,
        "Screenshot audits",
        "Brief on-screen summary",
        "URL & PDF gated — upgrade to unlock",
      ];
    case "pro":
      return [
        `${formatPrice(PLANS.PRO.priceMonthlyCents)} / month`,
        `${PLANS.PRO.monthlyCredits.toLocaleString()} credits / month`,
        "Live URL audits",
        "Full report + PDF export",
      ];
    case "business":
      return [
        `${formatPrice(PLANS.ENTERPRISE.priceMonthlyCents)} / month`,
        `${PLANS.ENTERPRISE.monthlyCredits.toLocaleString()} credits / month`,
        "Higher volume URL audits",
        "Full report + PDF export",
      ];
  }
}

export function shouldShowMembershipUpgrade(input: {
  plan: MembershipWidgetPlan;
  state: Exclude<MembershipWidgetState, "loading">;
  showUpgradeCta?: boolean;
}): boolean {
  if (input.showUpgradeCta != null) return input.showUpgradeCta;
  if (input.state === "expired") return true;
  if (input.plan === "guest" || input.plan === "free") return true;
  if (input.plan === "pro") return true; // optional Business upsell
  return false;
}

export function shouldShowMembershipManage(input: {
  plan: MembershipWidgetPlan;
  state: Exclude<MembershipWidgetState, "loading">;
  showManageCta?: boolean;
}): boolean {
  if (input.showManageCta != null) return input.showManageCta;
  if (input.plan === "guest") return false;
  return true;
}

export function membershipUpgradeLabel(input: {
  plan: MembershipWidgetPlan;
  state: Exclude<MembershipWidgetState, "loading">;
}): string {
  if (input.state === "expired") return "Renew plan";
  if (input.plan === "pro") return "Upgrade to Business";
  if (input.plan === "business") return "Contact Sales";
  return "Upgrade to Pro";
}

export function membershipManageLabel(
  state: Exclude<MembershipWidgetState, "loading">,
): string {
  if (state === "expired") return "Update billing";
  return "Manage Plan";
}

export function formatMembershipRenewal(
  value: string | Date | null | undefined,
): string | null {
  return formatCreditsRenewal(value ?? null);
}
