import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { workspaceErrorResponse } from "@/lib/workspace/http";
import {
  requireAuthenticatedUser,
  requireAuthorizationContext,
} from "@/services/authorization";
import { getWorkspaceBillingSummary } from "@/services/workspace";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ workspaceId: string }> };

/**
 * GET /api/workspaces/[workspaceId]/billing
 * Limited visibility for OWNER/ADMIN. Full invoices remain owner payment-scoped.
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { workspaceId } = await context.params;
    const supabase = await createSupabaseServerClient();
    const user = await requireAuthenticatedUser(supabase);
    const { account } = await requireAuthorizationContext(supabase, user);

    const billing = await getWorkspaceBillingSummary({
      actorUserId: account.appUserId,
      workspaceId,
    });

    return NextResponse.json(
      { billing },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return workspaceErrorResponse(error);
  }
}
