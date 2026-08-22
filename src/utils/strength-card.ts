/**
 * COMPONENT-028 — Strength Card helpers.
 * Pure formatting and a11y strings — no React.
 */

import {
  STRENGTH_CARD_CATEGORIES,
  STRENGTH_CARD_CATEGORY_LABELS,
  STRENGTH_CARD_CONFIDENCE_LABELS,
  STRENGTH_CARD_COPY,
  STRENGTH_CARD_IMPACT_LABELS,
  type StrengthCardCategory,
  type StrengthCardConfidenceBand,
  type StrengthCardImpactLevel,
  type StrengthCardVariant,
} from "@/config/strength-card";

export type StrengthCardConfidenceInput =
  | number
  | StrengthCardConfidenceBand
  | null
  | undefined;

const CATEGORY_SET = new Set<string>(STRENGTH_CARD_CATEGORIES);

/** Token classes for positive impact — text + color (never color-only). */
export const STRENGTH_CARD_IMPACT_BADGE: Record<
  StrengthCardImpactLevel,
  string
> = {
  high: "bg-success/15 text-success",
  medium: "bg-secondary/15 text-secondary",
  low: "bg-muted text-muted-foreground",
};

export function isStrengthCardCategory(
  value: string,
): value is StrengthCardCategory {
  return CATEGORY_SET.has(value);
}

export function strengthCardCategoryLabel(
  category: StrengthCardCategory,
): string {
  return STRENGTH_CARD_CATEGORY_LABELS[category];
}

export function strengthCardImpactLabel(
  impact: StrengthCardImpactLevel | null | undefined,
): string | null {
  if (!impact) return null;
  return STRENGTH_CARD_IMPACT_LABELS[impact];
}

/**
 * Display AI confidence as a percent (0–1 or 0–100) or band label.
 * Does not invent precision beyond the input.
 */
export function formatStrengthCardConfidence(
  value: StrengthCardConfidenceInput,
): string | null {
  if (value == null) return null;

  if (typeof value === "string") {
    return STRENGTH_CARD_CONFIDENCE_LABELS[value];
  }

  if (!Number.isFinite(value) || value < 0) return null;

  const ratio = value > 1 ? value / 100 : value;
  if (ratio > 1) return null;
  const percent = Math.round(ratio * 100);
  return `${STRENGTH_CARD_COPY.confidencePrefix} ${percent}%`;
}

/** Map a 0–1 score to a coarse band when UI needs a label. */
export function strengthCardConfidenceBand(
  value: number | null | undefined,
): StrengthCardConfidenceBand | null {
  if (value == null || !Number.isFinite(value) || value < 0) return null;
  const ratio = value > 1 ? value / 100 : value;
  if (ratio > 1) return null;
  if (ratio >= 0.8) return "high";
  if (ratio >= 0.5) return "medium";
  return "low";
}

/** Interactive expand — PDF/shared may render static expanded content. */
export function strengthCardAllowsToggle(
  variant: StrengthCardVariant = "report",
): boolean {
  return variant !== "pdf";
}

export function strengthCardToggleLabel(expanded: boolean): string {
  return expanded
    ? STRENGTH_CARD_COPY.collapse
    : STRENGTH_CARD_COPY.expand;
}

/** Screen-reader name: title + category (+ impact when present). */
export function strengthCardAccessibleName(input: {
  title: string;
  category: StrengthCardCategory;
  impactLevel?: StrengthCardImpactLevel | null;
}): string {
  const parts = [
    input.title,
    STRENGTH_CARD_CATEGORY_LABELS[input.category],
  ];
  const impact = strengthCardImpactLabel(input.impactLevel);
  if (impact) parts.push(impact);
  return parts.join(", ");
}

export function strengthCardScreenshotAlt(
  title: string,
  screenshotAlt?: string | null,
): string {
  const trimmed = screenshotAlt?.trim();
  if (trimmed) return trimmed;
  return `${STRENGTH_CARD_COPY.screenshotFallback}: ${title}`;
}
