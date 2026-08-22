/**
 * Phase-1 mock — Guest Audit Results preview (SCREEN-007 / M02-guest).
 * Only preview-safe fields. Do not include full findings / recommendations.
 */

export type FindingSeverity = "critical" | "major" | "minor";

export type GuestFinding = {
  id: string;
  severity: FindingSeverity;
  title: string;
  description: string;
};

export type GuestCategoryScore = {
  id: "accessibility" | "usability" | "visual_design" | "performance" | "seo";
  label: string;
  score: number;
  status: string;
};

export type GuestAuditResultsPreview = {
  auditId: string;
  overallScore: number;
  grade: string;
  summary: string;
  categories: GuestCategoryScore[];
  /** Exactly three unlocked findings for guests. */
  topFindings: GuestFinding[];
  lockedFindingsCount: number;
  recommendation: {
    title: string;
    body: string;
  };
  lockedRecommendationsCount: number;
};

/**
 * Mock preview matching Figma teaser counts (37 findings / 24 recommendations).
 */
export const MOCK_GUEST_AUDIT_RESULTS: GuestAuditResultsPreview = {
  auditId: "mock-guest-preview",
  overallScore: 72,
  grade: "B",
  summary:
    "Your site shows solid foundations with clear opportunities in accessibility and conversion clarity.",
  categories: [
    {
      id: "accessibility",
      label: "Accessibility",
      score: 64,
      status: "Needs work",
    },
    {
      id: "usability",
      label: "Usability",
      score: 78,
      status: "Good",
    },
    {
      id: "visual_design",
      label: "Visual Design",
      score: 81,
      status: "Good",
    },
    {
      id: "performance",
      label: "Performance",
      score: 70,
      status: "Fair",
    },
    {
      id: "seo",
      label: "SEO",
      score: 68,
      status: "Fair",
    },
  ],
  topFindings: [
    {
      id: "f1",
      severity: "critical",
      title: "Primary CTA contrast is too low",
      description:
        "The main action button does not meet WCAG contrast for normal text, reducing visibility for many users.",
    },
    {
      id: "f2",
      severity: "major",
      title: "Form errors rely on color alone",
      description:
        "Invalid fields are marked only with red borders. Add text or icons so errors are clear without color.",
    },
    {
      id: "f3",
      severity: "major",
      title: "Mobile nav targets are undersized",
      description:
        "Several header links fall below the recommended 44×44px tap target on small screens.",
    },
  ],
  lockedFindingsCount: 37,
  recommendation: {
    title: "Raise CTA contrast and make it the strongest visual cue",
    body: "Increase the primary button contrast to at least 4.5:1, keep one dominant CTA above the fold, and pair it with a short benefit line so users know what happens next.",
  },
  lockedRecommendationsCount: 24,
};

export function getMockGuestAuditResults(
  auditId: string,
): GuestAuditResultsPreview {
  return {
    ...MOCK_GUEST_AUDIT_RESULTS,
    auditId,
  };
}
