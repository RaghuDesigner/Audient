import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkRateLimit, RateLimitError } from "@/lib/rate-limit";
import { workspaceErrorResponse } from "@/lib/workspace/http";
import {
  AuthorizationError,
  assertNoClientIdentityForge,
  requireAuthenticatedUser,
  requireAuthorizationContext,
} from "@/services/authorization";
import {
  assertNoForgedWorkspaceIdentity,
  createWorkspaceInvitation,
  isWorkspaceMemberRole,
  listWorkspaceInvitations,
} from "@/services/workspace";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ workspaceId: string }> };

/**
 * GET /api/workspaces/[workspaceId]/invitations
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { workspaceId } = await context.params;
    const supabase = await createSupabaseServerClient();
    const user = await requireAuthenticatedUser(supabase);
    const { account } = await requireAuthorizationContext(supabase, user);

    const invitations = await listWorkspaceInvitations(
      account.appUserId,
      workspaceId,
    );
    return NextResponse.json(
      { invitations },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return workspaceErrorResponse(error);
  }
}

/**
 * POST /api/workspaces/[workspaceId]/invitations
 *
 * No email delivery. Returns acceptToken once for development/test acceptance.
 */
export async function POST(request: Request, context: RouteContext) {
  try {
    const { workspaceId } = await context.params;
    const supabase = await createSupabaseServerClient();
    const user = await requireAuthenticatedUser(supabase);
    const { account } = await requireAuthorizationContext(supabase, user);

    const limit = checkRateLimit({
      key: `workspace:invite:${account.appUserId}`,
      limit: 20,
      windowMs: 60_000,
    });
    if (!limit.allowed) {
      throw new RateLimitError(limit.retryAfterSec);
    }

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
    const forgeBody = { ...body } as Record<string, unknown>;
    delete forgeBody.role;
    assertNoClientIdentityForge(forgeBody);

    if (typeof body.email !== "string" || !body.email.trim()) {
      throw new AuthorizationError("Email is required", "INVALID_EMAIL", 400);
    }
    if (!isWorkspaceMemberRole(body.role) || body.role === "OWNER") {
      throw new AuthorizationError("Invalid role", "INVALID_ROLE", 400);
    }

    const invitation = await createWorkspaceInvitation({
      actorUserId: account.appUserId,
      workspaceId,
      email: body.email,
      role: body.role,
    });

    return NextResponse.json(
      {
        invitation: {
          id: invitation.id,
          workspaceId: invitation.workspaceId,
          inviterId: invitation.inviterId,
          inviteeEmail: invitation.inviteeEmail,
          inviteeUserId: invitation.inviteeUserId,
          role: invitation.role,
          status: invitation.status,
          expiresAt: invitation.expiresAt,
          acceptedAt: invitation.acceptedAt,
          createdAt: invitation.createdAt,
        },
        // Dev/test mechanism — no SMTP. Never log token_hash.
        acceptToken: invitation.acceptToken,
        acceptPath: `/api/workspaces/invitations/${invitation.id}/accept`,
      },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return workspaceErrorResponse(error);
  }
}
