import { NextResponse } from "next/server";

import { AuthRequiredError } from "@/lib/auth/session";
import { auditErrorResponse } from "@/lib/audits/http";
import { checkRateLimit, RateLimitError } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadAccountSnapshot } from "@/services/account";
import { retryFailedAudit } from "@/services/audit/retry";
import { scheduleAiAuditProcessor } from "@/services/audit/ai-processor";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ auditId: string }> };

/**
 * POST /api/audits/[auditId]/retry — retry failed audit with credit re-auth.
 */
export async function POST(_request: Request, context: RouteContext) {
  try {
    const { auditId } = await context.params;
    if (!auditId || auditId.length > 80) {
      return NextResponse.json(
        { error: "Invalid audit id", code: "INVALID_AUDIT_ID" },
        { status: 400 },
      );
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) throw new AuthRequiredError();

    const account = await loadAccountSnapshot(supabase, user);
    if (!account) {
      return NextResponse.json(
        { error: "Account not provisioned", code: "ACCOUNT_MISSING" },
        { status: 404 },
      );
    }

    const limit = checkRateLimit({
      key: `audit:retry:${account.appUserId}`,
      limit: 10,
      windowMs: 60_000,
    });
    if (!limit.allowed) {
      throw new RateLimitError(limit.retryAfterSec);
    }

    const result = await retryFailedAudit(supabase, user, auditId);
    scheduleAiAuditProcessor(supabase, result.audit.id);

    return NextResponse.json(
      {
        auditId: result.audit.id,
        status: result.audit.status,
        creditsCost: result.audit.creditsCost,
        creditsRemaining:
          result.creditsRemaining ?? account.credits.remaining ?? null,
        retryOfAuditId: result.audit.retryOfAuditId,
      },
      {
        status: 202,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    return auditErrorResponse(error);
  }
}
