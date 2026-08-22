/**
 * Plan Comparison Modal data — COMPONENT-013.
 * Prices / credits from `plans.ts` + Guest rules from PRICING.md.
 */

import { formatPrice, GUEST_AUDIT, PLANS } from "@/config/plans";

export const PLAN_COMPARISON_COLUMNS = [
  "guest",
  "free",
  "pro",
  "business",
] as const;

export type PlanComparisonColumnId =
  (typeof PLAN_COMPARISON_COLUMNS)[number];

export type PlanComparisonCurrentPlan = PlanComparisonColumnId | null;

export type PlanComparisonHighlight = "pro" | "business" | null;

export type PlanComparisonCell =
  | { kind: "check" }
  | { kind: "dash" }
  | { kind: "text"; value: string }
  | { kind: "coming_soon" };

export type PlanComparisonFeatureRow = {
  id: string;
  label: string;
  cells: Record<PlanComparisonColumnId, PlanComparisonCell>;
};

export type PlanComparisonColumn = {
  id: PlanComparisonColumnId;
  label: string;
  priceLabel: string;
  priceSuffix: string;
  meta: string;
  recommended?: boolean;
};

const free = PLANS.FREE;
const pro = PLANS.PRO;
const business = PLANS.ENTERPRISE;

export const PLAN_COMPARISON_COLUMN_META: Record<
  PlanComparisonColumnId,
  PlanComparisonColumn
> = {
  guest: {
    id: "guest",
    label: "Guest",
    priceLabel: formatPrice(0),
    priceSuffix: "",
    meta: `${GUEST_AUDIT.maxScreenshotAudits} screenshot teaser`,
  },
  free: {
    id: "free",
    label: free.displayName,
    priceLabel: formatPrice(free.priceMonthlyCents),
    priceSuffix: "/ mo",
    meta: `${free.monthlyCredits.toLocaleString()} credits / mo`,
  },
  pro: {
    id: "pro",
    label: pro.displayName,
    priceLabel: formatPrice(pro.priceMonthlyCents),
    priceSuffix: "/ mo",
    meta: `${pro.monthlyCredits.toLocaleString()} credits / mo`,
  },
  business: {
    id: "business",
    label: business.displayName,
    priceLabel: formatPrice(business.priceMonthlyCents),
    priceSuffix: "/ mo",
    meta: `${business.monthlyCredits.toLocaleString()} credits / mo`,
    recommended: business.recommended,
  },
};

export const PLAN_COMPARISON_FEATURES: PlanComparisonFeatureRow[] = [
  {
    id: "credits",
    label: "Credits",
    cells: {
      guest: { kind: "text", value: "1 screenshot teaser" },
      free: {
        kind: "text",
        value: `${free.monthlyCredits.toLocaleString()} / mo`,
      },
      pro: {
        kind: "text",
        value: `${pro.monthlyCredits.toLocaleString()} / mo`,
      },
      business: {
        kind: "text",
        value: `${business.monthlyCredits.toLocaleString()} / mo`,
      },
    },
  },
  {
    id: "audit_limits",
    label: "Audit Limits",
    cells: {
      guest: {
        kind: "text",
        value: "1 screenshot then login; no URL",
      },
      free: { kind: "text", value: "Screenshot only; URL gated" },
      pro: { kind: "text", value: "Screenshot + URL" },
      business: {
        kind: "text",
        value: "Screenshot + URL (higher volume)",
      },
    },
  },
  {
    id: "pdf",
    label: "PDF Export",
    cells: {
      guest: { kind: "dash" },
      free: { kind: "dash" },
      pro: { kind: "check" },
      business: { kind: "check" },
    },
  },
  {
    id: "history",
    label: "History",
    cells: {
      guest: { kind: "text", value: "Locked → login" },
      free: { kind: "text", value: "Limited" },
      pro: { kind: "text", value: "Full" },
      business: { kind: "text", value: "Full" },
    },
  },
  {
    id: "ai_recommendations",
    label: "AI Recommendations",
    cells: {
      guest: { kind: "text", value: "Preview (limited)" },
      free: { kind: "text", value: "Brief / limited" },
      pro: { kind: "text", value: "Full" },
      business: { kind: "text", value: "Full" },
    },
  },
  {
    id: "team",
    label: "Team Members",
    cells: {
      guest: { kind: "dash" },
      free: { kind: "dash" },
      pro: { kind: "dash" },
      business: { kind: "coming_soon" },
    },
  },
  {
    id: "api",
    label: "API Access",
    cells: {
      guest: { kind: "dash" },
      free: { kind: "dash" },
      pro: { kind: "dash" },
      business: { kind: "coming_soon" },
    },
  },
  {
    id: "white_label",
    label: "White Label",
    cells: {
      guest: { kind: "dash" },
      free: { kind: "dash" },
      pro: { kind: "dash" },
      business: { kind: "coming_soon" },
    },
  },
];

/** Phase-1 sales contact — no live CRM. */
export const CONTACT_SALES = {
  href: "mailto:sales@audient.app?subject=Audient%20Business%20inquiry",
  label: "Contact Sales",
} as const;

export function mapFocusTierToHighlight(
  focusTier?: "FREE" | "PRO" | "ENTERPRISE" | null,
): PlanComparisonHighlight {
  if (focusTier === "ENTERPRISE") return "business";
  if (focusTier === "PRO") return "pro";
  return null;
}

export function continueLabelForPlan(
  currentPlan: PlanComparisonCurrentPlan,
): string {
  if (currentPlan === "guest" || currentPlan == null) return "Maybe later";
  if (currentPlan === "free") return "Continue Free";
  return "Close";
}
