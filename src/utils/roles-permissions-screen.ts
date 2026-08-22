/**
 * SCREEN-022 — Roles & Permissions screen helpers.
 * Actor gating + staged role maps — no React / no API.
 */

import {
  ROLES_PERMISSIONS_COPY,
  type RolesPermissionsActorRole,
} from "@/config/roles-permissions-screen";
import {
  ASSIGNABLE_TEAM_MEMBER_ROLES,
  type AssignableTeamMemberRole,
  type TeamMemberRole,
} from "@/config/team-member-card";
import { teamMemberRoleLabel } from "@/utils/team-member-card";

export function actorCanManageRoles(
  actorRole: RolesPermissionsActorRole,
): boolean {
  return actorRole === "owner" || actorRole === "admin";
}

export function isAssignableTeamMemberRole(
  value: string,
): value is AssignableTeamMemberRole {
  return (ASSIGNABLE_TEAM_MEMBER_ROLES as readonly string[]).includes(value);
}

export function isRolesPermissionsActorRole(
  value: string,
): value is RolesPermissionsActorRole {
  return ["owner", "admin", "designer", "analyst", "viewer"].includes(value);
}

export type MemberRoleMap = Record<string, TeamMemberRole>;

export function buildMemberRoleMap(
  members: Array<{ id: string; role: TeamMemberRole }>,
): MemberRoleMap {
  return members.reduce<MemberRoleMap>((acc, member) => {
    acc[member.id] = member.role;
    return acc;
  }, {});
}

export function countStagedRoleChanges(
  saved: MemberRoleMap,
  staged: MemberRoleMap,
): number {
  let count = 0;
  for (const id of Object.keys(staged)) {
    if (saved[id] !== staged[id]) count += 1;
  }
  return count;
}

export function rolesPermissionsDirty(
  saved: MemberRoleMap,
  staged: MemberRoleMap,
): boolean {
  return countStagedRoleChanges(saved, staged) > 0;
}

export function roleChangeConfirmDescription(input: {
  memberName: string;
  fromRole: TeamMemberRole;
  toRole: TeamMemberRole;
}): string {
  return `${input.memberName} ${ROLES_PERMISSIONS_COPY.roleChangeConfirmPrefix} ${teamMemberRoleLabel(input.fromRole)} to ${teamMemberRoleLabel(input.toRole)}. ${ROLES_PERMISSIONS_COPY.roleChangeConfirmSuffix}`;
}

export function rolesPermissionsSectionElementId(section: string): string {
  return `roles-permissions-section-${section}`;
}
