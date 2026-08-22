/**
 * COMPONENT-029 — Recommendation Card helpers.
 * Pure formatting, tier rules, and a11y strings — no React.
 */

import {
  RECOMMENDATION_CARD_COPY,
  RECOMMENDATION_CARD_EFFORT_LABELS,
  RECOMMENDATION_CARD_IMPACT_LABELS,
  RECOMMENDATION_CARD_PRIORITIES,
  RECOMMENDATION_CARD_PRIORITY_LABELS,
  type RecommendationCardEffort,
  type RecommendationCardImpact,
  type RecommendationCardPriority,
  type RecommendationCardTier,
  type RecommendationCardVariant,
} from "@/config/recommendation-card";
import {
  FINDING_SEVERITY_LABELS,
  normalizeFindingSeverity,
  type FindingSeverity,
  type FindingSeverityInput,
} from "@/utils/finding-severity";

export type RecommendationCardConfidenceInput =
  | number
  | "high"
  | "medium"
  | "low"
  | null
  | undefined;

/** Accept `p1`/`P1`/`1` style priority inputs from mocks/API later. */
export type RecommendationCardPriorityInput =
  | RecommendationCardPriority
  | "P1"
  | "P2"
  | "P3"
  | "P4"
  | 1
  | 2
  | 3
  | 4;

export const RECOMMENDATION_CARD_IMPACT_BADGE: Record<
  RecommendationCardImpact,
  string
> = {
  high: "bg-success/15 text-success",
  medium: "bg-secondary/15 text-secondary",
  low: "bg-muted text-muted-foreground",
};

export const RECOMMENDATION_CARD_EFFORT_BADGE: Record<
  RecommendationCardEffort,
  string
> = {
  low: "bg-success/15 text-success",
  medium: "bg-warning/25 text-foreground",
  high: "bg-secondary/15 text-secondary",
};

export function normalizeRecommendationPriority(
  value: RecommendationCardPriorityInput,
): RecommendationCardPriority {
  const key = String(value).toLowerCase().replace(/^p/, "");
  if (key === "1") return "p1";
  if (key === "2") return "p2";
  if (key === "3") return "p3";
  if (key === "4") return "p4";
  if (
    RECOMMENDATION_CARD_PRIORITIES.includes(
      value as RecommendationCardPriority,
    )
  ) {
    return value as RecommendationCardPriority;
  }
  return "p2";
}

export function recommendationPriorityLabel(
  value: RecommendationCardPriorityInput,
): string {
  return RECOMMENDATION_CARD_PRIORITY_LABELS[
    normalizeRecommendationPriority(value)
  ];
}

export function recommendationSeverityLabel(
  value: FindingSeverityInput,
): string {
  return FINDING_SEVERITY_LABELS[normalizeFindingSeverity(value)];
}

export function recommendationImpactLabel(
  impact: RecommendationCardImpact | null | undefined,
): string | null {
  if (!impact) return null;
  return RECOMMENDATION_CARD_IMPACT_LABELS[impact];
}

export function recommendationEffortLabel(
  effort: RecommendationCardEffort | null | undefined,
): string | null {
  if (!effort) return null;
  return RECOMMENDATION_CARD_EFFORT_LABELS[effort];
}

/**
 * Display AI confidence as percent (0–1 or 0–100) or band label.
 * Does not invent precision beyond the input.
 */
export function formatRecommendationConfidence(
  value: RecommendationCardConfidenceInput,
): string | null {
  if (value == null) return null;

  if (typeof value === "string") {
    const band =
      value === "high"
        ? "High"
        : value === "medium"
          ? "Medium"
          : value === "low"
            ? "Low"
            : null;
    return band
      ? `${RECOMMENDATION_CARD_COPY.confidencePrefix} · ${band}`
      : null;
  }

  if (!Number.isFinite(value) || value < 0) return null;
  const ratio = value > 1 ? value / 100 : value;
  if (ratio > 1) return null;
  return `${RECOMMENDATION_CARD_COPY.confidencePrefix} ${Math.round(ratio * 100)}%`;
}

export function recommendationCardAllowsToggle(
  variant: RecommendationCardVariant = "report",
  locked = false,
): boolean {
  if (locked) return false;
  return variant !== "pdf";
}

export function recommendationCardToggleLabel(expanded: boolean): string {
  return expanded
    ? RECOMMENDATION_CARD_COPY.collapse
    : RECOMMENDATION_CARD_COPY.expand;
}

/** Business-only non-functional collab stubs. */
export function shouldShowRecommendationCollaboration(
  tier: RecommendationCardTier,
  collaborationPlaceholder?: boolean,
): boolean {
  if (collaborationPlaceholder === false) return false;
  return tier === "business";
}

export function recommendationCardAccessibleName(input: {
  title: string;
  severity: FindingSeverityInput;
  priority: RecommendationCardPriorityInput;
  locked?: boolean;
}): string {
  if (input.locked) {
    return `${input.title}. ${RECOMMENDATION_CARD_COPY.lockedAria}`;
  }
  const severity = recommendationSeverityLabel(input.severity);
  const priority = recommendationPriorityLabel(input.priority);
  return `${input.title}, ${severity}, ${priority}`;
}

export function recommendationLearnMoreLabel(
  href: string | null | undefined,
): string {
  return href
    ? RECOMMENDATION_CARD_COPY.learnMore
    : RECOMMENDATION_CARD_COPY.learnMoreUnavailable;
}

/** Re-export severity type for card consumers. */
export type { FindingSeverity };
