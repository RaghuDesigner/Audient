/**
 * Authoritative plan catalog for Audient.
 * Adopted: PRD pricing (Pro $29 / 1,000) + 1 anonymous guest screenshot audit.
 * @see docs/PRICING.md
 */

export type PlanTier = "FREE" | "PRO" | "ENTERPRISE";

export type BillingInterval = "MONTHLY";

export interface TierCreditCosts {
  screenshotAudit: number;
  urlAudit: number | null;
}

export interface PlanDefinition {
  tier: PlanTier;
  /** UI display name (Business maps to ENTERPRISE) */
  displayName: string;
  /** Figma group label */
  groupLabel: "Individual" | "Enterprise";
  priceMonthlyCents: number;
  monthlyCredits: number;
  isUnlimited: boolean;
  urlAuditsEnabled: boolean;
  pdfEnabled: boolean;
  topUpsEnabled: boolean;
  recommended: boolean;
  creditCosts: TierCreditCosts;
  features: string[];
}

/** Guest: exactly one anonymous screenshot audit before login is required. */
export const GUEST_AUDIT = {
  maxScreenshotAudits: 1,
  inputType: "SCREENSHOT" as const,
  /** Credits displayed / reserved for the single guest audit (matches Free screenshot cost). */
  screenshotCreditCost: 150,
} as const;

export const PLANS: Record<PlanTier, PlanDefinition> = {
  FREE: {
    tier: "FREE",
    displayName: "Free",
    groupLabel: "Individual",
    priceMonthlyCents: 0,
    monthlyCredits: 300,
    isUnlimited: false,
    urlAuditsEnabled: false,
    pdfEnabled: false,
    topUpsEnabled: false,
    recommended: false,
    creditCosts: { screenshotAudit: 150, urlAudit: null },
    features: [
      "Upload screenshots for AI UX audits",
      "300 credits every month (≈ 2 screenshot audits)",
      "Brief on-screen summary of findings",
    ],
  },
  PRO: {
    tier: "PRO",
    displayName: "Pro",
    groupLabel: "Individual",
    priceMonthlyCents: 2900,
    monthlyCredits: 1000,
    isUnlimited: false,
    urlAuditsEnabled: true,
    pdfEnabled: true,
    topUpsEnabled: true,
    recommended: false,
    creditCosts: { screenshotAudit: 100, urlAudit: 400 },
    features: [
      "Full website audits via live URL",
      "1,000 credits / month",
      "Actionable recommendations & accessibility insights",
      "Downloadable professional PDF report",
    ],
  },
  ENTERPRISE: {
    tier: "ENTERPRISE",
    displayName: "Business",
    groupLabel: "Enterprise",
    priceMonthlyCents: 9900,
    monthlyCredits: 10000,
    isUnlimited: false,
    urlAuditsEnabled: true,
    pdfEnabled: true,
    topUpsEnabled: true,
    recommended: true,
    creditCosts: { screenshotAudit: 50, urlAudit: 100 },
    features: [
      "10,000 credits / month for multi-site audits",
      "Lower credit cost per audit",
      "Comprehensive audits + PDF exports",
      "Scale across projects and clients",
    ],
  },
} as const;

export const TOP_UP_PACKS = [
  { id: "PACK_500", credits: 500, priceCents: 900 },
  { id: "PACK_2000", credits: 2000, priceCents: 2900 },
  { id: "PACK_5000", credits: 5000, priceCents: 5900 },
] as const;

export type TopUpPackId = (typeof TOP_UP_PACKS)[number]["id"];

/** Display order on Manage Plan (SCREEN-005) */
export const PLAN_DISPLAY_ORDER: PlanTier[] = ["FREE", "PRO", "ENTERPRISE"];

export function creditCostForInput(
  tier: PlanTier,
  inputType: "SCREENSHOT" | "URL",
): number | null {
  const costs = PLANS[tier].creditCosts;
  return inputType === "URL" ? costs.urlAudit : costs.screenshotAudit;
}

export function canRunUrlAudit(tier: PlanTier): boolean {
  return PLANS[tier].urlAuditsEnabled;
}

export function canDownloadPdf(tier: PlanTier): boolean {
  return PLANS[tier].pdfEnabled;
}

export function formatPrice(cents: number): string {
  if (cents === 0) return "$ 0";
  return `$ ${cents / 100}`;
}
