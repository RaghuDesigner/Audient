/**
 * COMPONENT-057 — Role Card helpers.
 * Permission counts from shared matrix — no duplicate grant table.
 */

import { ROLE_CARD_COPY, ROLE_CARD_DESCRIPTIONS } from "@/config/role-card";
import { ROLE_PERMISSION_KEYS } from "@/config/role-permission-matrix";
import type { TeamMemberRole } from "@/config/team-member-card";
import {
  getRolePermissionMatrix,
  resolveRolePermissionGrant,
  type RolePermissionMatrixData,
} from "@/utils/role-permission-matrix";
import { teamMemberRoleLabel } from "@/utils/team-member-card";
import type { TeamMemberCardModel } from "@/utils/team-member-card";

export function roleCardDescription(role: TeamMemberRole): string {
  return ROLE_CARD_DESCRIPTIONS[role];
}

export function countAllowedPermissionsForRole(
  role: TeamMemberRole,
  adminBillingEnabled = true,
  matrix?: RolePermissionMatrixData,
): number {
  const resolved = getRolePermissionMatrix(matrix ?? null);
  return ROLE_PERMISSION_KEYS.filter(
    (key) =>
      resolveRolePermissionGrant(key, role, resolved, adminBillingEnabled)
        .granted,
  ).length;
}

export function formatRoleCardPermissionCount(count: number): string {
  const noun =
    count === 1
      ? ROLE_CARD_COPY.permissionSingular
      : ROLE_CARD_COPY.permissionPlural;
  return `${count} ${noun}`;
}

export function formatRoleCardMemberCount(count: number): string {
  const noun =
    count === 1 ? ROLE_CARD_COPY.memberSingular : ROLE_CARD_COPY.memberPlural;
  return `${count} ${noun}`;
}

/** System template roles are not editable this phase (SCREEN-022). */
export function canEditRoleCard(
  role: TeamMemberRole,
  showEditRole = false,
): boolean {
  return showEditRole && role !== "owner";
}

export function roleCardAccessibleName(input: {
  role: TeamMemberRole;
  memberCount: number;
  permissionCount: number;
  selected?: boolean;
}): string {
  const parts = [
    `${teamMemberRoleLabel(input.role)} role`,
    formatRoleCardMemberCount(input.memberCount),
    formatRoleCardPermissionCount(input.permissionCount),
  ];
  if (input.selected) {
    parts.push(ROLE_CARD_COPY.selectedLabel);
  }
  return parts.join(", ");
}

export function aggregateMemberCountsByRole(
  members: TeamMemberCardModel[],
): Record<TeamMemberRole, number> {
  const counts: Record<TeamMemberRole, number> = {
    owner: 0,
    admin: 0,
    designer: 0,
    analyst: 0,
    viewer: 0,
  };
  for (const member of members) {
    counts[member.role] += 1;
  }
  return counts;
}
