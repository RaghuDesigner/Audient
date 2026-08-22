import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  AUDIT_SELECT,
  auditTitle,
  fetchAuditForUser,
  mapAuditRow,
} from "@/services/audit/map";
import type { AuditListItem, AuditRecord } from "@/types/audit";

type AuditRow = Parameters<typeof mapAuditRow>[0];

export async function getAuditForUser(
  supabase: SupabaseClient,
  auditId: string,
  appUserId: string,
): Promise<AuditRecord | null> {
  return fetchAuditForUser(supabase, auditId, appUserId);
}

export async function listAuditsForUser(
  supabase: SupabaseClient,
  appUserId: string,
  options?: { limit?: number; offset?: number; workspaceId?: string },
): Promise<AuditListItem[]> {
  const limit = Math.min(Math.max(options?.limit ?? 50, 1), 100);
  const offset = Math.max(options?.offset ?? 0, 0);

  let query = supabase
    .from("audits")
    .select(AUDIT_SELECT)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (options?.workspaceId) {
    // Workspace members see all audits in the workspace (RLS + membership).
    query = query.eq("workspace_id", options.workspaceId);
  } else {
    // Default: personal history (own audits only).
    query = query.eq("user_id", appUserId);
  }

  const { data, error } = await query;

  if (error || !data) return [];

  return (data as AuditRow[]).map((row) => {
    const audit = mapAuditRow(row);
    return {
      id: audit.id,
      inputType: audit.inputType,
      websiteUrl: audit.websiteUrl,
      status: audit.status,
      overallScore: audit.overallScore,
      creditsCost: audit.creditsCost,
      createdAt: audit.createdAt,
      completedAt: audit.completedAt,
      failureCode: audit.failureCode,
      errorMessage: audit.errorMessage,
      title: auditTitle(audit),
    };
  });
}
