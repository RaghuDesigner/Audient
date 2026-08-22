import { NextResponse } from "next/server";

import { auditErrorResponse } from "@/lib/audits/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getReportFoundationForUser } from "@/services/report/foundation";
import {
  AccountMissingError,
  requireAuthenticatedUser,
  requireAuthorizationContext,
} from "@/services/authorization";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ auditId: string }> };

/**
 * GET /api/audits/[auditId]/report — report foundation (1:1 with audit).
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { auditId } = await context.params;
    const supabase = await createSupabaseServerClient();
    const user = await requireAuthenticatedUser(supabase);
    const { account } = await requireAuthorizationContext(supabase, user);

    const report = await getReportFoundationForUser(
      supabase,
      auditId,
      account.appUserId,
    );
    if (!report) {
      return NextResponse.json(
        { error: "Audit not found", code: "AUDIT_NOT_FOUND" },
        { status: 404 },
      );
    }

    if (report.status !== "COMPLETED") {
      return NextResponse.json(
        {
          error: "Report not ready",
          code: "REPORT_NOT_READY",
          status: report.status,
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { report },
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
