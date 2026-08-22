import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  AuditReportFinding,
  AuditReportFoundation,
  AuditReportRecommendation,
  AuditStatus,
} from "@/types/audit";

type ReportRow = {
  id: string;
  audit_id: string;
  overall_score: number;
  category_scores: Record<string, number> | null;
  ai_summary: string | null;
  report_json: Record<string, unknown> | null;
  created_at: string;
};

type AuditMeta = {
  id: string;
  status: AuditStatus;
  input_type: "SCREENSHOT" | "URL";
  website_url: string | null;
  created_at: string;
  completed_at: string | null;
  overall_score: number | null;
};

type RecommendationRow = {
  id: string;
  title: string;
  description: string | null;
  recommendation: string | null;
  severity: string;
  category: string;
  priority: string | null;
  business_impact: string | null;
  screenshot_ref: string | null;
};

/**
 * `reports.overall_score` is NOT NULL (0–100).
 * Prefer audit/worker-provided score; clamp into range. Does not invent UX quality.
 */
export function resolveReportOverallScore(
  score: number | null | undefined,
): number {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return 0;
  }
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Ensure a single report row for an audit (unique audit_id). Idempotent.
 * Uses the authenticated (or trusted) Supabase client — RLS owns_audit.
 */
export async function ensurePlaceholderReport(
  supabase: SupabaseClient,
  auditId: string,
  overallScore: number | null | undefined,
): Promise<string> {
  const score = resolveReportOverallScore(overallScore);

  const { data: existing } = await supabase
    .from("reports")
    .select("id, overall_score")
    .eq("audit_id", auditId)
    .is("deleted_at", null)
    .maybeSingle();

  if (existing?.id) {
    const existingScore = (existing as { overall_score?: number }).overall_score;
    if (
      typeof overallScore === "number" &&
      !Number.isNaN(overallScore) &&
      existingScore === 0 &&
      score > 0
    ) {
      await supabase
        .from("reports")
        .update({
          overall_score: score,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    }
    return existing.id as string;
  }

  const { data, error } = await supabase
    .from("reports")
    .insert({
      audit_id: auditId,
      overall_score: score,
      category_scores: {},
      ai_summary:
        "Audit lifecycle complete. AI analysis will populate this report in a later phase.",
      report_json: {
        placeholder: true,
        phase: "BACKEND-005",
        unscored: typeof overallScore !== "number",
        findings: [],
        recommendations: [],
      },
    })
    .select("id")
    .single();

  if (error || !data) {
    const { data: again } = await supabase
      .from("reports")
      .select("id")
      .eq("audit_id", auditId)
      .is("deleted_at", null)
      .maybeSingle();
    if (again?.id) return again.id as string;
    throw new Error("Unable to create report foundation");
  }

  return data.id as string;
}

function emptyFoundation(meta: AuditMeta): AuditReportFoundation {
  return {
    auditId: meta.id,
    reportId: "",
    overallScore: meta.overall_score,
    categoryScores: null,
    aiSummary: null,
    reportJson: null,
    status: meta.status,
    inputType: meta.input_type,
    websiteUrl: meta.website_url,
    createdAt: meta.created_at,
    completedAt: meta.completed_at,
    placeholder: true,
    findings: [],
    recommendations: [],
  };
}

function parseJsonFindings(
  json: Record<string, unknown> | null,
): AuditReportFinding[] {
  if (!json || !Array.isArray(json.findings)) return [];
  return (json.findings as unknown[]).flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const title = typeof row.title === "string" ? row.title : null;
    const description =
      typeof row.description === "string" ? row.description : null;
    if (!title || !description) return [];
    return [
      {
        id: `json-finding-${index + 1}`,
        title,
        description,
        severity:
          typeof row.severity === "string" ? row.severity : "MEDIUM",
        category:
          typeof row.category === "string" ? row.category : "NAVIGATION",
        evidence:
          typeof row.evidence === "string"
            ? row.evidence
            : row.evidence === null
              ? null
              : null,
        evidenceType:
          typeof row.evidence_type === "string" ? row.evidence_type : null,
        confidence: typeof row.confidence === "string" ? row.confidence : null,
        userImpact:
          typeof row.user_impact === "string" ? row.user_impact : null,
      },
    ];
  });
}

function parseJsonRecommendations(
  json: Record<string, unknown> | null,
): AuditReportRecommendation[] {
  if (!json || !Array.isArray(json.recommendations)) return [];
  return (json.recommendations as unknown[]).flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const title = typeof row.title === "string" ? row.title : null;
    const description =
      typeof row.description === "string" ? row.description : null;
    if (!title || !description) return [];
    return [
      {
        id: `json-rec-${index + 1}`,
        title,
        description,
        priority:
          typeof row.priority === "string" ? row.priority : "MEDIUM",
        category:
          typeof row.category === "string" ? row.category : "NAVIGATION",
        expectedImprovement:
          typeof row.expectedImprovement === "string"
            ? row.expectedImprovement
            : null,
        findingIndex:
          typeof row.findingIndex === "number" ? row.findingIndex : null,
      },
    ];
  });
}

export async function getReportFoundationForUser(
  supabase: SupabaseClient,
  auditId: string,
  appUserId: string,
): Promise<AuditReportFoundation | null> {
  void appUserId;
  // RLS owns_audit: creator or active workspace member.
  const { data: audit, error: auditError } = await supabase
    .from("audits")
    .select(
      "id, status, input_type, website_url, created_at, completed_at, overall_score",
    )
    .eq("id", auditId)
    .is("deleted_at", null)
    .maybeSingle();

  if (auditError || !audit) return null;
  const meta = audit as AuditMeta;

  if (meta.status !== "COMPLETED") {
    return emptyFoundation(meta);
  }

  const { data: report } = await supabase
    .from("reports")
    .select(
      "id, audit_id, overall_score, category_scores, ai_summary, report_json, created_at",
    )
    .eq("audit_id", auditId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!report) {
    return emptyFoundation(meta);
  }

  const row = report as ReportRow;
  const json = row.report_json;
  const placeholder =
    json == null ||
    (typeof json === "object" &&
      "placeholder" in json &&
      Boolean((json as { placeholder?: boolean }).placeholder));

  const { data: recRows } = await supabase
    .from("recommendations")
    .select(
      "id, title, description, recommendation, severity, category, priority, business_impact, screenshot_ref",
    )
    .eq("report_id", row.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  const dbRows = (recRows ?? []) as RecommendationRow[];

  let findings = parseJsonFindings(json);
  let recommendations = parseJsonRecommendations(json);

  if (dbRows.length > 0 && recommendations.length === 0) {
    recommendations = dbRows.map((r) => ({
      id: r.id,
      title: r.title,
      description: (r.recommendation ?? r.description ?? "").trim(),
      priority: r.priority ?? "MEDIUM",
      category: r.category,
      expectedImprovement: r.business_impact,
    }));
  }

  if (dbRows.length > 0 && findings.length === 0) {
    findings = dbRows.map((r) => ({
      id: r.id,
      title: r.title,
      description: (r.description ?? r.recommendation ?? "").trim(),
      severity: r.severity,
      category: r.category,
      evidence: r.screenshot_ref,
    }));
  }

  return {
    auditId: meta.id,
    reportId: row.id,
    overallScore: row.overall_score,
    categoryScores: row.category_scores,
    aiSummary: row.ai_summary,
    reportJson: row.report_json,
    status: meta.status,
    inputType: meta.input_type,
    websiteUrl: meta.website_url,
    createdAt: meta.created_at,
    completedAt: meta.completed_at,
    placeholder,
    findings,
    recommendations,
  };
}
