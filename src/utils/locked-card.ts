/**
 * Locked Card variants & defaults — COMPONENT-011.
 */

export const LOCKED_CARD_VARIANTS = [
  "findings",
  "pdf",
  "compare",
  "accessibility_report",
  "performance_report",
  "seo_report",
  "custom",
] as const;

export type LockedCardVariant = (typeof LOCKED_CARD_VARIANTS)[number];

export type LockedCardDensity = "default" | "compact" | "banner";

export type LockedCardTier = "guest" | "free" | "pro" | "business";

/** Analytics / Upgrade Modal reason per built-in variant. */
export const LOCKED_CARD_REASONS: Record<
  Exclude<LockedCardVariant, "custom">,
  string
> = {
  findings: "locked_findings",
  pdf: "pdf",
  compare: "compare_reports",
  accessibility_report: "accessibility_report",
  performance_report: "performance_report",
  seo_report: "seo_report",
};

const DEFAULT_MESSAGES: Record<Exclude<LockedCardVariant, "custom">, string> =
  {
    findings: "More Findings Available",
    pdf: "Download PDF",
    compare: "Compare Reports",
    accessibility_report: "Accessibility Report",
    performance_report: "Performance Report",
    seo_report: "SEO Report",
  };

export function defaultLockedReason(variant: LockedCardVariant): string {
  if (variant === "custom") return "locked_feature";
  return LOCKED_CARD_REASONS[variant];
}

export function defaultLockedMessage(
  variant: LockedCardVariant,
  lockedCount?: number | null,
): string {
  if (variant === "findings" && lockedCount != null && lockedCount > 0) {
    return `${lockedCount} More Findings Available`;
  }
  if (variant === "custom") return "Premium feature locked";
  return DEFAULT_MESSAGES[variant];
}

export function defaultLockedCtaLabel(variant: LockedCardVariant): string {
  if (variant === "pdf") return "Unlock PDF";
  return "Upgrade to Unlock";
}

export function lockedCardAccessibleName(
  message: string,
  ctaLabel: string,
): string {
  return `${message}. ${ctaLabel}.`;
}
