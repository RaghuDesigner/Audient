/**
 * Phase-1 mock Recommendation Card props — COMPONENT-029.
 * Severity / priority / impact / effort samples for QA; no API.
 */

import type {
  RecommendationCardEffort,
  RecommendationCardImpact,
  RecommendationCardPriority,
  RecommendationCardState,
  RecommendationCardTier,
  RecommendationCardVariant,
} from "@/config/recommendation-card";
import type { AuditCategoryId } from "@/utils/category-score";
import type { FindingSeverity } from "@/utils/finding-severity";
import type { RecommendationCardConfidenceInput } from "@/utils/recommendation-card";

/** Data props for RecommendationCard (callbacks omitted). */
export type MockRecommendationCard = {
  recommendationId: string;
  title: string;
  description: string;
  category: AuditCategoryId;
  severity: FindingSeverity;
  priority: RecommendationCardPriority;
  estimatedImpact: RecommendationCardImpact | null;
  effort: RecommendationCardEffort | null;
  aiConfidence: RecommendationCardConfidenceInput;
  findingId: string | null;
  learnMoreHref: string | null;
  showBeforeAfterPlaceholder: boolean;
  state: RecommendationCardState;
  tier: RecommendationCardTier;
  variant?: RecommendationCardVariant;
  collaborationPlaceholder?: boolean;
  defaultExpanded?: boolean;
};

/** Aligns with SCREEN-010 Acme recommendation ids. */
export const MOCK_RECOMMENDATION_CTA: MockRecommendationCard = {
  recommendationId: "rec-cta-contrast",
  title: "Raise primary CTA contrast to WCAG AA",
  description:
    "Increase the primary button contrast to at least 4.5:1, keep one dominant CTA above the fold, and pair it with a short benefit line so users know what happens next.",
  category: "accessibility",
  severity: "critical",
  priority: "p1",
  estimatedImpact: "high",
  effort: "low",
  aiConfidence: 0.94,
  findingId: "finding-critical-focus",
  learnMoreHref: null,
  showBeforeAfterPlaceholder: true,
  state: "default",
  tier: "pro",
  variant: "report",
  defaultExpanded: true,
};

export const MOCK_RECOMMENDATION_FORM_ERRORS: MockRecommendationCard = {
  recommendationId: "rec-form-errors",
  title: "Make form errors text-and-icon based",
  description:
    "Keep red borders if desired, but always add an error message and icon so the issue is clear without relying on color perception alone.",
  category: "usability",
  severity: "high",
  priority: "p1",
  estimatedImpact: "high",
  effort: "medium",
  aiConfidence: 0.91,
  findingId: null,
  learnMoreHref: null,
  showBeforeAfterPlaceholder: true,
  state: "default",
  tier: "pro",
  variant: "report",
};

export const MOCK_RECOMMENDATION_MOBILE_NAV: MockRecommendationCard = {
  recommendationId: "rec-mobile-nav",
  title: "Enlarge mobile navigation tap targets",
  description:
    "Ensure header links and icon buttons meet a minimum 44×44px target with adequate spacing to reduce mis-taps on small screens.",
  category: "usability",
  severity: "medium",
  priority: "p2",
  estimatedImpact: "medium",
  effort: "low",
  aiConfidence: 0.86,
  findingId: null,
  learnMoreHref: null,
  showBeforeAfterPlaceholder: false,
  state: "default",
  tier: "pro",
  variant: "report",
};

export const MOCK_RECOMMENDATION_HERO_LCP: MockRecommendationCard = {
  recommendationId: "rec-hero-lcp",
  title: "Optimize the hero for faster LCP",
  description:
    "Compress and resize the hero asset, use modern formats, and reserve space to avoid layout shift while the image loads.",
  category: "performance",
  severity: "high",
  priority: "p2",
  estimatedImpact: "high",
  effort: "medium",
  aiConfidence: 0.89,
  findingId: "finding-high-lcp",
  learnMoreHref: null,
  showBeforeAfterPlaceholder: true,
  state: "default",
  tier: "pro",
  variant: "report",
};

export const MOCK_RECOMMENDATION_TRUST: MockRecommendationCard = {
  recommendationId: "rec-trust",
  title: "Surface trust near conversion points",
  description:
    "Move a short review quote or security cue beside the primary CTA on pricing and checkout so confidence appears before the click.",
  category: "trust",
  severity: "medium",
  priority: "p2",
  estimatedImpact: "medium",
  effort: "low",
  aiConfidence: 0.82,
  findingId: "finding-medium-trust",
  learnMoreHref: null,
  showBeforeAfterPlaceholder: false,
  state: "default",
  tier: "pro",
  variant: "report",
};

export const MOCK_RECOMMENDATION_META: MockRecommendationCard = {
  recommendationId: "rec-meta",
  title: "Rewrite the home meta description",
  description:
    "Replace the generic meta description with a 150–160 character summary of the core user benefit and differentiator.",
  category: "seo",
  severity: "low",
  priority: "p3",
  estimatedImpact: "low",
  effort: "low",
  aiConfidence: 0.78,
  findingId: null,
  learnMoreHref: null,
  showBeforeAfterPlaceholder: false,
  state: "default",
  tier: "pro",
  variant: "report",
};

/** Locked Free teaser — title only; no description payload. */
export const MOCK_RECOMMENDATION_LOCKED: MockRecommendationCard = {
  recommendationId: "rec-locked-teaser",
  title: "Improve checkout focus order for keyboard users",
  description: "",
  category: "accessibility",
  severity: "critical",
  priority: "p1",
  estimatedImpact: null,
  effort: null,
  aiConfidence: null,
  findingId: null,
  learnMoreHref: null,
  showBeforeAfterPlaceholder: false,
  state: "locked",
  tier: "free",
  variant: "report",
};

export const MOCK_RECOMMENDATION_LOADING: MockRecommendationCard = {
  recommendationId: "rec-loading",
  title: "",
  description: "",
  category: "usability",
  severity: "medium",
  priority: "p2",
  estimatedImpact: null,
  effort: null,
  aiConfidence: null,
  findingId: null,
  learnMoreHref: null,
  showBeforeAfterPlaceholder: false,
  state: "loading",
  tier: "pro",
};

export const MOCK_RECOMMENDATION_ERROR: MockRecommendationCard = {
  recommendationId: "rec-error",
  title: "",
  description: "",
  category: "usability",
  severity: "medium",
  priority: "p2",
  estimatedImpact: null,
  effort: null,
  aiConfidence: null,
  findingId: null,
  learnMoreHref: null,
  showBeforeAfterPlaceholder: false,
  state: "error",
  tier: "pro",
};

export const MOCK_RECOMMENDATION_BUSINESS: MockRecommendationCard = {
  ...MOCK_RECOMMENDATION_CTA,
  recommendationId: "rec-cta-contrast-biz",
  tier: "business",
  collaborationPlaceholder: true,
};

/** Full Acme report list — COMPONENT-029 enriched recommendations. */
export const MOCK_RECOMMENDATION_CARDS_REPORT: MockRecommendationCard[] = [
  MOCK_RECOMMENDATION_CTA,
  MOCK_RECOMMENDATION_FORM_ERRORS,
  MOCK_RECOMMENDATION_MOBILE_NAV,
  MOCK_RECOMMENDATION_HERO_LCP,
  MOCK_RECOMMENDATION_TRUST,
  MOCK_RECOMMENDATION_META,
];

export const MOCK_RECOMMENDATION_CARD_BY_STATE: Record<
  RecommendationCardState,
  MockRecommendationCard
> = {
  loading: MOCK_RECOMMENDATION_LOADING,
  default: MOCK_RECOMMENDATION_CTA,
  locked: MOCK_RECOMMENDATION_LOCKED,
  error: MOCK_RECOMMENDATION_ERROR,
};

export function getMockRecommendationCard(
  state: RecommendationCardState = "default",
  overrides?: Partial<MockRecommendationCard>,
): MockRecommendationCard {
  return { ...MOCK_RECOMMENDATION_CARD_BY_STATE[state], ...overrides };
}
