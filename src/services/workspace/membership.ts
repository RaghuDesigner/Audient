import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AuthorizationError } from "@/services/authorization/session";

export const WORKSPACE_MEMBER_ROLES = [
  "OWNER",
  "ADMIN",
  "DESIGNER",
  "ANALYST",
  "VIEWER",
] as const;

export type WorkspaceMemberRole = (typeof WORKSPACE_MEMBER_ROLES)[number];

export const WORKSPACE_MEMBER_STATUSES = [
  "ACTIVE",
  "INVITED",
  "SUSPENDED",
] as const;

export type WorkspaceMemberStatus =
  (typeof WORKSPACE_MEMBER_STATUSES)[number];

export const AUDIT_CREATE_ROLES: readonly WorkspaceMemberRole[] = [
  "OWNER",
  "ADMIN",
  "DESIGNER",
  "ANALYST",
];

export const AUDIT_MUTATE_ADMIN_ROLES: readonly WorkspaceMemberRole[] = [
  "OWNER",
  "ADMIN",
];

export function isWorkspaceMemberRole(
  value: unknown,
): value is WorkspaceMemberRole {
  return (
    typeof value === "string" &&
    (WORKSPACE_MEMBER_ROLES as readonly string[]).includes(value)
  );
}

/**
 * Idempotent personal workspace + OWNER seat (service-role RPC).
 */
export async function ensurePersonalWorkspace(
  appUserId: string,
): Promise<string> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc("ensure_personal_workspace", {
    p_user_id: appUserId,
  });
  if (error || data == null) {
    throw new AuthorizationError(
      "Unable to resolve personal workspace",
      "WORKSPACE_PROVISION_FAILED",
      500,
    );
  }
  return String(data);
}

export async function getActiveMembership(
  appUserId: string,
  workspaceId: string,
): Promise<{
  role: WorkspaceMemberRole;
  status: WorkspaceMemberStatus;
} | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("workspace_members")
    .select("role, status")
    .eq("workspace_id", workspaceId)
    .eq("user_id", appUserId)
    .eq("status", "ACTIVE")
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;
  const role = (data as { role: string }).role;
  const status = (data as { status: string }).status;
  if (!isWorkspaceMemberRole(role)) return null;
  if (
    !(WORKSPACE_MEMBER_STATUSES as readonly string[]).includes(status)
  ) {
    return null;
  }
  return {
    role,
    status: status as WorkspaceMemberStatus,
  };
}

export async function assertWorkspaceMembership(
  appUserId: string,
  workspaceId: string,
): Promise<{ role: WorkspaceMemberRole; status: WorkspaceMemberStatus }> {
  const membership = await getActiveMembership(appUserId, workspaceId);
  if (!membership) {
    throw new AuthorizationError(
      "Not a member of this workspace",
      "WORKSPACE_FORBIDDEN",
      403,
    );
  }
  return membership;
}

export async function assertWorkspaceRole(
  appUserId: string,
  workspaceId: string,
  allowed: readonly WorkspaceMemberRole[],
): Promise<WorkspaceMemberRole> {
  const membership = await assertWorkspaceMembership(appUserId, workspaceId);
  if (!allowed.includes(membership.role)) {
    throw new AuthorizationError(
      "Insufficient workspace role",
      "WORKSPACE_ROLE_FORBIDDEN",
      403,
    );
  }
  return membership.role;
}

/**
 * Resolve workspace for audit create.
 * Client workspace_id is verified; otherwise personal workspace is used.
 * Never trusts client role.
 */
export async function resolveWorkspaceIdForAuditCreate(
  appUserId: string,
  clientWorkspaceId: unknown,
): Promise<string> {
  if (clientWorkspaceId != null && clientWorkspaceId !== "") {
    if (typeof clientWorkspaceId !== "string" || clientWorkspaceId.length > 80) {
      throw new AuthorizationError(
        "Invalid workspace id",
        "INVALID_WORKSPACE_ID",
        400,
      );
    }
    await assertWorkspaceRole(
      appUserId,
      clientWorkspaceId,
      AUDIT_CREATE_ROLES,
    );
    return clientWorkspaceId;
  }

  const personalId = await ensurePersonalWorkspace(appUserId);
  await assertWorkspaceRole(appUserId, personalId, AUDIT_CREATE_ROLES);
  return personalId;
}

/**
 * Reject forged role / membership fields on membership mutation bodies.
 */
export function assertNoForgedWorkspaceIdentity(body: unknown): void {
  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    return;
  }
  const record = body as Record<string, unknown>;
  // Role/status from client are never authoritative for the actor's own seat.
  if ("actorRole" in record || "myRole" in record) {
    throw new AuthorizationError(
      "Client-supplied actor role is not allowed",
      "IDENTITY_FORGE_REJECTED",
      400,
    );
  }
}
