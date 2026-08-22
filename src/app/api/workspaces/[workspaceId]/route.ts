import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { workspaceErrorResponse } from "@/lib/workspace/http";
import {
  requireAuthenticatedUser,
  requireAuthorizationContext,
} from "@/services/authorization";
import { getWorkspaceForMember } from "@/services/workspace";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ workspaceId: string }> };

/**
 * GET /api/workspaces/[workspaceId]
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { workspaceId } = await context.params;
    const supabase = await createSupabaseServerClient();
    const user = await requireAuthenticatedUser(supabase);
    const { account } = await requireAuthorizationContext(supabase, user);

    const workspace = await getWorkspaceForMember(
      account.appUserId,
      workspaceId,
    );
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found", code: "WORKSPACE_NOT_FOUND" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { workspace },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return workspaceErrorResponse(error);
  }
}
