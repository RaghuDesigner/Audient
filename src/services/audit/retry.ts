import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";

import {
  AUDIT_FAILURE_CATALOG,
  type AuditFailureCode,
  isAuditFailureCode,
} from "@/config/audit-failure";
import { loadAccountSnapshot } from "@/services/account";
import { AuditPermissionError } from "@/services/audit-permissions";
import { createAuditForUser } from "@/services/audit/create";
import { fetchAuditForUser } from "@/services/audit/map";
import { MAX_AUDIT_ATTEMPT_COUNT } from "@/services/audit/stuck";
import type { CreateAuditResult } from "@/types/audit";

/**
 * Retry a failed audit: ownership + FAILED status + credit re-auth via create.
 * Preserves failure info on the original row; new row links retry_of_audit_id.
 */
export async function retryFailedAudit(
  supabase: SupabaseClient,
  authUser: User,
  auditId: string,
): Promise<CreateAuditResult> {
  const account = await loadAccountSnapshot(supabase, authUser);
  if (!account) {
    throw new AuditPermissionError(
      "ACCOUNT_MISSING",
      "Account is not ready.",
      404,
    );
  }

  const prior = await fetchAuditForUser(supabase, auditId, account.appUserId);
  if (!prior) {
    throw new AuditPermissionError("AUDIT_NOT_FOUND", "Audit not found.", 404);
  }

  if (prior.status !== "FAILED") {
    throw new AuditPermissionError(
      "RETRY_NOT_ALLOWED",
      "Only failed audits can be retried.",
      409,
    );
  }

  if (prior.attemptCount >= MAX_AUDIT_ATTEMPT_COUNT) {
    throw new AuditPermissionError(
      "RETRY_NOT_ALLOWED",
      "Maximum audit retry attempts reached.",
      403,
    );
  }

  const code = prior.failureCode;
  if (code && isAuditFailureCode(code)) {
    const def = AUDIT_FAILURE_CATALOG[code as AuditFailureCode];
    if (!def.retryAllowed) {
      throw new AuditPermissionError(
        "RETRY_NOT_ALLOWED",
        "This failure cannot be retried.",
        403,
      );
    }
  }

  const created = await createAuditForUser(supabase, authUser, {
    inputType: prior.inputType,
    websiteUrl: prior.websiteUrl,
    primaryAssetId: prior.primaryAssetId,
    workspaceId: prior.workspaceId,
    correlationId: prior.correlationId
      ? `${prior.correlationId}-retry`
      : undefined,
  });

  await supabase
    .from("audits")
    .update({
      retry_of_audit_id: prior.id,
      attempt_count: prior.attemptCount + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", created.audit.id)
    .eq("user_id", account.appUserId);

  return {
    ...created,
    audit: {
      ...created.audit,
      retryOfAuditId: prior.id,
      attemptCount: prior.attemptCount + 1,
    },
  };
}
