import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { AuditFailureCode } from "@/config/audit-failure";
import {
  claimAudit,
  completeAudit,
  failAudit,
} from "@/services/audit/create";
import { ensurePlaceholderReport } from "@/services/report/foundation";

/**
 * No-AI lifecycle stub for BACKEND-005 verification.
 * Uses the authenticated server Supabase client (RLS) — not service role.
 * Credit refund on fail still uses service role inside failAudit → mutate.
 */
export async function runAuditLifecycleStub(
  supabase: SupabaseClient,
  auditId: string,
): Promise<void> {
  const { data } = await supabase
    .from("audits")
    .select("id, user_id, status, summary, overall_score")
    .eq("id", auditId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!data) return;
  const row = data as {
    id: string;
    user_id: string;
    status: string;
    summary: string | null;
    overall_score: number | null;
  };

  if (row.status === "COMPLETED" || row.status === "FAILED") return;

  if (row.status === "QUEUED") {
    await claimAudit(supabase, auditId, "backend-005-stub");
  }

  await new Promise((r) => setTimeout(r, 800));

  const { data: mid } = await supabase
    .from("audits")
    .select("id, user_id, status, summary, overall_score")
    .eq("id", auditId)
    .maybeSingle();

  const current = mid as typeof row | null;
  if (!current || current.status === "COMPLETED" || current.status === "FAILED") {
    return;
  }

  const shouldFail = current.summary === "__stub_fail__";
  if (shouldFail) {
    const code: AuditFailureCode = "AI_UNAVAILABLE";
    await failAudit(supabase, {
      auditId,
      appUserId: current.user_id,
      code,
      message:
        "Stub processor simulated failure (AI deferred). Credits refunded when eligible.",
    });
    return;
  }

  // Report.overall_score is NOT NULL — use audit score when present (AI later).
  await ensurePlaceholderReport(supabase, auditId, current.overall_score);
  await completeAudit(supabase, auditId, {
    overallScore: current.overall_score,
    summary:
      "Lifecycle complete. AI findings will be added when the audit worker ships.",
  });
}

/**
 * Fire-and-forget stub after create/poll. Pass the request-scoped user client.
 */
export function scheduleAuditLifecycleStub(
  supabase: SupabaseClient,
  auditId: string,
): void {
  void runAuditLifecycleStub(supabase, auditId).catch((error) => {
    console.error("[audit-stub]", auditId, error);
  });
}
