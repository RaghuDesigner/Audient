import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { workspaceErrorResponse } from "@/lib/workspace/http";
import {
  AuthorizationError,
  assertNoClientIdentityForge,
  requireAuthenticatedUser,
  requireAuthorizationContext,
} from "@/services/authorization";
import {
  assertNoForgedWorkspaceIdentity,
  getWorkspaceMember,
  isWorkspaceMemberRole,
  removeWorkspaceMember,
  updateWorkspaceMember,
  WORKSPACE_MEMBER_STATUSES,
  type WorkspaceMemberStatus,
} from "@/services/workspace";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ workspaceId: string; memberId: string }>;
};

/**
 * GET /api/workspaces/[workspaceId]/members/[memberId]
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { workspaceId, memberId } = await context.params;
    const supabase = await createSupabaseServerClient();
    const user = await requireAuthenticatedUser(supabase);
    const { account } = await requireAuthorizationContext(supabase, user);

    const member = await getWorkspaceMember(
      account.appUserId,
      workspaceId,
      memberId,
    );
    if (!member) {
      return NextResponse.json(
        { error: "Member not found", code: "MEMBER_NOT_FOUND" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { member },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return workspaceErrorResponse(error);
  }
}

/**
 * PATCH /api/workspaces/[workspaceId]/members/[memberId]
 */
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { workspaceId, memberId } = await context.params;
    const supabase = await createSupabaseServerClient();
    const user = await requireAuthenticatedUser(supabase);
    const { account } = await requireAuthorizationContext(supabase, user);

    const body = (await request.json().catch(() => null)) as {
      role?: string;
      status?: string;
    } | null;

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body", code: "INVALID_BODY" },
        { status: 400 },
      );
    }

    assertNoForgedWorkspaceIdentity(body);
    const forgeBody = { ...body } as Record<string, unknown>;
    delete forgeBody.role;
    delete forgeBody.status;
    assertNoClientIdentityForge(forgeBody);

    let role: Parameters<typeof updateWorkspaceMember>[0]["role"];
    let status: WorkspaceMemberStatus | undefined;

    if (body.role !== undefined) {
      if (!isWorkspaceMemberRole(body.role) || body.role === "OWNER") {
        throw new AuthorizationError("Invalid role", "INVALID_ROLE", 400);
      }
      role = body.role;
    }
    if (body.status !== undefined) {
      if (
        !(WORKSPACE_MEMBER_STATUSES as readonly string[]).includes(body.status)
      ) {
        throw new AuthorizationError("Invalid status", "INVALID_STATUS", 400);
      }
      status = body.status as WorkspaceMemberStatus;
    }

    const member = await updateWorkspaceMember({
      actorUserId: account.appUserId,
      workspaceId,
      memberId,
      role,
      status,
    });

    return NextResponse.json(
      { member },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return workspaceErrorResponse(error);
  }
}

/**
 * DELETE /api/workspaces/[workspaceId]/members/[memberId]
 */
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { workspaceId, memberId } = await context.params;
    const supabase = await createSupabaseServerClient();
    const user = await requireAuthenticatedUser(supabase);
    const { account } = await requireAuthorizationContext(supabase, user);

    await removeWorkspaceMember({
      actorUserId: account.appUserId,
      workspaceId,
      memberId,
    });

    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return workspaceErrorResponse(error);
  }
}
