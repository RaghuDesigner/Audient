/**
 * COMPONENT-028 — Strength Card constants.
 * Categories, impact, states, labels — no UI.
 */

export const STRENGTH_CARD_STATES = ["loading", "default", "error"] as const;

export type StrengthCardState = (typeof STRENGTH_CARD_STATES)[number];

export const STRENGTH_CARD_VARIANTS = [
  "report",
  "compare",
  "shared",
  "pdf",
] as const;

export type StrengthCardVariant = (typeof STRENGTH_CARD_VARIANTS)[number];

/** Whitelist — broader than Category Score Card’s six dimensions. */
export const STRENGTH_CARD_CATEGORIES = [
  "accessibility",
  "navigation",
  "performance",
  "visual_design",
  "seo",
  "content",
  "mobile_ux",
  "forms",
  "trust",
  "consistency",
] as const;

export type StrengthCardCategory =
  (typeof STRENGTH_CARD_CATEGORIES)[number];

export const STRENGTH_CARD_CATEGORY_LABELS: Record<
  StrengthCardCategory,
  string
> = {
  accessibility: "Accessibility",
  navigation: "Navigation",
  performance: "Performance",
  visual_design: "Visual Design",
  seo: "SEO",
  content: "Content",
  mobile_ux: "Mobile UX",
  forms: "Forms",
  trust: "Trust",
  consistency: "Consistency",
};

/** Positive impact band — not Critical/Major/Minor severity. */
export const STRENGTH_CARD_IMPACT_LEVELS = ["high", "medium", "low"] as const;

export type StrengthCardImpactLevel =
  (typeof STRENGTH_CARD_IMPACT_LEVELS)[number];

export const STRENGTH_CARD_IMPACT_LABELS: Record<
  StrengthCardImpactLevel,
  string
> = {
  high: "High impact",
  medium: "Medium impact",
  low: "Low impact",
};

/** Optional band when confidence is shown as a label instead of %. */
export const STRENGTH_CARD_CONFIDENCE_BANDS = [
  "high",
  "medium",
  "low",
] as const;

export type StrengthCardConfidenceBand =
  (typeof STRENGTH_CARD_CONFIDENCE_BANDS)[number];

export const STRENGTH_CARD_CONFIDENCE_LABELS: Record<
  StrengthCardConfidenceBand,
  string
> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

export const STRENGTH_CARD_COPY = {
  expand: "Show strength details",
  collapse: "Hide strength details",
  error: "We couldn’t load this strength. Please try again.",
  retry: "Retry",
  confidencePrefix: "AI confidence",
  screenshotFallback: "Strength evidence",
} as const;

/** Description lines shown when collapsed (CSS clamp). */
export const STRENGTH_CARD_COLLAPSED_LINES = 2;
