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
  addWorkspaceMemberByEmail,
  assertNoForgedWorkspaceIdentity,
  isWorkspaceMemberRole,
  listWorkspaceMembers,
} from "@/services/workspace";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ workspaceId: string }> };

/**
 * GET /api/workspaces/[workspaceId]/members
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { workspaceId } = await context.params;
    const supabase = await createSupabaseServerClient();
    const user = await requireAuthenticatedUser(supabase);
    const { account } = await requireAuthorizationContext(supabase, user);

    const members = await listWorkspaceMembers(account.appUserId, workspaceId);
    return NextResponse.json(
      { members },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return workspaceErrorResponse(error);
  }
}

/**
 * POST /api/workspaces/[workspaceId]/members — direct add by email (existing user).
 */
export async function POST(request: Request, context: RouteContext) {
  try {
    const { workspaceId } = await context.params;
    const supabase = await createSupabaseServerClient();
    const user = await requireAuthenticatedUser(supabase);
    const { account } = await requireAuthorizationContext(supabase, user);

    const body = (await request.json().catch(() => null)) as {
      email?: string;
      role?: string;
    } | null;

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body", code: "INVALID_BODY" },
        { status: 400 },
      );
    }

    assertNoForgedWorkspaceIdentity(body);
    // Target seat role is allowed; reject identity forges without blocking `role`.
    const forgeBody = { ...body } as Record<string, unknown>;
    delete forgeBody.role;
    assertNoClientIdentityForge(forgeBody);

    if (typeof body.email !== "string" || !body.email.trim()) {
      throw new AuthorizationError("Email is required", "INVALID_EMAIL", 400);
    }
    if (!isWorkspaceMemberRole(body.role) || body.role === "OWNER") {
      throw new AuthorizationError("Invalid role", "INVALID_ROLE", 400);
    }

    const member = await addWorkspaceMemberByEmail({
      actorUserId: account.appUserId,
      workspaceId,
      email: body.email,
      role: body.role,
    });

    return NextResponse.json(
      { member },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return workspaceErrorResponse(error);
  }
}
