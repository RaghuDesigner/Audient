import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { AuditInputType, AuditRecord, AuditStatus } from "@/types/audit";
import type { AuditFailureCode } from "@/config/audit-failure";

type AuditRow = {
  id: string;
  user_id: string;
  workspace_id: string | null;
  input_type: AuditInputType;
  website_url: string | null;
  status: AuditStatus;
  credits_cost: number;
  overall_score: number | null;
  summary: string | null;
  error_message: string | null;
  failure_code: string | null;
  progress_percent: number;
  attempt_count: number;
  claimed_at: string | null;
  failed_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  correlation_id: string | null;
  retry_of_audit_id: string | null;
  primary_asset_id: string | null;
};

export function mapAuditRow(row: AuditRow): AuditRecord {
  return {
    id: row.id,
    userId: row.user_id,
    workspaceId: row.workspace_id ?? null,
    inputType: row.input_type,
    websiteUrl: row.website_url,
    status: row.status,
    creditsCost: row.credits_cost,
    overallScore: row.overall_score,
    summary: row.summary,
    errorMessage: row.error_message,
    failureCode: row.failure_code as AuditFailureCode | string | null,
    progressPercent: row.progress_percent,
    attemptCount: row.attempt_count,
    claimedAt: row.claimed_at,
    failedAt: row.failed_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    correlationId: row.correlation_id,
    retryOfAuditId: row.retry_of_audit_id,
    primaryAssetId: row.primary_asset_id,
  };
}

export const AUDIT_SELECT =
  "id, user_id, workspace_id, input_type, website_url, status, credits_cost, overall_score, summary, error_message, failure_code, progress_percent, attempt_count, claimed_at, failed_at, started_at, completed_at, created_at, updated_at, correlation_id, retry_of_audit_id, primary_asset_id";

/**
 * Load audit by id. Authorization via RLS `owns_audit` (creator or active
 * workspace member). `appUserId` retained for call-site clarity; not used to
 * filter after BACKEND-009B workspace scoping.
 */
export async function fetchAuditForUser(
  supabase: SupabaseClient,
  auditId: string,
  appUserId: string,
): Promise<AuditRecord | null> {
  void appUserId;
  const { data, error } = await supabase
    .from("audits")
    .select(AUDIT_SELECT)
    .eq("id", auditId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;
  return mapAuditRow(data as AuditRow);
}

export function auditTitle(audit: Pick<AuditRecord, "websiteUrl" | "inputType">): string {
  if (audit.websiteUrl) {
    try {
      return new URL(audit.websiteUrl).hostname.replace(/^www\./, "");
    } catch {
      return audit.websiteUrl;
    }
  }
  return audit.inputType === "SCREENSHOT" ? "Screenshot audit" : "Website audit";
}
