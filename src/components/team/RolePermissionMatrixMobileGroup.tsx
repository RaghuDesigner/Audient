"use client";

import { PermissionGroupFromMatrixRows } from "@/components/team/PermissionGroup";
import type { RolePermissionGroupId } from "@/config/role-permission-matrix";
import type { TeamMemberRole } from "@/config/team-member-card";
import type { RolePermissionMatrixRow } from "@/utils/role-permission-matrix";

export type RolePermissionMatrixMobileGroupProps = {
  groupLabel: string;
  groupId: string;
  role: TeamMemberRole;
  rows: RolePermissionMatrixRow[];
};

/**
 * COMPONENT-054 — Expandable permission group for mobile role cards.
 * Composes PermissionGroup (COMPONENT-058).
 */
export function RolePermissionMatrixMobileGroup({
  groupLabel,
  groupId,
  role,
  rows,
}: RolePermissionMatrixMobileGroupProps) {
  return (
    <PermissionGroupFromMatrixRows
      groupId={groupId as RolePermissionGroupId}
      groupLabel={groupLabel}
      role={role}
      rows={rows}
      layout="accordion"
    />
  );
}
