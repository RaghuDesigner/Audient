import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { AuditFailureCode } from "@/config/audit-failure";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logInfo, logWarn } from "@/lib/log";
import { failAudit } from "@/services/audit/create";

/** Audits claimed longer than this are considered stuck. */
export const STUCK_PROCESSING_MS = 10 * 60 * 1000;

/** Max user-initiated retry chain length (attempt_count on new row). */
export const MAX_AUDIT_ATTEMPT_COUNT = 3;

/**
 * If audit is PROCESSING past the stuck threshold, fail it with a diagnosable code.
 * Uses service-role read for claimed_at; fail via existing failAudit path.
 * Returns true when a stuck audit was failed.
 */
export async function reclaimStuckProcessingAudit(
  supabase: SupabaseClient,
  auditId: string,
  appUserId: string,
): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("audits")
    .select("id, status, claimed_at, user_id")
    .eq("id", auditId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return false;
  const row = data as {
    id: string;
    status: string;
    claimed_at: string | null;
    user_id: string;
  };

  if (row.status !== "PROCESSING" || !row.claimed_at) return false;
  if (row.user_id !== appUserId) return false;

  const claimedAt = Date.parse(row.claimed_at);
  if (!Number.isFinite(claimedAt)) return false;
  if (Date.now() - claimedAt < STUCK_PROCESSING_MS) return false;

  logWarn("audit.stuck_reclaimed", {
    auditId,
    userId: appUserId,
    claimedAt: row.claimed_at,
  });

  const code: AuditFailureCode = "AI_TIMEOUT";
  await failAudit(supabase, {
    auditId,
    appUserId,
    code,
    message:
      "This audit was stuck in processing and was marked failed. Please retry.",
  });
  logInfo("audit.stuck_failed", { auditId, userId: appUserId, code });
  return true;
}
