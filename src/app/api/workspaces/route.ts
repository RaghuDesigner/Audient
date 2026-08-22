import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { workspaceErrorResponse } from "@/lib/workspace/http";
import {
  requireAuthenticatedUser,
  requireAuthorizationContext,
} from "@/services/authorization";
import {
  ensurePersonalWorkspace,
  listWorkspacesForUser,
} from "@/services/workspace";

export const dynamic = "force-dynamic";

/**
 * GET /api/workspaces — list workspaces for the authenticated user.
 */
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const user = await requireAuthenticatedUser(supabase);
    const { account } = await requireAuthorizationContext(supabase, user);

    await ensurePersonalWorkspace(account.appUserId);
    const workspaces = await listWorkspacesForUser(account.appUserId);

    return NextResponse.json(
      { workspaces },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return workspaceErrorResponse(error);
  }
}
