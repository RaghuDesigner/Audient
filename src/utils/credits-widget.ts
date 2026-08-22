/**
 * Credits Widget helpers — COMPONENT-017.
 * Thresholds live here (not scattered across screens).
 */

import { PLANS, type PlanTier } from "@/config/plans";

export type CreditsWidgetState =
  | "loading"
  | "success"
  | "warning"
  | "exhausted";

export type CreditsWidgetTier = "guest" | "free" | "pro" | "business";

/** Warn when remaining is below this fraction of the monthly grant. */
export const CREDITS_WARNING_RATIO = 0.2;

export function mapDashboardTierToPlanTier(
  tier: CreditsWidgetTier,
): PlanTier | null {
  if (tier === "free") return "FREE";
  if (tier === "pro") return "PRO";
  if (tier === "business") return "ENTERPRISE";
  return null;
}

export function cheapestScreenshotCost(tier: CreditsWidgetTier): number {
  const planTier = mapDashboardTierToPlanTier(tier);
  if (!planTier) return PLANS.FREE.creditCosts.screenshotAudit;
  return PLANS[planTier].creditCosts.screenshotAudit;
}

/**
 * Derive visual state from remaining balance.
 * Exhausted: 0 remaining (or below cheapest screenshot).
 * Warning: under 20% of grant or cannot afford another screenshot.
 */
export function deriveCreditsWidgetState(input: {
  remaining: number;
  monthlyCredits: number;
  tier: CreditsWidgetTier;
}): Exclude<CreditsWidgetState, "loading"> {
  const { remaining, monthlyCredits, tier } = input;
  const minCost = cheapestScreenshotCost(tier);

  if (remaining <= 0 || remaining < minCost) return "exhausted";

  const warningFloor =
    monthlyCredits > 0
      ? Math.max(minCost, Math.ceil(monthlyCredits * CREDITS_WARNING_RATIO))
      : minCost;

  if (remaining <= warningFloor) return "warning";
  return "success";
}

/** Progress max is monthly grant; used is capped so top-ups never show >100%. */
export function creditsUsageForProgress(
  used: number,
  monthlyCredits: number,
): { value: number; max: number } {
  const max = Math.max(0, monthlyCredits);
  const value = Math.min(Math.max(0, used), max || 0);
  return { value, max: max || 1 };
}

export function defaultCreditsCtaLabel(tier: CreditsWidgetTier): string {
  switch (tier) {
    case "free":
    case "guest":
      return "Upgrade";
    case "pro":
      return "Buy Credits";
    case "business":
      return "Manage Plan";
  }
}

export function shouldShowCreditsCta(input: {
  tier: CreditsWidgetTier;
  state: Exclude<CreditsWidgetState, "loading">;
  showCta?: boolean;
}): boolean {
  if (input.showCta != null) return input.showCta;
  if (input.tier === "free" || input.tier === "guest") return true;
  return input.state === "warning" || input.state === "exhausted";
}

export function formatCreditsRenewal(value: string | Date | null): string | null {
  if (value == null) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
