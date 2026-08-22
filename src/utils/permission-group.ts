/**
 * COMPONENT-058 — Permission Group helpers.
 * Maps shared matrix rows to group items — no duplicate grant logic.
 */

import {
  PERMISSION_GROUP_COPY,
  ROLE_PERMISSION_DESCRIPTIONS,
} from "@/config/permission-group";
import {
  ROLE_PERMISSION_GROUP_LABELS,
  type RolePermissionGroupId,
  type RolePermissionKey,
} from "@/config/role-permission-matrix";
import type { TeamMemberRole } from "@/config/team-member-card";
import type { RolePermissionGrantCell } from "@/utils/role-permission-matrix";
import type { RolePermissionMatrixRow } from "@/utils/role-permission-matrix";
import { rolePermissionRoleLabel } from "@/utils/role-permission-matrix";

export type PermissionGroupItem = {
  key: RolePermissionKey;
  label: string;
  description: string;
  grant: RolePermissionGrantCell;
};

export function permissionGroupLabel(
  groupId: RolePermissionGroupId,
  override?: string,
): string {
  return override ?? ROLE_PERMISSION_GROUP_LABELS[groupId];
}

export function permissionDescription(key: RolePermissionKey): string {
  return ROLE_PERMISSION_DESCRIPTIONS[key];
}

export function buildPermissionGroupItemsFromRows(
  rows: RolePermissionMatrixRow[],
  role: TeamMemberRole,
): PermissionGroupItem[] {
  return rows.map((row) => ({
    key: row.key,
    label: row.label,
    description: permissionDescription(row.key),
    grant: row.grants[role],
  }));
}

export function permissionGroupSummaryAriaLabel(input: {
  groupLabel: string;
  role?: TeamMemberRole;
  expanded?: boolean;
}): string {
  const rolePart = input.role
    ? ` ${PERMISSION_GROUP_COPY.permissionsForRole} ${rolePermissionRoleLabel(input.role)}.`
    : ".";
  const action = input.expanded
    ? PERMISSION_GROUP_COPY.collapseGroup
    : PERMISSION_GROUP_COPY.expandGroup;
  return `${input.groupLabel}${rolePart} ${action}`;
}

export function permissionGroupElementId(
  groupId: RolePermissionGroupId,
  role?: TeamMemberRole,
  suffix?: string,
): string {
  const rolePart = role ? `-${role}` : "";
  const suffixPart = suffix ? `-${suffix}` : "";
  return `permission-group${rolePart}-${groupId}${suffixPart}`;
}
