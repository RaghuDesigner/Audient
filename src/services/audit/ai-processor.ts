import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  AUDIT_FAILURE_CATALOG,
  type AuditFailureCode,
} from "@/config/audit-failure";
import { AiProviderError, runAiUxAudit } from "@/lib/ai/client";
import { hasOpenAiApiKey } from "@/lib/ai/env";
import { resolveOverallScore } from "@/lib/ai/score";
import { logError } from "@/lib/log";
import {
  claimAudit,
  completeAudit,
  failAudit,
} from "@/services/audit/create";
import { prepareAuditAiInput } from "@/services/audit/prepare-input";
import { fetchAuditForUser } from "@/services/audit/map";
import { reclaimStuckProcessingAudit } from "@/services/audit/stuck";
import { persistAiAuditReport } from "@/services/report/persist-ai-result";

function mapPrepareError(code: string): AuditFailureCode {
  switch (code) {
    case "SSRF_BLOCKED":
      return "SSRF_BLOCKED";
    case "CRAWL_TIMEOUT":
      return "CRAWL_TIMEOUT";
    case "SITE_BLOCKS_BOT":
      return "SITE_BLOCKS_BOT";
    case "URL_UNREACHABLE":
    case "INVALID_URL":
      return "URL_UNREACHABLE";
    case "SCREENSHOT_INVALID":
      return "SCREENSHOT_INVALID";
    case "PAGE_TOO_HEAVY":
      return "PAGE_TOO_HEAVY";
    default:
      return "INTERNAL_ERROR";
  }
}

function safeFailMessage(code: AuditFailureCode, override?: string): string {
  if (override && override.length > 0 && override.length < 280) {
    // Only allow known-safe prepare messages / catalog text — strip secrets.
    if (!/sk-|api[_-]?key|bearer\s/i.test(override)) {
      return override;
    }
  }
  return AUDIT_FAILURE_CATALOG[code].description;
}

/**
 * BACKEND-006 — process one audit with OpenAI and persist structured results.
 * Status transitions are server-owned (claim → complete/fail).
 *
 * MVP: fire-and-forget from API routes — not a durable queue.
 * Polls must only re-schedule QUEUED audits (never PROCESSING) to avoid
 * repeated OpenAI calls.
 */
export async function runAiAuditProcessor(
  supabase: SupabaseClient,
  auditId: string,
  options?: { imageDataUrl?: string | null },
): Promise<void> {
  const { data: ownership } = await supabase
    .from("audits")
    .select("id, user_id, status")
    .eq("id", auditId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!ownership) return;
  const appUserId = (ownership as { user_id: string }).user_id;
  const status = (ownership as { status: string }).status;

  if (status === "COMPLETED" || status === "FAILED") return;

  // Stuck PROCESSING → fail (diagnosable); do not start a second OpenAI call.
  if (status === "PROCESSING") {
    await reclaimStuckProcessingAudit(supabase, auditId, appUserId);
    return;
  }

  if (status !== "QUEUED") return;

  if (!hasOpenAiApiKey()) {
    await claimAudit(supabase, auditId, "backend-006-ai");
    await failAudit(supabase, {
      auditId,
      appUserId,
      code: "AI_UNAVAILABLE",
      message: safeFailMessage("AI_UNAVAILABLE"),
    });
    return;
  }

  const claimed = await claimAudit(supabase, auditId, "backend-006-ai");
  if (!claimed) return;

  const audit = await fetchAuditForUser(supabase, auditId, appUserId);
  if (!audit) return;
  if (audit.status === "COMPLETED" || audit.status === "FAILED") return;

  if (audit.summary === "__stub_fail__") {
    await failAudit(supabase, {
      auditId,
      appUserId,
      code: "AI_UNAVAILABLE",
      message: safeFailMessage("AI_UNAVAILABLE", "Simulated AI failure for QA."),
    });
    return;
  }

  try {
    let prepared;
    try {
      prepared = await prepareAuditAiInput(supabase, audit, {
        imageDataUrl: options?.imageDataUrl,
      });
    } catch (error) {
      const code =
        error instanceof Error
          ? mapPrepareError(error.message)
          : "INTERNAL_ERROR";
      await failAudit(supabase, {
        auditId,
        appUserId,
        code,
        message: safeFailMessage(
          code,
          error instanceof Error ? undefined : undefined,
        ),
      });
      return;
    }

    const aiResult = await runAiUxAudit({
      auditId,
      inputType: audit.inputType,
      websiteUrl: prepared.websiteUrl,
      pageTextExcerpt: prepared.pageTextExcerpt,
      imageUrl: prepared.imageUrl,
    });

    const overallScore = resolveOverallScore(aiResult);

    await persistAiAuditReport(supabase, {
      auditId,
      overallScore,
      result: aiResult,
    });

    await completeAudit(supabase, auditId, {
      overallScore,
      summary: aiResult.summary.slice(0, 2000),
    });
  } catch (error) {
    if (error instanceof AiProviderError) {
      logError("audit.ai_failed", {
        auditId,
        userId: appUserId,
        code: error.code,
        detail: error.internalMessage.slice(0, 200),
      });
      await failAudit(supabase, {
        auditId,
        appUserId,
        code: error.code as AuditFailureCode,
        message: safeFailMessage(error.code as AuditFailureCode, error.message),
      });
      return;
    }
    const internal =
      error instanceof Error ? error.message : "AI audit processing failed";
    logError("audit.ai_failed", {
      auditId,
      userId: appUserId,
      code: "INTERNAL_ERROR",
      detail: internal.replace(/sk-[a-zA-Z0-9._-]+/g, "[redacted]").slice(0, 200),
    });
    await failAudit(supabase, {
      auditId,
      appUserId,
      code: "INTERNAL_ERROR",
      message: safeFailMessage("INTERNAL_ERROR"),
    });
  }
}

/**
 * Fire-and-forget MVP scheduler. Not durable across serverless freezes.
 */
export function scheduleAiAuditProcessor(
  supabase: SupabaseClient,
  auditId: string,
  options?: { imageDataUrl?: string | null },
): void {
  void runAiAuditProcessor(supabase, auditId, options).catch((error) => {
    const msg =
      error instanceof Error ? error.message : String(error);
    logError("audit.ai_scheduler", {
      auditId,
      detail: msg.replace(/sk-[a-zA-Z0-9._-]+/g, "[redacted]").slice(0, 200),
    });
  });
}
