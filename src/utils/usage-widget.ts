/**
 * COMPONENT-034 — Usage Widget helpers.
 * State derivation + progress math — align thresholds with Credits Widget.
 * No React / no Stripe.
 */

import { PLANS, type PlanTier } from "@/config/plans";
import {
  USAGE_WIDGET_COPY,
  USAGE_WIDGET_STATE_LABELS,
  type UsageWidgetState,
  type UsageWidgetTier,
} from "@/config/usage-widget";
import {
  CREDITS_WARNING_RATIO,
  creditsUsageForProgress,
  cheapestScreenshotCost,
  type CreditsWidgetTier,
} from "@/utils/credits-widget";
import { formatAuditDate } from "@/utils/recent-audit";

export function usageWidgetTierToAuth(tier: UsageWidgetTier): PlanTier {
  if (tier === "business") return "ENTERPRISE";
  if (tier === "pro") return "PRO";
  return "FREE";
}

export function usageWidgetMonthlyGrant(tier: UsageWidgetTier): number {
  return PLANS[usageWidgetTierToAuth(tier)].monthlyCredits;
}

export function canBuyUsageWidgetCredits(tier: UsageWidgetTier): boolean {
  return PLANS[usageWidgetTierToAuth(tier)].topUpsEnabled;
}

/**
 * Map Credits Widget visual state → Usage Widget state.
 * success→normal, warning→near_limit, exhausted→limit_reached.
 */
export function deriveUsageWidgetState(input: {
  creditsRemaining: number;
  monthlyGrant: number;
  tier: UsageWidgetTier;
}): Exclude<UsageWidgetState, "loading" | "error"> {
  const minCost = cheapestScreenshotCost(
    input.tier as CreditsWidgetTier,
  );
  const remaining = input.creditsRemaining;
  const grant = input.monthlyGrant;

  if (remaining <= 0 || remaining < minCost) return "limit_reached";

  const warningFloor =
    grant > 0
      ? Math.max(minCost, Math.ceil(grant * CREDITS_WARNING_RATIO))
      : minCost;

  if (remaining <= warningFloor) return "near_limit";
  return "normal";
}

export function usageWidgetStateLabel(
  state: Exclude<UsageWidgetState, "loading" | "error">,
): string {
  return USAGE_WIDGET_STATE_LABELS[state];
}

/** Progress capped at monthly grant so top-ups never break the bar. */
export function usageCreditsProgress(
  used: number,
  monthlyGrant: number,
): { value: number; max: number; percent: number } {
  const { value, max } = creditsUsageForProgress(used, monthlyGrant);
  const percent = Math.min(100, Math.round((value / max) * 100));
  return { value, max, percent };
}

export function usageStorageProgress(
  storageUsed: string | number | null | undefined,
  storageLimit?: string | number | null,
): { value: number; max: number; label: string } | null {
  if (storageUsed == null) return null;

  if (typeof storageUsed === "string" && storageLimit == null) {
    return { value: 0, max: 100, label: storageUsed };
  }

  const usedNum =
    typeof storageUsed === "number"
      ? storageUsed
      : Number.parseFloat(storageUsed);
  if (Number.isNaN(usedNum)) {
    return { value: 0, max: 100, label: String(storageUsed) };
  }

  const limitNum =
    storageLimit == null
      ? 100
      : typeof storageLimit === "number"
        ? storageLimit
        : Number.parseFloat(String(storageLimit));

  const max = Number.isNaN(limitNum) || limitNum <= 0 ? 100 : limitNum;
  const value = Math.min(Math.max(0, usedNum), max);
  const label =
    storageLimit == null && typeof storageUsed === "number"
      ? `${Math.round(value)}%`
      : `${formatUsageNumber(value)} / ${formatUsageNumber(max)}`;

  return { value, max, label };
}

export function formatUsageNumber(value: number): string {
  return value.toLocaleString();
}

export function formatUsageBillingCycleLabel(input: {
  billingCycleLabel?: string | null;
  renewalDate?: string | Date | null;
}): string | null {
  if (input.billingCycleLabel) return input.billingCycleLabel;
  if (input.renewalDate == null) return null;
  return `${USAGE_WIDGET_COPY.renews} ${formatAuditDate(input.renewalDate)}`;
}

export function shouldShowUsageBuyCredits(input: {
  tier: UsageWidgetTier;
  state: Exclude<UsageWidgetState, "loading" | "error">;
  showBuyCredits?: boolean;
}): boolean {
  if (input.showBuyCredits != null) return input.showBuyCredits;
  if (!canBuyUsageWidgetCredits(input.tier)) return false;
  return input.state === "near_limit" || input.state === "limit_reached";
}

export function shouldShowUsageUpgrade(input: {
  tier: UsageWidgetTier;
  state: Exclude<UsageWidgetState, "loading" | "error">;
  showUpgrade?: boolean;
}): boolean {
  if (input.showUpgrade != null) return input.showUpgrade;
  if (input.tier === "free") return true;
  return input.state === "limit_reached";
}

export function usageWidgetSummary(input: {
  creditsRemaining: number;
  monthlyGrant: number;
  creditsUsed: number;
  reportsGenerated?: number | null;
  state: Exclude<UsageWidgetState, "loading" | "error">;
}): string {
  const parts = [
    `${formatUsageNumber(input.creditsRemaining)} of ${formatUsageNumber(input.monthlyGrant)} credits remaining`,
    `${formatUsageNumber(input.creditsUsed)} used`,
    usageWidgetStateLabel(input.state),
  ];
  if (input.reportsGenerated != null) {
    parts.push(
      `${formatUsageNumber(input.reportsGenerated)} reports generated`,
    );
  }
  return parts.join(". ");
}

/** Re-export for callers that need the shared threshold constant. */
export { CREDITS_WARNING_RATIO as USAGE_NEAR_LIMIT_RATIO };
