/**
 * Map AI / report foundation enums onto existing UI mock report shapes.
 */

import type { RecommendationCardPriority } from "@/config/recommendation-card";
import type { MockAuditReportFull } from "@/data/mock-audit-report";
import type { MockFinding } from "@/data/mock-findings";
import type { AuditReportFoundation } from "@/types/audit";
import { confidenceLevelToUi } from "@/utils/ai-confidence";
import {
  AUDIT_CATEGORIES,
  type AuditCategoryId,
} from "@/utils/category-score";
import {
  normalizeFindingSeverity,
  type FindingSeverity,
} from "@/utils/finding-severity";

const AI_CATEGORY_TO_UI: Record<string, AuditCategoryId> = {
  NAVIGATION: "usability",
  CTA: "usability",
  VISUAL_HIERARCHY: "visual_design",
  MOBILE_RESPONSIVENESS: "usability",
  COPY_MESSAGING: "seo",
  TRUST_SIGNALS: "trust",
  PAGE_SPEED: "performance",
  ACCESSIBILITY: "accessibility",
  CONVERSION_FLOW: "usability",
  accessibility: "accessibility",
  usability: "usability",
  performance: "performance",
  seo: "seo",
  visual_design: "visual_design",
  trust: "trust",
};

function mapCategory(raw: string): AuditCategoryId {
  return AI_CATEGORY_TO_UI[raw] ?? AI_CATEGORY_TO_UI[raw.toUpperCase()] ?? "usability";
}

function mapPriority(raw: string): RecommendationCardPriority {
  const key = raw.toUpperCase();
  if (key === "HIGH" || key === "P1") return "p1";
  if (key === "MEDIUM" || key === "P2") return "p2";
  if (key === "LOW" || key === "P3") return "p3";
  return "p2";
}

function mapSeverity(raw: string): FindingSeverity {
  if (raw.toUpperCase() === "INFO") return "low";
  return normalizeFindingSeverity(
    raw as Parameters<typeof normalizeFindingSeverity>[0],
  );
}

function toSummaryAuditType(
  inputType: AuditReportFoundation["inputType"],
): "website" | "screenshot" {
  return inputType === "URL" ? "website" : "screenshot";
}

function toOverallAuditType(
  inputType: AuditReportFoundation["inputType"],
): "url" | "image" {
  return inputType === "URL" ? "url" : "image";
}

function mapUiCategoryScores(
  categoryScores: Record<string, number> | null,
): MockAuditReportFull["categories"] {
  const buckets = new Map<AuditCategoryId, number[]>();
  for (const id of AUDIT_CATEGORIES) buckets.set(id, []);

  if (categoryScores) {
    for (const [key, value] of Object.entries(categoryScores)) {
      if (typeof value !== "number" || Number.isNaN(value)) continue;
      const ui = mapCategory(key);
      buckets.get(ui)?.push(Math.min(100, Math.max(0, Math.round(value))));
    }
  }

  return AUDIT_CATEGORIES.map((category) => {
    const values = buckets.get(category) ?? [];
    const score =
      values.length === 0
        ? 0
        : Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    return { category, score, trend: null, trendDelta: null };
  });
}

/**
 * Overlay API AI report onto a layout shell.
 * Returns null for placeholder reports — never merge placeholder with mock findings.
 */
export function overlayAuditReportFromFoundation(
  base: MockAuditReportFull,
  report: AuditReportFoundation,
): MockAuditReportFull | null {
  if (report.placeholder) {
    return null;
  }

  const findings: MockFinding[] = report.findings.map((f, index) => ({
    findingId: f.id || `finding-${index + 1}`,
    severity: mapSeverity(f.severity),
    title: f.title,
    description: f.description,
    thumbnailUrl: null,
    thumbnailAlt: null,
    affectedPage: f.evidence,
    category: mapCategory(f.category),
    recommendationPreview: f.userImpact ?? f.description.slice(0, 160),
    priority:
      mapSeverity(f.severity) === "critical" || mapSeverity(f.severity) === "high"
        ? "P1"
        : mapSeverity(f.severity) === "medium"
          ? "P2"
          : "P3",
    evidenceType: f.evidenceType ?? null,
    confidence: f.confidence ?? null,
    userImpact: f.userImpact ?? null,
  }));

  const findingById = new Map(findings.map((f) => [f.findingId, f]));
  const findingByIndex = new Map(report.findings.map((f, i) => [i, f]));

  const recommendations: MockAuditReportFull["recommendations"] =
    report.recommendations.map((r, index) => {
      const linkedByIndex =
        typeof r.findingIndex === "number"
          ? findingByIndex.get(r.findingIndex)
          : report.findings[index];
      const linkedFindingId =
        typeof r.findingIndex === "number"
          ? report.findings[r.findingIndex]?.id || `finding-${r.findingIndex + 1}`
          : report.findings[index]?.id || `finding-${index + 1}`;
      const linkedUiFinding = findingById.get(linkedFindingId);
      const conf = confidenceLevelToUi(linkedByIndex?.confidence ?? null);
      return {
        recommendationId: r.id || `rec-${index + 1}`,
        title: r.title,
        description: r.description,
        category: mapCategory(r.category),
        severity: mapSeverity(
          linkedByIndex?.severity ??
            (r.priority === "HIGH" ? "HIGH" : "MEDIUM"),
        ),
        priority: mapPriority(r.priority),
        estimatedImpact:
          r.priority.toUpperCase() === "HIGH"
            ? "high"
            : r.priority.toUpperCase() === "LOW"
              ? "low"
              : "medium",
        effort: null,
        aiConfidence: conf,
        findingId: linkedUiFinding?.findingId ?? linkedFindingId,
        learnMoreHref: null,
        showBeforeAfterPlaceholder: false,
      };
    });

  const categories = mapUiCategoryScores(report.categoryScores);

  return {
    ...base,
    auditId: report.auditId,
    summary: {
      ...base.summary,
      websiteName: report.websiteUrl
        ? (() => {
            try {
              return new URL(report.websiteUrl).hostname;
            } catch {
              return base.summary.websiteName;
            }
          })()
        : base.summary.websiteName,
      websiteUrl: report.websiteUrl ?? base.summary.websiteUrl,
      auditDate: report.completedAt ?? report.createdAt,
      auditType: toSummaryAuditType(report.inputType),
      blurb: report.aiSummary ?? base.summary.blurb,
    },
    overall: {
      score: report.overallScore ?? 0,
      summary: report.aiSummary ?? "",
      lastUpdated: report.completedAt ?? report.createdAt,
      auditType: toOverallAuditType(report.inputType),
    },
    categories,
    findings,
    recommendations,
    strengths: [],
    totals: {
      findings: findings.length,
      recommendations: recommendations.length,
      strengths: 0,
    },
  };
}

/**
 * Build a user-visible report solely from real API foundation data.
 * Returns null for placeholder / incomplete payloads — never invents findings.
 */
export function buildAuditReportFromFoundation(
  report: AuditReportFoundation,
  planUsed: MockAuditReportFull["summary"]["planUsed"] = "pro",
): MockAuditReportFull | null {
  if (report.placeholder) return null;

  let websiteName = "Audit";
  if (report.websiteUrl) {
    try {
      websiteName = new URL(report.websiteUrl).hostname;
    } catch {
      websiteName = report.websiteUrl;
    }
  } else if (report.inputType === "SCREENSHOT") {
    websiteName = "Screenshot audit";
  }

  const shell: MockAuditReportFull = {
    auditId: report.auditId,
    summary: {
      websiteName,
      websiteUrl: report.websiteUrl,
      auditDate: report.completedAt ?? report.createdAt,
      auditType: toSummaryAuditType(report.inputType),
      planUsed,
      blurb: report.aiSummary ?? "",
    },
    overall: {
      score: report.overallScore ?? 0,
      summary: report.aiSummary ?? "",
      lastUpdated: report.completedAt ?? report.createdAt,
      auditType: toOverallAuditType(report.inputType),
    },
    categories: [],
    findings: [],
    strengths: [],
    recommendations: [],
    totals: { findings: 0, recommendations: 0, strengths: 0 },
  };

  return overlayAuditReportFromFoundation(shell, report);
}
