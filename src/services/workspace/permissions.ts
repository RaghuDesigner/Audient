import "server-only";

import type { WorkspaceMemberRole } from "@/services/workspace/membership";

/** Roles that may invite / manage non-privileged seats (009A matrix). */
export const WORKSPACE_TEAM_MANAGE_ROLES: readonly WorkspaceMemberRole[] = [
  "OWNER",
  "ADMIN",
];

export const WORKSPACE_INVITE_ROLES: readonly WorkspaceMemberRole[] = [
  "OWNER",
  "ADMIN",
];

/** Roles an OWNER may assign via invite / role change. */
export const OWNER_ASSIGNABLE_ROLES: readonly WorkspaceMemberRole[] = [
  "ADMIN",
  "DESIGNER",
  "ANALYST",
  "VIEWER",
];

/** Roles an ADMIN may assign (never ADMIN/OWNER). */
export const ADMIN_ASSIGNABLE_ROLES: readonly WorkspaceMemberRole[] = [
  "DESIGNER",
  "ANALYST",
  "VIEWER",
];

/** Create-capable seats (brief "MEMBER" maps to these existing roles). */
export const WORKSPACE_CREATE_AUDIT_ROLES: readonly WorkspaceMemberRole[] = [
  "OWNER",
  "ADMIN",
  "DESIGNER",
  "ANALYST",
];

export const WORKSPACE_BILLING_MANAGE_ROLES: readonly WorkspaceMemberRole[] = [
  "OWNER",
];

/** Limited plan/credits visibility — OWNER + ADMIN only. */
export const WORKSPACE_BILLING_VIEW_ROLES: readonly WorkspaceMemberRole[] = [
  "OWNER",
  "ADMIN",
];

export function canInviteMembers(role: WorkspaceMemberRole): boolean {
  return (WORKSPACE_INVITE_ROLES as readonly string[]).includes(role);
}

export function canManageTeam(role: WorkspaceMemberRole): boolean {
  return (WORKSPACE_TEAM_MANAGE_ROLES as readonly string[]).includes(role);
}

export function canManageBilling(role: WorkspaceMemberRole): boolean {
  return (WORKSPACE_BILLING_MANAGE_ROLES as readonly string[]).includes(role);
}

export function canViewBillingSummary(role: WorkspaceMemberRole): boolean {
  return (WORKSPACE_BILLING_VIEW_ROLES as readonly string[]).includes(role);
}

export function assignableRolesFor(
  actorRole: WorkspaceMemberRole,
): readonly WorkspaceMemberRole[] {
  if (actorRole === "OWNER") return OWNER_ASSIGNABLE_ROLES;
  if (actorRole === "ADMIN") return ADMIN_ASSIGNABLE_ROLES;
  return [];
}

/**
 * Whether actor may change target's role / status / remove them.
 * OWNER seat is protected; ADMIN cannot touch OWNER/ADMIN seats.
 */
export function canMutateMemberSeat(input: {
  actorRole: WorkspaceMemberRole;
  targetRole: WorkspaceMemberRole;
  targetUserId: string;
  actorUserId: string;
}): boolean {
  const { actorRole, targetRole, targetUserId, actorUserId } = input;
  if (targetUserId === actorUserId) return false;
  if (targetRole === "OWNER") return false;
  if (!canManageTeam(actorRole)) return false;
  if (actorRole === "ADMIN" && targetRole === "ADMIN") {
    return false;
  }
  return true;
}

export function canAssignRole(
  actorRole: WorkspaceMemberRole,
  nextRole: WorkspaceMemberRole,
): boolean {
  return assignableRolesFor(actorRole).includes(nextRole);
}
