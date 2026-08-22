/**
 * COMPONENT-029 — Recommendation Card constants.
 * Severity/priority/effort labels, states, copy — no UI.
 */

export const RECOMMENDATION_CARD_STATES = [
  "loading",
  "default",
  "locked",
  "error",
] as const;

export type RecommendationCardState =
  (typeof RECOMMENDATION_CARD_STATES)[number];

export const RECOMMENDATION_CARD_VARIANTS = [
  "report",
  "compare",
  "shared",
  "pdf",
] as const;

export type RecommendationCardVariant =
  (typeof RECOMMENDATION_CARD_VARIANTS)[number];

export const RECOMMENDATION_CARD_TIERS = [
  "guest",
  "free",
  "pro",
  "business",
] as const;

export type RecommendationCardTier =
  (typeof RECOMMENDATION_CARD_TIERS)[number];

/** Product priority — P1 = do first. */
export const RECOMMENDATION_CARD_PRIORITIES = [
  "p1",
  "p2",
  "p3",
  "p4",
] as const;

export type RecommendationCardPriority =
  (typeof RECOMMENDATION_CARD_PRIORITIES)[number];

export const RECOMMENDATION_CARD_PRIORITY_LABELS: Record<
  RecommendationCardPriority,
  string
> = {
  p1: "P1",
  p2: "P2",
  p3: "P3",
  p4: "P4",
};

/** Estimated implementation effort — not AI runtime. */
export const RECOMMENDATION_CARD_EFFORTS = ["low", "medium", "high"] as const;

export type RecommendationCardEffort =
  (typeof RECOMMENDATION_CARD_EFFORTS)[number];

export const RECOMMENDATION_CARD_EFFORT_LABELS: Record<
  RecommendationCardEffort,
  string
> = {
  low: "Low effort",
  medium: "Medium effort",
  high: "High effort",
};

/** Qualitative impact of fixing. */
export const RECOMMENDATION_CARD_IMPACTS = ["high", "medium", "low"] as const;

export type RecommendationCardImpact =
  (typeof RECOMMENDATION_CARD_IMPACTS)[number];

export const RECOMMENDATION_CARD_IMPACT_LABELS: Record<
  RecommendationCardImpact,
  string
> = {
  high: "High impact",
  medium: "Medium impact",
  low: "Low impact",
};

export const RECOMMENDATION_CARD_COPY = {
  expand: "Show recommendation details",
  collapse: "Hide recommendation details",
  lockedLabel: "Upgrade to unlock this recommendation",
  lockedAria: "Recommendation locked. Upgrade to unlock.",
  upgrade: "Upgrade",
  error: "We couldn’t load this recommendation. Please try again.",
  retry: "Retry",
  confidencePrefix: "AI confidence",
  learnMore: "Learn more",
  learnMoreUnavailable: "Learn more (coming soon)",
  beforeAfter: "Before / after preview",
  beforeAfterUnavailable: "Before / after preview coming soon",
  beforePlaceholder: "Before",
  afterPlaceholder: "After",
  collaboration: "Team collaboration",
  collaborationHint: "Comments and assignments coming soon",
  linkedFinding: "Linked finding",
} as const;

export const RECOMMENDATION_CARD_UPGRADE_SOURCE = "recommendation_card";

/** Description lines when collapsed. */
export const RECOMMENDATION_CARD_COLLAPSED_LINES = 2;
