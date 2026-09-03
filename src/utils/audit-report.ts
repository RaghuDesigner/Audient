/**
 * Audit Report helpers — SCREEN-010 / M02.
 * Tier gates and mock payload selection — no React / no API.
 */

import {
  AUDIT_REPORT_GATES,
  AUDIT_REPORT_TIER_LIMITS,
  type AuditReportTier,
} from "@/config/audit-report";
import {
  MOCK_AUDIT_REPORT_FREE_PREVIEW,
  MOCK_AUDIT_REPORT_FULL,
  MOCK_AUDIT_REPORT_GUEST_PREVIEW,
  type MockAuditReportFull,
  type MockAuditReportPreview,
} from "@/data/mock-audit-report";
import type { AuthPlanTier } from "@/types/auth";

export type AuditReportView =
  | { kind: "full"; data: MockAuditReportFull }
  | { kind: "preview"; data: MockAuditReportPreview };

/** Map auth plan tier → report visibility tier. */
export function resolveAuditReportTier(
  isGuest: boolean,
  planTier?: AuthPlanTier | null,
): AuditReportTier {
  if (isGuest || !planTier) return "guest";
  if (planTier === "ENTERPRISE") return "business";
  if (planTier === "PRO") return "pro";
  return "free";
}

export function canExportAuditReportPdf(tier: AuditReportTier): boolean {
  return AUDIT_REPORT_GATES.exportPdf[tier];
}

export function canShareAuditReport(tier: AuditReportTier): boolean {
  return AUDIT_REPORT_GATES.shareReport[tier];
}

export function canCompareAuditReports(tier: AuditReportTier): boolean {
  return AUDIT_REPORT_GATES.compareReports[tier];
}

export function shouldShowAuditReportUpgradeBanner(
  tier: AuditReportTier,
): boolean {
  return AUDIT_REPORT_GATES.showUpgradeBanner[tier];
}

export function auditReportTierLimits(tier: AuditReportTier) {
  return AUDIT_REPORT_TIER_LIMITS[tier];
}

/** Slice a real report payload to tier visibility limits (no mock content). */
export function applyAuditReportTierLimits(
  data: MockAuditReportFull,
  tier: AuditReportTier,
): MockAuditReportFull {
  const limits = AUDIT_REPORT_TIER_LIMITS[tier];
  const findingsLimit =
    limits.findings === "all" ? data.findings.length : limits.findings;
  const recommendationsLimit =
    limits.recommendations === "all"
      ? data.recommendations.length
      : limits.recommendations;
  const strengthsLimit =
    limits.strengths === "all" ? data.strengths.length : limits.strengths;

  return {
    ...data,
    findings: data.findings.slice(0, findingsLimit),
    recommendations: data.recommendations.slice(0, recommendationsLimit),
    strengths: data.strengths.slice(0, strengthsLimit),
    totals: data.totals,
  };
}

/** Locked teaser counts from full totals vs tier limits. */
export function lockedCountsForAuditReportTier(
  data: MockAuditReportFull | null,
  tier: AuditReportTier,
): { findings: number; recommendations: number; strengths: number } {
  if (!data) return { findings: 0, recommendations: 0, strengths: 0 };
  const limits = AUDIT_REPORT_TIER_LIMITS[tier];
  return {
    findings:
      limits.findings === "all"
        ? 0
        : Math.max(0, data.totals.findings - limits.findings),
    recommendations:
      limits.recommendations === "all"
        ? 0
        : Math.max(0, data.totals.recommendations - limits.recommendations),
    strengths:
      limits.strengths === "all"
        ? 0
        : Math.max(0, data.totals.strengths - limits.strengths),
  };
}

/** Whether a recommendation index (0-based) is expandable for the tier. */
export function canExpandAuditRecommendation(
  tier: AuditReportTier,
  index: number,
): boolean {
  const limit = AUDIT_REPORT_TIER_LIMITS[tier].recommendations;
  if (limit === "all") return true;
  return index < limit;
}

/**
 * Select the Phase-1 mock payload for a tier.
 * Guest/Free receive preview-safe slices only.
 */
export function getMockAuditReportForTier(
  tier: AuditReportTier,
  auditId?: string,
): AuditReportView {
  if (tier === "guest") {
    const data = {
      ...MOCK_AUDIT_REPORT_GUEST_PREVIEW,
      auditId: auditId ?? MOCK_AUDIT_REPORT_GUEST_PREVIEW.auditId,
    };
    return { kind: "preview", data };
  }

  if (tier === "free") {
    const data = {
      ...MOCK_AUDIT_REPORT_FREE_PREVIEW,
      auditId: auditId ?? MOCK_AUDIT_REPORT_FREE_PREVIEW.auditId,
    };
    return { kind: "preview", data };
  }

  const data: MockAuditReportFull = {
    ...MOCK_AUDIT_REPORT_FULL,
    auditId: auditId ?? MOCK_AUDIT_REPORT_FULL.auditId,
    summary: {
      ...MOCK_AUDIT_REPORT_FULL.summary,
      planUsed: tier === "business" ? ("business" as const) : ("pro" as const),
    },
  };
  return { kind: "full", data };
}

export function lockedCountsFromPreview(
  preview: MockAuditReportPreview,
): MockAuditReportPreview["locked"] {
  return preview.locked;
}

/** Map report audit type label → Overall Score Card auditType. */
export function toOverallScoreAuditType(
  auditType: "website" | "screenshot",
): "url" | "image" {
  return auditType === "website" ? "url" : "image";
}
