import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AuthorizationError } from "@/services/authorization/session";
import {
  assertWorkspaceMembership,
  isWorkspaceMemberRole,
  type WorkspaceMemberRole,
  type WorkspaceMemberStatus,
  WORKSPACE_MEMBER_STATUSES,
} from "@/services/workspace/membership";
import {
  assignableRolesFor,
  canAssignRole,
  canInviteMembers,
  canMutateMemberSeat,
  canViewBillingSummary,
} from "@/services/workspace/permissions";

export const WORKSPACE_INVITATION_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "REVOKED",
  "EXPIRED",
] as const;

export type WorkspaceInvitationStatus =
  (typeof WORKSPACE_INVITATION_STATUSES)[number];

export const DEFAULT_INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type WorkspaceSummary = {
  id: string;
  name: string;
  ownerId: string;
  isPersonal: boolean;
  role: WorkspaceMemberRole;
  createdAt: string;
};

export type WorkspaceMemberRow = {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceMemberRole;
  status: WorkspaceMemberStatus;
  joinedAt: string;
  name: string | null;
  email: string;
};

export type WorkspaceInvitationRow = {
  id: string;
  workspaceId: string;
  inviterId: string;
  inviteeEmail: string;
  inviteeUserId: string | null;
  role: WorkspaceMemberRole;
  status: WorkspaceInvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
};

export type CreatedInvitation = WorkspaceInvitationRow & {
  /** Dev/test accept token — returned once; never stored plaintext. */
  acceptToken: string;
};

function hashInviteToken(token: string): string {
  return createHash("sha256").update(token.trim()).digest("hex");
}

function generateInviteToken(): string {
  return randomBytes(32).toString("base64url");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isInvitationStatus(v: unknown): v is WorkspaceInvitationStatus {
  return (
    typeof v === "string" &&
    (WORKSPACE_INVITATION_STATUSES as readonly string[]).includes(v)
  );
}

export async function listWorkspacesForUser(
  appUserId: string,
): Promise<WorkspaceSummary[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("workspace_members")
    .select(
      "role, workspace_id, workspaces!inner(id, name, owner_id, is_personal, created_at, deleted_at)",
    )
    .eq("user_id", appUserId)
    .eq("status", "ACTIVE")
    .is("deleted_at", null);

  if (error || !data) return [];

  const out: WorkspaceSummary[] = [];
  for (const row of data as unknown as Array<{
    role: string;
    workspace_id: string;
    workspaces:
      | {
          id: string;
          name: string;
          owner_id: string;
          is_personal: boolean;
          created_at: string;
          deleted_at: string | null;
        }
      | Array<{
          id: string;
          name: string;
          owner_id: string;
          is_personal: boolean;
          created_at: string;
          deleted_at: string | null;
        }>;
  }>) {
    const ws = Array.isArray(row.workspaces)
      ? row.workspaces[0]
      : row.workspaces;
    if (!ws || ws.deleted_at) continue;
    if (!isWorkspaceMemberRole(row.role)) continue;
    out.push({
      id: ws.id,
      name: ws.name,
      ownerId: ws.owner_id,
      isPersonal: ws.is_personal,
      role: row.role,
      createdAt: ws.created_at,
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getWorkspaceForMember(
  appUserId: string,
  workspaceId: string,
): Promise<WorkspaceSummary | null> {
  const membership = await assertWorkspaceMembership(appUserId, workspaceId);
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("workspaces")
    .select("id, name, owner_id, is_personal, created_at")
    .eq("id", workspaceId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error || !data) return null;
  const w = data as {
    id: string;
    name: string;
    owner_id: string;
    is_personal: boolean;
    created_at: string;
  };
  return {
    id: w.id,
    name: w.name,
    ownerId: w.owner_id,
    isPersonal: w.is_personal,
    role: membership.role,
    createdAt: w.created_at,
  };
}

export async function listWorkspaceMembers(
  appUserId: string,
  workspaceId: string,
): Promise<WorkspaceMemberRow[]> {
  await assertWorkspaceMembership(appUserId, workspaceId);
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("workspace_members")
    .select(
      "id, workspace_id, user_id, role, status, joined_at, users!inner(name, email)",
    )
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null)
    .order("joined_at", { ascending: true });

  if (error || !data) return [];

  return (data as unknown as Array<{
    id: string;
    workspace_id: string;
    user_id: string;
    role: string;
    status: string;
    joined_at: string;
    users:
      | { name: string | null; email: string }
      | Array<{ name: string | null; email: string }>;
  }>)
    .filter(
      (row) =>
        isWorkspaceMemberRole(row.role) &&
        (WORKSPACE_MEMBER_STATUSES as readonly string[]).includes(row.status),
    )
    .map((row) => {
      const u = Array.isArray(row.users) ? row.users[0] : row.users;
      return {
        id: row.id,
        workspaceId: row.workspace_id,
        userId: row.user_id,
        role: row.role as WorkspaceMemberRole,
        status: row.status as WorkspaceMemberStatus,
        joinedAt: row.joined_at,
        name: u?.name ?? null,
        email: u?.email ?? "",
      };
    });
}

export async function getWorkspaceMember(
  appUserId: string,
  workspaceId: string,
  memberId: string,
): Promise<WorkspaceMemberRow | null> {
  const members = await listWorkspaceMembers(appUserId, workspaceId);
  return members.find((m) => m.id === memberId) ?? null;
}

export async function updateWorkspaceMember(input: {
  actorUserId: string;
  workspaceId: string;
  memberId: string;
  role?: WorkspaceMemberRole;
  status?: WorkspaceMemberStatus;
}): Promise<WorkspaceMemberRow> {
  const actor = await assertWorkspaceMembership(
    input.actorUserId,
    input.workspaceId,
  );
  const admin = createSupabaseAdminClient();

  const { data: target, error: targetError } = await admin
    .from("workspace_members")
    .select("id, user_id, role, status")
    .eq("id", input.memberId)
    .eq("workspace_id", input.workspaceId)
    .is("deleted_at", null)
    .maybeSingle();

  if (targetError || !target) {
    throw new AuthorizationError("Member not found", "MEMBER_NOT_FOUND", 404);
  }

  const targetRow = target as {
    id: string;
    user_id: string;
    role: string;
    status: string;
  };
  if (!isWorkspaceMemberRole(targetRow.role)) {
    throw new AuthorizationError("Invalid member role", "INVALID_ROLE", 500);
  }

  if (
    !canMutateMemberSeat({
      actorRole: actor.role,
      targetRole: targetRow.role,
      targetUserId: targetRow.user_id,
      actorUserId: input.actorUserId,
    })
  ) {
    throw new AuthorizationError(
      "Cannot modify this member",
      "MEMBER_MUTATION_FORBIDDEN",
      403,
    );
  }

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.role != null) {
    if (!canAssignRole(actor.role, input.role)) {
      throw new AuthorizationError(
        "Cannot assign this role",
        "ROLE_ASSIGN_FORBIDDEN",
        403,
      );
    }
    patch.role = input.role;
  }

  if (input.status != null) {
    if (
      !(WORKSPACE_MEMBER_STATUSES as readonly string[]).includes(input.status)
    ) {
      throw new AuthorizationError("Invalid status", "INVALID_STATUS", 400);
    }
    if (input.status === "INVITED") {
      throw new AuthorizationError(
        "Cannot set INVITED via member update",
        "INVALID_STATUS",
        400,
      );
    }
    patch.status = input.status;
  }

  if (Object.keys(patch).length <= 1) {
    throw new AuthorizationError("No changes", "NO_CHANGES", 400);
  }

  const { error: updateError } = await admin
    .from("workspace_members")
    .update(patch)
    .eq("id", input.memberId)
    .eq("workspace_id", input.workspaceId)
    .is("deleted_at", null);

  if (updateError) {
    throw new AuthorizationError(
      "Unable to update member",
      "MEMBER_UPDATE_FAILED",
      500,
    );
  }

  const updated = await getWorkspaceMember(
    input.actorUserId,
    input.workspaceId,
    input.memberId,
  );
  if (!updated) {
    throw new AuthorizationError("Member not found", "MEMBER_NOT_FOUND", 404);
  }
  return updated;
}

export async function removeWorkspaceMember(input: {
  actorUserId: string;
  workspaceId: string;
  memberId: string;
}): Promise<void> {
  const actor = await assertWorkspaceMembership(
    input.actorUserId,
    input.workspaceId,
  );
  const admin = createSupabaseAdminClient();

  const { data: target, error: targetError } = await admin
    .from("workspace_members")
    .select("id, user_id, role")
    .eq("id", input.memberId)
    .eq("workspace_id", input.workspaceId)
    .is("deleted_at", null)
    .maybeSingle();

  if (targetError || !target) {
    throw new AuthorizationError("Member not found", "MEMBER_NOT_FOUND", 404);
  }

  const targetRow = target as { id: string; user_id: string; role: string };
  if (!isWorkspaceMemberRole(targetRow.role)) {
    throw new AuthorizationError("Invalid member role", "INVALID_ROLE", 500);
  }

  if (
    !canMutateMemberSeat({
      actorRole: actor.role,
      targetRole: targetRow.role,
      targetUserId: targetRow.user_id,
      actorUserId: input.actorUserId,
    })
  ) {
    throw new AuthorizationError(
      "Cannot remove this member",
      "MEMBER_REMOVE_FORBIDDEN",
      403,
    );
  }

  const { error } = await admin
    .from("workspace_members")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.memberId)
    .eq("workspace_id", input.workspaceId);

  if (error) {
    throw new AuthorizationError(
      "Unable to remove member",
      "MEMBER_REMOVE_FAILED",
      500,
    );
  }
}

/**
 * Add an existing user by email as ACTIVE member (no invitation).
 * Prefer invitations when the user does not exist yet.
 */
export async function addWorkspaceMemberByEmail(input: {
  actorUserId: string;
  workspaceId: string;
  email: string;
  role: WorkspaceMemberRole;
}): Promise<WorkspaceMemberRow> {
  const actor = await assertWorkspaceMembership(
    input.actorUserId,
    input.workspaceId,
  );
  if (!canInviteMembers(actor.role)) {
    throw new AuthorizationError(
      "Cannot add members",
      "MEMBER_ADD_FORBIDDEN",
      403,
    );
  }
  if (!canAssignRole(actor.role, input.role)) {
    throw new AuthorizationError(
      "Cannot assign this role",
      "ROLE_ASSIGN_FORBIDDEN",
      403,
    );
  }

  const email = normalizeEmail(input.email);
  const admin = createSupabaseAdminClient();
  const { data: user, error: userError } = await admin
    .from("users")
    .select("id, email, name")
    .ilike("email", email)
    .is("deleted_at", null)
    .maybeSingle();

  if (userError || !user) {
    throw new AuthorizationError(
      "User not found for direct add; create an invitation instead",
      "USER_NOT_FOUND",
      404,
    );
  }

  const userRow = user as { id: string; email: string; name: string | null };
  if (userRow.id === input.actorUserId) {
    throw new AuthorizationError(
      "Cannot add yourself",
      "MEMBER_ADD_FORBIDDEN",
      400,
    );
  }

  const { data: existing } = await admin
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", input.workspaceId)
    .eq("user_id", userRow.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (existing) {
    throw new AuthorizationError(
      "Already a workspace member",
      "MEMBER_EXISTS",
      409,
    );
  }

  const { data: inserted, error: insertError } = await admin
    .from("workspace_members")
    .insert({
      workspace_id: input.workspaceId,
      user_id: userRow.id,
      role: input.role,
      status: "ACTIVE",
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    throw new AuthorizationError(
      "Unable to add member",
      "MEMBER_ADD_FAILED",
      500,
    );
  }

  const member = await getWorkspaceMember(
    input.actorUserId,
    input.workspaceId,
    (inserted as { id: string }).id,
  );
  if (!member) {
    throw new AuthorizationError("Member not found", "MEMBER_NOT_FOUND", 404);
  }
  return member;
}

export async function listWorkspaceInvitations(
  appUserId: string,
  workspaceId: string,
): Promise<WorkspaceInvitationRow[]> {
  const membership = await assertWorkspaceMembership(appUserId, workspaceId);
  if (!canInviteMembers(membership.role) && membership.role !== "OWNER") {
    // All members may see pending invites for UX (RLS also allows)
  }
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("workspace_invitations")
    .select(
      "id, workspace_id, inviter_id, invitee_email, invitee_user_id, role, status, expires_at, accepted_at, created_at",
    )
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return (data as Array<{
    id: string;
    workspace_id: string;
    inviter_id: string;
    invitee_email: string;
    invitee_user_id: string | null;
    role: string;
    status: string;
    expires_at: string;
    accepted_at: string | null;
    created_at: string;
  }>)
    .filter(
      (row) => isWorkspaceMemberRole(row.role) && isInvitationStatus(row.status),
    )
    .map((row) => ({
      id: row.id,
      workspaceId: row.workspace_id,
      inviterId: row.inviter_id,
      inviteeEmail: row.invitee_email,
      inviteeUserId: row.invitee_user_id,
      role: row.role as WorkspaceMemberRole,
      status: row.status as WorkspaceInvitationStatus,
      expiresAt: row.expires_at,
      acceptedAt: row.accepted_at,
      createdAt: row.created_at,
    }));
}

export async function createWorkspaceInvitation(input: {
  actorUserId: string;
  workspaceId: string;
  email: string;
  role: WorkspaceMemberRole;
  ttlMs?: number;
}): Promise<CreatedInvitation> {
  const actor = await assertWorkspaceMembership(
    input.actorUserId,
    input.workspaceId,
  );
  if (!canInviteMembers(actor.role)) {
    throw new AuthorizationError(
      "Cannot invite members",
      "INVITE_FORBIDDEN",
      403,
    );
  }
  if (!canAssignRole(actor.role, input.role)) {
    throw new AuthorizationError(
      "Cannot invite with this role",
      "ROLE_ASSIGN_FORBIDDEN",
      403,
    );
  }

  const email = normalizeEmail(input.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AuthorizationError("Invalid email", "INVALID_EMAIL", 400);
  }

  const admin = createSupabaseAdminClient();

  const { data: existingUser } = await admin
    .from("users")
    .select("id")
    .ilike("email", email)
    .is("deleted_at", null)
    .maybeSingle();

  if (existingUser) {
    const uid = (existingUser as { id: string }).id;
    const { data: existingMember } = await admin
      .from("workspace_members")
      .select("id")
      .eq("workspace_id", input.workspaceId)
      .eq("user_id", uid)
      .is("deleted_at", null)
      .maybeSingle();
    if (existingMember) {
      throw new AuthorizationError(
        "User is already a member",
        "MEMBER_EXISTS",
        409,
      );
    }
  }

  const { data: pending } = await admin
    .from("workspace_invitations")
    .select("id")
    .eq("workspace_id", input.workspaceId)
    .eq("status", "PENDING")
    .is("deleted_at", null)
    .ilike("invitee_email", email)
    .maybeSingle();

  if (pending) {
    throw new AuthorizationError(
      "Pending invitation already exists",
      "INVITE_EXISTS",
      409,
    );
  }

  const acceptToken = generateInviteToken();
  const tokenHash = hashInviteToken(acceptToken);
  const ttl = input.ttlMs ?? DEFAULT_INVITE_TTL_MS;
  const expiresAt = new Date(Date.now() + ttl).toISOString();

  const { data: inserted, error } = await admin
    .from("workspace_invitations")
    .insert({
      workspace_id: input.workspaceId,
      inviter_id: input.actorUserId,
      invitee_email: email,
      invitee_user_id: existingUser
        ? (existingUser as { id: string }).id
        : null,
      role: input.role,
      status: "PENDING",
      token_hash: tokenHash,
      expires_at: expiresAt,
    })
    .select(
      "id, workspace_id, inviter_id, invitee_email, invitee_user_id, role, status, expires_at, accepted_at, created_at",
    )
    .single();

  if (error || !inserted) {
    throw new AuthorizationError(
      "Unable to create invitation",
      "INVITE_CREATE_FAILED",
      500,
    );
  }

  const row = inserted as {
    id: string;
    workspace_id: string;
    inviter_id: string;
    invitee_email: string;
    invitee_user_id: string | null;
    role: WorkspaceMemberRole;
    status: WorkspaceInvitationStatus;
    expires_at: string;
    accepted_at: string | null;
    created_at: string;
  };

  return {
    id: row.id,
    workspaceId: row.workspace_id,
    inviterId: row.inviter_id,
    inviteeEmail: row.invitee_email,
    inviteeUserId: row.invitee_user_id,
    role: row.role,
    status: row.status,
    expiresAt: row.expires_at,
    acceptedAt: row.accepted_at,
    createdAt: row.created_at,
    acceptToken,
  };
}

export async function revokeWorkspaceInvitation(input: {
  actorUserId: string;
  workspaceId: string;
  invitationId: string;
}): Promise<void> {
  const actor = await assertWorkspaceMembership(
    input.actorUserId,
    input.workspaceId,
  );
  if (!canInviteMembers(actor.role)) {
    throw new AuthorizationError(
      "Cannot revoke invitations",
      "INVITE_REVOKE_FORBIDDEN",
      403,
    );
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("workspace_invitations")
    .update({
      status: "REVOKED",
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.invitationId)
    .eq("workspace_id", input.workspaceId)
    .eq("status", "PENDING")
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    throw new AuthorizationError(
      "Invitation not found or not pending",
      "INVITE_NOT_FOUND",
      404,
    );
  }
}

/**
 * Accept via authenticated user JWT client (RLS + SECURITY DEFINER RPC).
 * Duplicate accept is idempotent inside the RPC.
 */
export async function acceptWorkspaceInvitation(input: {
  supabase: import("@supabase/supabase-js").SupabaseClient;
  invitationId: string;
  token: string;
}): Promise<{ memberId: string }> {
  const { data, error } = await input.supabase.rpc(
    "accept_workspace_invitation",
    {
      p_invitation_id: input.invitationId,
      p_token: input.token,
    },
  );

  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("expired")) {
      throw new AuthorizationError("Invitation expired", "INVITE_EXPIRED", 410);
    }
    if (msg.includes("email mismatch") || msg.includes("invalid token")) {
      throw new AuthorizationError(
        "Invitation not valid for this user",
        "INVITE_FORBIDDEN",
        403,
      );
    }
    if (msg.includes("not pending")) {
      throw new AuthorizationError(
        "Invitation is not pending",
        "INVITE_NOT_PENDING",
        409,
      );
    }
    if (msg.includes("not found") || msg.includes("workspace missing")) {
      throw new AuthorizationError(
        "Invitation not found",
        "INVITE_NOT_FOUND",
        404,
      );
    }
    throw new AuthorizationError(
      "Unable to accept invitation",
      "INVITE_ACCEPT_FAILED",
      500,
    );
  }

  return { memberId: String(data) };
}

export async function getWorkspaceBillingSummary(input: {
  actorUserId: string;
  workspaceId: string;
}): Promise<{
  workspaceId: string;
  ownerId: string;
  planTier: string | null;
  membershipStatus: string | null;
  creditsRemaining: number | "unlimited" | null;
  canManageBilling: boolean;
  canViewInvoices: boolean;
}> {
  const membership = await assertWorkspaceMembership(
    input.actorUserId,
    input.workspaceId,
  );
  if (!canViewBillingSummary(membership.role)) {
    throw new AuthorizationError(
      "Billing summary not available for this role",
      "BILLING_VIEW_FORBIDDEN",
      403,
    );
  }

  const admin = createSupabaseAdminClient();
  const { data: workspace } = await admin
    .from("workspaces")
    .select("owner_id")
    .eq("id", input.workspaceId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!workspace) {
    throw new AuthorizationError(
      "Workspace not found",
      "WORKSPACE_NOT_FOUND",
      404,
    );
  }

  const ownerId = (workspace as { owner_id: string }).owner_id;
  const { data: membershipRow } = await admin
    .from("memberships")
    .select("tier, status")
    .eq("user_id", ownerId)
    .maybeSingle();

  const { data: creditsRow } = await admin
    .from("credits")
    .select("balance, is_unlimited")
    .eq("user_id", ownerId)
    .maybeSingle();

  const m = membershipRow as {
    tier?: string;
    status?: string;
  } | null;
  const c = creditsRow as {
    balance?: number;
    is_unlimited?: boolean;
  } | null;

  const isOwner = membership.role === "OWNER";
  return {
    workspaceId: input.workspaceId,
    ownerId,
    planTier: m?.tier ?? null,
    membershipStatus: m?.status ?? null,
    creditsRemaining: c?.is_unlimited
      ? "unlimited"
      : typeof c?.balance === "number"
        ? c.balance
        : null,
    canManageBilling: isOwner,
    canViewInvoices: isOwner,
  };
}

export { assignableRolesFor };
