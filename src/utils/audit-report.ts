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
