/**
 * Upgrade Banner copy & plan chips — COMPONENT-012.
 * Prices/credits from authoritative `plans.ts` / PRICING.md.
 */

import { formatPrice, PLANS } from "@/config/plans";

export const UPGRADE_BANNER_VARIANTS = [
  "guest",
  "free",
  "pro_renewal",
  "business",
] as const;

export type UpgradeBannerVariant = (typeof UPGRADE_BANNER_VARIANTS)[number];

export type UpgradeBannerContent = {
  headline: string;
  description: string;
  highlights: string[];
  upgradeLabel: string;
  compareLabel: string;
  businessLabel: string;
  /** Primary CTA target for analytics. */
  targetTier: "pro" | "business" | "renew";
};

const pro = PLANS.PRO;
const business = PLANS.ENTERPRISE;
const free = PLANS.FREE;

export const UPGRADE_BANNER_CONTENT: Record<
  UpgradeBannerVariant,
  UpgradeBannerContent
> = {
  guest: {
    headline: "Unlock the full UX audit",
    description:
      "You’re seeing a guest preview. Upgrade to Pro for full findings, live URL audits, and downloadable PDF reports.",
    highlights: [
      "Full findings list & AI recommendations",
      `${pro.monthlyCredits.toLocaleString()} credits / month`,
      "Live URL audits + professional PDF",
      `Business scale: ${business.monthlyCredits.toLocaleString()} credits`,
    ],
    upgradeLabel: "Upgrade to Pro",
    compareLabel: "Compare Plans",
    businessLabel: "View Business Plans",
    targetTier: "pro",
  },
  free: {
    headline: "Go Pro for URL audits & PDF",
    description:
      "Your Free plan covers screenshot summaries. Unlock live URL audits, full findings, and PDF exports with Pro.",
    highlights: [
      "Live website audits via URL",
      `${pro.monthlyCredits.toLocaleString()} credits / month`,
      "Downloadable PDF reports",
      "Deeper accessibility & UX recommendations",
    ],
    upgradeLabel: "Upgrade to Pro",
    compareLabel: "Compare Plans",
    businessLabel: "View Business Plans",
    targetTier: "pro",
  },
  pro_renewal: {
    headline: "Keep Pro running without interruption",
    description:
      "Renew or update billing to keep URL audits, PDF exports, and your monthly credit grant active.",
    highlights: [
      `${formatPrice(pro.priceMonthlyCents)} / month`,
      `${pro.monthlyCredits.toLocaleString()} credits every month`,
      "URL audits & PDF included",
      "Top-ups available when you need more",
    ],
    upgradeLabel: "Renew Pro",
    compareLabel: "Compare Plans",
    businessLabel: "View Business Plans",
    targetTier: "renew",
  },
  business: {
    headline: "Scale audits across projects",
    description:
      "Business unlocks higher monthly credits and lower per-audit cost for teams and multi-site work.",
    highlights: [
      `${business.monthlyCredits.toLocaleString()} credits / month`,
      `${formatPrice(business.priceMonthlyCents)} / month`,
      "Lower credit cost per audit",
      "PDF exports & full URL audits",
    ],
    upgradeLabel: "Upgrade to Business",
    compareLabel: "Compare Plans",
    businessLabel: "View Business Plans",
    targetTier: "business",
  },
};

export type UpgradeBannerPlanChip = {
  id: "guest_free" | "pro" | "business";
  label: string;
  price: string;
  meta: string;
  emphasized?: boolean;
};

/** Inline Guest/Free · Pro · Business comparison row (SCREEN-007). */
export function upgradeBannerPlanChips(
  variant: UpgradeBannerVariant,
): UpgradeBannerPlanChip[] {
  const guestFreeLabel = variant === "guest" ? "Guest" : free.displayName;
  return [
    {
      id: "guest_free",
      label: guestFreeLabel,
      price: formatPrice(free.priceMonthlyCents),
      meta:
        variant === "guest"
          ? "1 screenshot preview"
          : `${free.monthlyCredits.toLocaleString()} credits`,
    },
    {
      id: "pro",
      label: pro.displayName,
      price: formatPrice(pro.priceMonthlyCents),
      meta: `${pro.monthlyCredits.toLocaleString()} credits / mo`,
      emphasized: variant !== "business",
    },
    {
      id: "business",
      label: business.displayName,
      price: formatPrice(business.priceMonthlyCents),
      meta: `${business.monthlyCredits.toLocaleString()} credits / mo`,
      emphasized: variant === "business",
    },
  ];
}
