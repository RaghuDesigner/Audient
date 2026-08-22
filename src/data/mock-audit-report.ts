/**
 * Phase-1 mock Audit Report — SCREEN-010 / M02.
 * Full Pro/Business payload + preview-safe Guest/Free slices (no hidden Pro JSON).
 */

import type { OverallScoreAuditType } from "@/components/results/OverallScoreCard";
import { MOCK_FINDINGS, type MockFinding } from "@/data/mock-findings";
import {
  MOCK_RECOMMENDATION_CARDS_REPORT,
  type MockRecommendationCard,
} from "@/data/mock-recommendation-card";
import {
  MOCK_STRENGTH_CARDS_REPORT,
  type MockStrengthCard,
} from "@/data/mock-strength-card";
import type { AuditCategoryId } from "@/utils/category-score";

export type MockAuditReportPlanUsed = "free" | "pro" | "business";

export type MockAuditReportSummary = {
  websiteName: string;
  websiteUrl: string | null;
  auditDate: string;
  auditType: "website" | "screenshot";
  planUsed: MockAuditReportPlanUsed;
  blurb: string;
};

export type MockAuditReportCategory = {
  category: AuditCategoryId;
  score: number;
  trend?: "up" | "down" | "flat" | null;
  trendDelta?: number | null;
};

/** Strength row for report — COMPONENT-028 fields. */
export type MockAuditReportStrength = Pick<
  MockStrengthCard,
  | "strengthId"
  | "title"
  | "description"
  | "category"
  | "aiConfidence"
  | "impactLevel"
  | "screenshotUrl"
  | "screenshotAlt"
>;

/** Recommendation row for report — COMPONENT-029 fields. */
export type MockAuditReportRecommendation = Pick<
  MockRecommendationCard,
  | "recommendationId"
  | "title"
  | "description"
  | "category"
  | "severity"
  | "priority"
  | "estimatedImpact"
  | "effort"
  | "aiConfidence"
  | "findingId"
  | "learnMoreHref"
  | "showBeforeAfterPlaceholder"
>;

export type MockAuditReportTotals = {
  findings: number;
  recommendations: number;
  strengths: number;
};

/** Full report payload — Pro / Business only. */
export type MockAuditReportFull = {
  auditId: string;
  summary: MockAuditReportSummary;
  overall: {
    score: number;
    summary: string;
    lastUpdated: string;
    auditType: OverallScoreAuditType;
  };
  categories: MockAuditReportCategory[];
  findings: MockFinding[];
  strengths: MockAuditReportStrength[];
  recommendations: MockAuditReportRecommendation[];
  totals: MockAuditReportTotals;
};

/**
 * Preview-safe payload — Guest / Free.
 * Contains only unlocked items + locked counts (no advanced finding bodies).
 */
export type MockAuditReportPreview = {
  auditId: string;
  summary: MockAuditReportSummary;
  overall: MockAuditReportFull["overall"];
  categories: MockAuditReportCategory[];
  findings: MockFinding[];
  strengths: MockAuditReportStrength[];
  recommendations: MockAuditReportRecommendation[];
  totals: MockAuditReportTotals;
  locked: {
    findings: number;
    recommendations: number;
    strengths: number;
  };
};

const EXTRA_FINDINGS: MockFinding[] = [
  {
    findingId: "finding-critical-focus",
    severity: "critical",
    title: "Keyboard focus order skips the checkout CTA",
    description:
      "Tab order moves past the primary purchase control, forcing keyboard users to hunt for the next step.",
    thumbnailUrl: null,
    thumbnailAlt: null,
    affectedPage: "Checkout",
    category: "accessibility",
    recommendationPreview:
      "Restore a logical DOM order so the primary CTA receives focus after cart summary.",
    priority: "P1",
  },
  {
    findingId: "finding-high-lcp",
    severity: "high",
    title: "Hero image delays Largest Contentful Paint",
    description:
      "An unoptimized full-bleed hero pushes LCP beyond 2.5s on mid-tier mobile, delaying perceived load.",
    thumbnailUrl: null,
    thumbnailAlt: null,
    affectedPage: "Home",
    category: "performance",
    recommendationPreview:
      "Serve a properly sized WebP/AVIF hero with priority hints and a reserved aspect ratio.",
    priority: "P2",
  },
  {
    findingId: "finding-medium-trust",
    severity: "medium",
    title: "Trust signals appear below the fold",
    description:
      "Security badges and review quotes only appear after scrolling, weakening confidence near the CTA.",
    thumbnailUrl: null,
    thumbnailAlt: null,
    affectedPage: "Pricing",
    category: "trust",
    recommendationPreview:
      "Place one concise trust cue next to the primary CTA above the fold.",
    priority: "P2",
  },
  {
    findingId: "finding-low-visual",
    severity: "low",
    title: "Inconsistent spacing in card grids",
    description:
      "Card gutters vary between sections, creating a slightly unfinished visual rhythm on desktop.",
    thumbnailUrl: null,
    thumbnailAlt: null,
    affectedPage: "Features",
    category: "visual_design",
    recommendationPreview:
      "Normalize card grid gaps to a single spacing token across marketing sections.",
    priority: "P4",
  },
];

const FULL_FINDINGS: MockFinding[] = [...MOCK_FINDINGS, ...EXTRA_FINDINGS];

const FULL_STRENGTHS: MockAuditReportStrength[] =
  MOCK_STRENGTH_CARDS_REPORT.map(
    ({
      strengthId,
      title,
      description,
      category,
      aiConfidence,
      impactLevel,
      screenshotUrl,
      screenshotAlt,
    }) => ({
      strengthId,
      title,
      description,
      category,
      aiConfidence,
      impactLevel,
      screenshotUrl,
      screenshotAlt,
    }),
  );

const FULL_RECOMMENDATIONS: MockAuditReportRecommendation[] =
  MOCK_RECOMMENDATION_CARDS_REPORT.map(
    ({
      recommendationId,
      title,
      description,
      category,
      severity,
      priority,
      estimatedImpact,
      effort,
      aiConfidence,
      findingId,
      learnMoreHref,
      showBeforeAfterPlaceholder,
    }) => ({
      recommendationId,
      title,
      description,
      category,
      severity,
      priority,
      estimatedImpact,
      effort,
      aiConfidence,
      findingId,
      learnMoreHref,
      showBeforeAfterPlaceholder,
    }),
  );

export const MOCK_AUDIT_REPORT_FULL: MockAuditReportFull = {
  auditId: "audit-report-acme-1",
  summary: {
    websiteName: "acme.studio",
    websiteUrl: "https://acme.studio",
    auditDate: "2026-07-28T14:20:00.000Z",
    auditType: "website",
    planUsed: "pro",
    blurb:
      "Acme’s marketing site has a strong first impression, with clear hierarchy and readable navigation. The biggest gaps are accessibility contrast, form error clarity, and a few mobile tap-target issues that can slow conversion.",
  },
  overall: {
    score: 72,
    summary:
      "Solid foundations with clear opportunities in accessibility and conversion clarity.",
    lastUpdated: "2026-07-28T14:20:00.000Z",
    auditType: "url",
  },
  categories: [
    { category: "accessibility", score: 64, trend: "down", trendDelta: 4 },
    { category: "usability", score: 78, trend: "up", trendDelta: 3 },
    { category: "performance", score: 70, trend: "flat", trendDelta: 0 },
    { category: "seo", score: 68, trend: "up", trendDelta: 2 },
    { category: "visual_design", score: 81, trend: "up", trendDelta: 1 },
    { category: "trust", score: 74, trend: "flat", trendDelta: 0 },
  ],
  findings: FULL_FINDINGS,
  strengths: FULL_STRENGTHS,
  recommendations: FULL_RECOMMENDATIONS,
  totals: {
    findings: FULL_FINDINGS.length,
    recommendations: FULL_RECOMMENDATIONS.length,
    strengths: FULL_STRENGTHS.length,
  },
};

/** Teaser totals for Guest conversion UI (marketing counts). */
const GUEST_TEASER_TOTALS: MockAuditReportTotals = {
  findings: 37,
  recommendations: 24,
  strengths: 12,
};

export const MOCK_AUDIT_REPORT_GUEST_PREVIEW: MockAuditReportPreview = {
  auditId: MOCK_AUDIT_REPORT_FULL.auditId,
  summary: {
    ...MOCK_AUDIT_REPORT_FULL.summary,
    planUsed: "free",
  },
  overall: MOCK_AUDIT_REPORT_FULL.overall,
  categories: MOCK_AUDIT_REPORT_FULL.categories,
  findings: FULL_FINDINGS.slice(0, 3),
  strengths: FULL_STRENGTHS.slice(0, 2),
  recommendations: FULL_RECOMMENDATIONS.slice(0, 1),
  totals: GUEST_TEASER_TOTALS,
  locked: {
    findings: GUEST_TEASER_TOTALS.findings - 3,
    recommendations: GUEST_TEASER_TOTALS.recommendations - 1,
    strengths: GUEST_TEASER_TOTALS.strengths - 2,
  },
};

export const MOCK_AUDIT_REPORT_FREE_PREVIEW: MockAuditReportPreview = {
  auditId: MOCK_AUDIT_REPORT_FULL.auditId,
  summary: {
    ...MOCK_AUDIT_REPORT_FULL.summary,
    planUsed: "free",
  },
  overall: MOCK_AUDIT_REPORT_FULL.overall,
  categories: MOCK_AUDIT_REPORT_FULL.categories,
  findings: FULL_FINDINGS.slice(0, 5),
  strengths: FULL_STRENGTHS.slice(0, 3),
  recommendations: FULL_RECOMMENDATIONS.slice(0, 2),
  totals: {
    findings: FULL_FINDINGS.length,
    recommendations: FULL_RECOMMENDATIONS.length,
    strengths: FULL_STRENGTHS.length,
  },
  locked: {
    findings: Math.max(0, FULL_FINDINGS.length - 5),
    recommendations: Math.max(0, FULL_RECOMMENDATIONS.length - 2),
    strengths: Math.max(0, FULL_STRENGTHS.length - 3),
  },
};

/** Empty / not-found fixture for SCREEN-010 empty state. */
export const MOCK_AUDIT_REPORT_EMPTY_ID = "audit-report-missing";
