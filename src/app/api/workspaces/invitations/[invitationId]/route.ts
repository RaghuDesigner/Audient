import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { workspaceErrorResponse } from "@/lib/workspace/http";
import {
  AuthorizationError,
  requireAuthenticatedUser,
  requireAuthorizationContext,
} from "@/services/authorization";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  acceptWorkspaceInvitation,
  revokeWorkspaceInvitation,
} from "@/services/workspace";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ invitationId: string }> };

/**
 * POST /api/workspaces/invitations/[invitationId]/accept
 * Body: { token: string }
 */
export async function POST(request: Request, context: RouteContext) {
  try {
    const { invitationId } = await context.params;
    const supabase = await createSupabaseServerClient();
    const user = await requireAuthenticatedUser(supabase);
    await requireAuthorizationContext(supabase, user);

    const body = (await request.json().catch(() => null)) as {
      token?: string;
    } | null;

    if (!body?.token || typeof body.token !== "string") {
      throw new AuthorizationError("Token is required", "INVALID_TOKEN", 400);
    }

    const result = await acceptWorkspaceInvitation({
      supabase,
      invitationId,
      token: body.token,
    });

    return NextResponse.json(
      { ok: true, memberId: result.memberId },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return workspaceErrorResponse(error);
  }
}

/**
 * DELETE /api/workspaces/invitations/[invitationId] — revoke (actor must manage workspace).
 */
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { invitationId } = await context.params;
    const supabase = await createSupabaseServerClient();
    const user = await requireAuthenticatedUser(supabase);
    const { account } = await requireAuthorizationContext(supabase, user);

    const admin = createSupabaseAdminClient();
    const { data: inv } = await admin
      .from("workspace_invitations")
      .select("id, workspace_id")
      .eq("id", invitationId)
      .is("deleted_at", null)
      .maybeSingle();

    if (!inv) {
      return NextResponse.json(
        { error: "Invitation not found", code: "INVITE_NOT_FOUND" },
        { status: 404 },
      );
    }

    const row = inv as { id: string; workspace_id: string };
    await revokeWorkspaceInvitation({
      actorUserId: account.appUserId,
      workspaceId: row.workspace_id,
      invitationId: row.id,
    });

    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return workspaceErrorResponse(error);
  }
}
