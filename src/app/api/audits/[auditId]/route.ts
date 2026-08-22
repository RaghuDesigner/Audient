import { NextResponse } from "next/server";

import { auditErrorResponse } from "@/lib/audits/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAuditForUser } from "@/services/audit/queries";
import { scheduleAiAuditProcessor } from "@/services/audit/ai-processor";
import { reclaimStuckProcessingAudit } from "@/services/audit/stuck";
import {
  AccountMissingError,
  requireAuthenticatedUser,
  requireAuthorizationContext,
} from "@/services/authorization";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ auditId: string }> };

/**
 * GET /api/audits/[auditId] — ownership-scoped status poll.
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { auditId } = await context.params;
    const supabase = await createSupabaseServerClient();
    const user = await requireAuthenticatedUser(supabase);
    const { account } = await requireAuthorizationContext(supabase, user);

    let audit = await getAuditForUser(supabase, auditId, account.appUserId);
    if (!audit) {
      return NextResponse.json(
        { error: "Audit not found", code: "AUDIT_NOT_FOUND" },
        { status: 404 },
      );
    }

    if (audit.status === "PROCESSING") {
      const reclaimed = await reclaimStuckProcessingAudit(
        supabase,
        audit.id,
        account.appUserId,
      );
      if (reclaimed) {
        audit = await getAuditForUser(supabase, auditId, account.appUserId);
        if (!audit) {
          return NextResponse.json(
            { error: "Audit not found", code: "AUDIT_NOT_FOUND" },
            { status: 404 },
          );
        }
      }
    }

    // Re-nudge only QUEUED audits (lost fire-and-forget). Never re-schedule
    // PROCESSING — that would start a second OpenAI call.
    if (audit.status === "QUEUED") {
      scheduleAiAuditProcessor(supabase, audit.id);
    }

    return NextResponse.json(
      { audit },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof AccountMissingError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 404 },
      );
    }
    return auditErrorResponse(error);
  }
}
