import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  AI_ISSUE_CATEGORIES,
  AI_PRIORITIES,
  AI_SEVERITIES,
  type AiAuditResultNormalized,
} from "@/lib/ai/schema";
import { clampScore } from "@/lib/ai/score";

const SEVERITY_SET = new Set<string>(AI_SEVERITIES);
const CATEGORY_SET = new Set<string>(AI_ISSUE_CATEGORIES);
const PRIORITY_SET = new Set<string>(AI_PRIORITIES);

/**
 * Persist AI audit result into reports + recommendations (findings).
 * Replaces any prior placeholder report for the audit (1:1).
 * Validates enum fields again before insert (defense in depth).
 */
export async function persistAiAuditReport(
  supabase: SupabaseClient,
  input: {
    auditId: string;
    overallScore: number;
    result: AiAuditResultNormalized;
  },
): Promise<{ reportId: string }> {
  const overallScore = clampScore(input.overallScore);
  const categoryScores = Object.fromEntries(
    Object.entries(input.result.categoryScores).map(([k, v]) => [
      k,
      clampScore(v),
    ]),
  );

  for (const finding of input.result.findings) {
    if (!SEVERITY_SET.has(finding.severity) || !CATEGORY_SET.has(finding.category)) {
      throw new Error("INVALID_FINDING_ENUM");
    }
  }
  for (const rec of input.result.recommendations) {
    if (
      !PRIORITY_SET.has(rec.priority) ||
      !CATEGORY_SET.has(rec.category)
    ) {
      throw new Error("INVALID_RECOMMENDATION_ENUM");
    }
  }

  const reportJson = {
    placeholder: false,
    phase: "BACKEND-011",
    principles: "BACKEND-011",
    unscored: false,
    provider: "openai",
    modelOverallScore: clampScore(input.result.overallScore),
    findings: input.result.findings,
    recommendations: input.result.recommendations,
  };

  const { data: existing } = await supabase
    .from("reports")
    .select("id")
    .eq("audit_id", input.auditId)
    .is("deleted_at", null)
    .maybeSingle();

  let reportId: string;

  if (existing?.id) {
    reportId = existing.id as string;
    const { error: updateError } = await supabase
      .from("reports")
      .update({
        overall_score: overallScore,
        category_scores: categoryScores,
        ai_summary: input.result.summary,
        report_json: reportJson,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId);
    if (updateError) {
      throw new Error("REPORT_PERSIST_FAILED");
    }

    await supabase.from("recommendations").delete().eq("report_id", reportId);
  } else {
    const { data: inserted, error: insertError } = await supabase
      .from("reports")
      .insert({
        audit_id: input.auditId,
        overall_score: overallScore,
        category_scores: categoryScores,
        ai_summary: input.result.summary,
        report_json: reportJson,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      throw new Error("REPORT_PERSIST_FAILED");
    }
    reportId = inserted.id as string;
  }

  const rows: Array<{
    report_id: string;
    category: string;
    severity: string;
    title: string;
    description: string;
    business_impact: string | null;
    recommendation: string;
    priority: string;
    screenshot_ref: string | null;
  }> = input.result.recommendations.map((rec) => {
    const linked =
      typeof rec.findingIndex === "number"
        ? input.result.findings[rec.findingIndex]
        : null;
    return {
      report_id: reportId,
      category: rec.category,
      severity: linked?.severity ?? "MEDIUM",
      title: rec.title.trim(),
      description: linked?.description ?? rec.description.trim(),
      business_impact:
        linked?.user_impact?.trim() ||
        rec.expectedImprovement.trim(),
      recommendation: rec.description.trim(),
      priority: rec.priority,
      screenshot_ref: linked?.evidence ?? null,
    };
  });

  const covered = new Set(
    input.result.recommendations
      .map((r) => r.findingIndex)
      .filter((i): i is number => typeof i === "number"),
  );
  input.result.findings.forEach((finding, index) => {
    if (covered.has(index)) return;
    rows.push({
      report_id: reportId,
      category: finding.category,
      severity: finding.severity,
      title: finding.title.trim(),
      description: finding.description.trim(),
      business_impact: finding.user_impact ?? finding.evidence ?? null,
      recommendation: finding.description.trim(),
      priority: "MEDIUM",
      screenshot_ref: finding.evidence ?? null,
    });
  });

  if (rows.length > 0) {
    const { error: recError } = await supabase
      .from("recommendations")
      .insert(rows);
    if (recError) {
      throw new Error("FINDINGS_PERSIST_FAILED");
    }
  }

  return { reportId };
}
