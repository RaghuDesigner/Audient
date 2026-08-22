import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";

import {
  AUDIT_FAILURE_CATALOG,
  type AuditFailureCode,
} from "@/config/audit-failure";
import {
  accountAllowsUrlAudit,
  accountHasCredits,
  loadAccountSnapshot,
} from "@/services/account";
import { AuditPermissionError } from "@/services/audit-permissions";
import {
  AUDIT_SELECT,
  mapAuditRow,
} from "@/services/audit/map";
import {
  CreditMutationError,
  deductCreditsForAudit,
  refundCreditsForFailedAudit,
} from "@/services/credits/mutate";
import {
  notifyAuditCompleted,
  notifyAuditFailed,
  notifyCreditRefunded,
} from "@/services/notification/emit";
import { resolveWorkspaceIdForAuditCreate } from "@/services/workspace/membership";
import type {
  AuditRecord,
  CreateAuditInput,
  CreateAuditResult,
} from "@/types/audit";
import { validateHttpsUrl } from "@/utils/url-validation";

type AuditRow = Parameters<typeof mapAuditRow>[0];

function resolveCost(
  inputType: CreateAuditInput["inputType"],
  screenshotCost: number,
  urlCost: number | null,
): number {
  if (inputType === "URL") {
    if (urlCost == null) {
      throw new AuditPermissionError(
        "URL_AUDIT_FORBIDDEN",
        "URL audits require Pro or Business.",
        403,
      );
    }
    return urlCost;
  }
  return screenshotCost;
}

/**
 * Create authenticated audit: auth → membership → permission → credits → row.
 * Ownership always from session-derived app user id.
 */
export async function createAuditForUser(
  supabase: SupabaseClient,
  authUser: User,
  input: CreateAuditInput,
): Promise<CreateAuditResult> {
  const account = await loadAccountSnapshot(supabase, authUser);
  if (!account) {
    throw new AuditPermissionError(
      "ACCOUNT_MISSING",
      "Account is not ready.",
      404,
    );
  }

  if (
    account.membershipStatus === "cancelled" ||
    account.membershipStatus === "expired"
  ) {
    throw new AuditPermissionError(
      "MEMBERSHIP_INACTIVE",
      "Membership is not active.",
      403,
    );
  }

  const inputType = input.inputType;
  if (inputType !== "SCREENSHOT" && inputType !== "URL") {
    throw new AuditPermissionError(
      "INVALID_INPUT",
      "Unsupported audit input type.",
      400,
    );
  }

  let websiteUrl: string | null = null;
  if (inputType === "URL") {
    if (!accountAllowsUrlAudit(account)) {
      throw new AuditPermissionError(
        "URL_AUDIT_FORBIDDEN",
        "URL audits require Pro or Business.",
        403,
      );
    }
    const raw = input.websiteUrl?.trim() ?? "";
    const validated = validateHttpsUrl(raw);
    if (!validated.ok) {
      throw new AuditPermissionError(
        "INVALID_URL",
        "Enter a valid public https:// URL.",
        400,
      );
    }
    websiteUrl = validated.href;
  }

  const cost = resolveCost(
    inputType,
    account.limits.screenshotCost,
    account.limits.urlCost,
  );

  if (!accountHasCredits(account, cost)) {
    throw new AuditPermissionError(
      "INSUFFICIENT_CREDITS",
      "Not enough credits for this audit.",
      402,
    );
  }

  const correlationId =
    input.correlationId?.trim() ||
    `aud-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  const workspaceId = await resolveWorkspaceIdForAuditCreate(
    account.appUserId,
    input.workspaceId,
  );

  const insertPayload = {
    user_id: account.appUserId,
    workspace_id: workspaceId,
    guest_session_id: null,
    input_type: inputType,
    website_url: websiteUrl,
    status: "QUEUED" as const,
    credits_cost: cost,
    progress_percent: 0,
    attempt_count: 1,
    correlation_id: correlationId,
    primary_asset_id: input.primaryAssetId ?? null,
  };

  const { data: inserted, error: insertError } = await supabase
    .from("audits")
    .insert(insertPayload)
    .select(AUDIT_SELECT)
    .single();

  if (insertError || !inserted) {
    throw new AuditPermissionError(
      "AUDIT_CREATE_FAILED",
      "Unable to create audit.",
      500,
    );
  }

  const audit = mapAuditRow(inserted as AuditRow);

  let creditsRemaining: number | null = account.credits.remaining - cost;
  try {
    const deducted = await deductCreditsForAudit({
      appUserId: account.appUserId,
      auditId: audit.id,
      cost,
    });
    creditsRemaining = deducted.balanceAfter;
  } catch (error) {
    await supabase
      .from("audits")
      .update({
        deleted_at: new Date().toISOString(),
        status: "FAILED",
        error_message: "Credit authorization failed",
        failure_code: "INTERNAL_ERROR",
        failed_at: new Date().toISOString(),
      })
      .eq("id", audit.id)
      .eq("user_id", account.appUserId);

    if (error instanceof CreditMutationError) {
      throw new AuditPermissionError(error.code, error.message, error.status);
    }
    throw error;
  }

  if (input.simulateFailure) {
    await supabase
      .from("audits")
      .update({
        summary: "__stub_fail__",
        updated_at: new Date().toISOString(),
      })
      .eq("id", audit.id)
      .eq("user_id", account.appUserId);
  }

  return { audit, creditsRemaining };
}

/**
 * Claim QUEUED → PROCESSING (worker-compatible).
 * Prefer authenticated user client (RLS); no service-role required.
 */
export async function claimAudit(
  supabase: SupabaseClient,
  auditId: string,
  workerId = "stub-processor",
): Promise<AuditRecord | null> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("audits")
    .update({
      status: "PROCESSING",
      claimed_at: now,
      started_at: now,
      worker_id: workerId,
      progress_percent: 10,
      updated_at: now,
    })
    .eq("id", auditId)
    .eq("status", "QUEUED")
    .is("deleted_at", null)
    .select(AUDIT_SELECT)
    .maybeSingle();

  if (error || !data) return null;
  return mapAuditRow(data as AuditRow);
}

/**
 * Complete PROCESSING → COMPLETED with optional scores.
 * Prefer authenticated user client (RLS).
 */
export async function completeAudit(
  supabase: SupabaseClient,
  auditId: string,
  options?: {
    overallScore?: number | null;
    summary?: string | null;
  },
): Promise<AuditRecord | null> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("audits")
    .update({
      status: "COMPLETED",
      progress_percent: 100,
      completed_at: now,
      overall_score: options?.overallScore ?? null,
      summary: options?.summary ?? null,
      updated_at: now,
      worker_id: null,
    })
    .eq("id", auditId)
    .in("status", ["PROCESSING", "QUEUED"])
    .is("deleted_at", null)
    .select(AUDIT_SELECT)
    .maybeSingle();

  if (error || !data) return null;
  const completed = mapAuditRow(data as AuditRow);
  await notifyAuditCompleted({
    appUserId: completed.userId,
    auditId: completed.id,
    overallScore: completed.overallScore,
  });
  return completed;
}

/**
 * Fail audit + refund when catalog says refundEligible.
 * Audit row update via user-scoped client; credit refund via service role.
 */
export async function failAudit(
  supabase: SupabaseClient,
  input: {
    auditId: string;
    appUserId: string;
    code: AuditFailureCode;
    message?: string;
  },
): Promise<AuditRecord | null> {
  const def = AUDIT_FAILURE_CATALOG[input.code];
  const message = input.message ?? def.description;
  const now = new Date().toISOString();

  const { data: before } = await supabase
    .from("audits")
    .select(AUDIT_SELECT)
    .eq("id", input.auditId)
    .eq("user_id", input.appUserId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!before) return null;
  const prior = mapAuditRow(before as AuditRow);
  if (prior.status === "FAILED" || prior.status === "COMPLETED") {
    return prior;
  }

  const { data, error } = await supabase
    .from("audits")
    .update({
      status: "FAILED",
      failure_code: input.code,
      error_message: message,
      failed_at: now,
      completed_at: now,
      progress_percent: 100,
      updated_at: now,
      worker_id: null,
    })
    .eq("id", input.auditId)
    .eq("user_id", input.appUserId)
    .is("deleted_at", null)
    .select(AUDIT_SELECT)
    .maybeSingle();

  if (error || !data) return null;
  const failed = mapAuditRow(data as AuditRow);

  if (def.refundEligible && failed.creditsCost > 0) {
    const refund = await refundCreditsForFailedAudit({
      appUserId: input.appUserId,
      auditId: input.auditId,
      cost: failed.creditsCost,
      note: `Refund: ${input.code}`,
    });
    if (refund.refunded) {
      await notifyCreditRefunded({
        appUserId: input.appUserId,
        auditId: input.auditId,
        credits: failed.creditsCost,
      });
    }
  }

  await notifyAuditFailed({
    appUserId: input.appUserId,
    auditId: input.auditId,
    failureCode: input.code,
  });

  return failed;
}
