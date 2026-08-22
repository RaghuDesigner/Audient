/**
 * COMPONENT-054 — Role Permission Matrix helpers.
 * Grant lookup — no React / no API.
 */

import {
  DEFAULT_ROLE_PERMISSION_MATRIX,
  ORG_DEPENDENT_ADMIN_PERMISSIONS,
  ROLE_PERMISSION_GROUP_BY_KEY,
  ROLE_PERMISSION_GROUP_LABELS,
  ROLE_PERMISSION_GROUPS,
  ROLE_PERMISSION_KEYS,
  ROLE_PERMISSION_LABELS,
  ROLE_PERMISSION_MATRIX_COPY,
  ROLE_PERMISSION_MATRIX_ROLES,
  type RolePermissionGroupId,
  type RolePermissionKey,
  type RolePermissionMatrixRole,
} from "@/config/role-permission-matrix";
import { TEAM_MEMBER_ROLE_LABELS } from "@/config/team-member-card";

export type RolePermissionMatrixData = Record<
  RolePermissionKey,
  Record<RolePermissionMatrixRole, boolean>
>;

export type RolePermissionGrantCell = {
  granted: boolean;
  orgDependent: boolean;
};

export type RolePermissionMatrixRow = {
  key: RolePermissionKey;
  label: string;
  groupId: RolePermissionGroupId;
  grants: Record<RolePermissionMatrixRole, RolePermissionGrantCell>;
};

export type RolePermissionMatrixGroupSection = {
  groupId: RolePermissionGroupId;
  label: string;
  rows: RolePermissionMatrixRow[];
};

export function getRolePermissionMatrix(
  override?: Partial<RolePermissionMatrixData> | null,
): RolePermissionMatrixData {
  if (!override) return DEFAULT_ROLE_PERMISSION_MATRIX;
  const next = { ...DEFAULT_ROLE_PERMISSION_MATRIX };
  for (const key of ROLE_PERMISSION_KEYS) {
    if (override[key]) {
      next[key] = { ...next[key], ...override[key] };
    }
  }
  return next;
}

export function isOrgDependentAdminPermission(
  key: RolePermissionKey,
): boolean {
  return (ORG_DEPENDENT_ADMIN_PERMISSIONS as readonly string[]).includes(key);
}

export function resolveRolePermissionGrant(
  key: RolePermissionKey,
  role: RolePermissionMatrixRole,
  matrix: RolePermissionMatrixData = DEFAULT_ROLE_PERMISSION_MATRIX,
  adminBillingEnabled = true,
): RolePermissionGrantCell {
  const orgDependent =
    role === "admin" && isOrgDependentAdminPermission(key);

  if (orgDependent) {
    return { granted: adminBillingEnabled, orgDependent: true };
  }

  return {
    granted: matrix[key][role],
    orgDependent: false,
  };
}

export function buildRolePermissionMatrixRows(
  matrix: RolePermissionMatrixData = DEFAULT_ROLE_PERMISSION_MATRIX,
  adminBillingEnabled = true,
): RolePermissionMatrixRow[] {
  return ROLE_PERMISSION_KEYS.map((key) => ({
    key,
    label: ROLE_PERMISSION_LABELS[key],
    groupId: ROLE_PERMISSION_GROUP_BY_KEY[key],
    grants: ROLE_PERMISSION_MATRIX_ROLES.reduce(
      (acc, role) => {
        acc[role] = resolveRolePermissionGrant(
          key,
          role,
          matrix,
          adminBillingEnabled,
        );
        return acc;
      },
      {} as Record<RolePermissionMatrixRole, RolePermissionGrantCell>,
    ),
  }));
}

export function buildRolePermissionMatrixGroupSections(
  matrix: RolePermissionMatrixData = DEFAULT_ROLE_PERMISSION_MATRIX,
  adminBillingEnabled = true,
): RolePermissionMatrixGroupSection[] {
  const rows = buildRolePermissionMatrixRows(matrix, adminBillingEnabled);
  return ROLE_PERMISSION_GROUPS.map((groupId) => ({
    groupId,
    label: ROLE_PERMISSION_GROUP_LABELS[groupId],
    rows: rows.filter((row) => row.groupId === groupId),
  })).filter((section) => section.rows.length > 0);
}

export function rolePermissionCellLabel(cell: RolePermissionGrantCell): string {
  if (cell.orgDependent) {
    return cell.granted
      ? ROLE_PERMISSION_MATRIX_COPY.allowedOrgSetting
      : ROLE_PERMISSION_MATRIX_COPY.notAllowedOrgSetting;
  }
  return cell.granted
    ? ROLE_PERMISSION_MATRIX_COPY.allowed
    : ROLE_PERMISSION_MATRIX_COPY.notAllowed;
}

export function rolePermissionRoleLabel(
  role: RolePermissionMatrixRole,
): string {
  return TEAM_MEMBER_ROLE_LABELS[role];
}

export function rolePermissionMatrixRoles(): RolePermissionMatrixRole[] {
  return [...ROLE_PERMISSION_MATRIX_ROLES];
}
