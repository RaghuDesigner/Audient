/**
 * Category scores — COMPONENT-009 whitelist + status mapping.
 */

import {
  SCORE_BAND_TEXT,
  clampScore,
  type ScoreBand,
} from "@/utils/score-grade";

export const AUDIT_CATEGORIES = [
  "accessibility",
  "usability",
  "performance",
  "seo",
  "visual_design",
  "trust",
] as const;

export type AuditCategoryId = (typeof AUDIT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<AuditCategoryId, string> = {
  accessibility: "Accessibility",
  usability: "Usability",
  performance: "Performance",
  seo: "SEO",
  visual_design: "Visual Design",
  trust: "Trust",
};

/** Qualitative status labels (COMPONENT-009 §4). */
export type CategoryStatusLabel =
  | "Excellent"
  | "Good"
  | "Fair"
  | "Needs work"
  | "Poor";

/**
 * Derive status from score when server status is omitted.
 * 90–100 Excellent · 75–89 Good · 60–74 Fair · 40–59 Needs work · 0–39 Poor
 */
export function statusFromCategoryScore(score: number): CategoryStatusLabel {
  const value = clampScore(score);
  if (value >= 90) return "Excellent";
  if (value >= 75) return "Good";
  if (value >= 60) return "Fair";
  if (value >= 40) return "Needs work";
  return "Poor";
}

export function categoryBandFromScore(score: number): ScoreBand {
  const value = clampScore(score);
  if (value >= 90) return "excellent";
  if (value >= 75) return "good";
  if (value >= 60) return "fair";
  if (value >= 40) return "poor";
  return "critical";
}

export const CATEGORY_BAR_FILL: Record<ScoreBand, string> = {
  excellent: "bg-success",
  good: "bg-success",
  fair: "bg-secondary",
  poor: "bg-warning",
  critical: "bg-error",
};

export { SCORE_BAND_TEXT as CATEGORY_STATUS_TEXT };

export function isAuditCategoryId(value: string): value is AuditCategoryId {
  return (AUDIT_CATEGORIES as readonly string[]).includes(value);
}
