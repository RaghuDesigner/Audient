"use client";

import { RolePermissionMatrixGrantMark } from "@/components/team/RolePermissionMatrixGrantMark";
import { ROLE_PERMISSION_MATRIX_COPY } from "@/config/role-permission-matrix";
import type { TeamMemberRole } from "@/config/team-member-card";
import {
  rolePermissionRoleLabel,
  type RolePermissionMatrixGroupSection,
} from "@/utils/role-permission-matrix";
import { cn } from "@/utils/cn";

export type RolePermissionMatrixTableProps = {
  groupSections: RolePermissionMatrixGroupSection[];
  roles: TeamMemberRole[];
  highlightedRole?: TeamMemberRole | null;
};

/**
 * COMPONENT-054 — Desktop / tablet semantic permission matrix table.
 */
export function RolePermissionMatrixTable({
  groupSections,
  roles,
  highlightedRole = null,
}: RolePermissionMatrixTableProps) {
  return (
    <div
      className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      tabIndex={0}
      role="region"
      aria-label={ROLE_PERMISSION_MATRIX_COPY.tableScrollLabel}
    >
      <table className="w-full min-w-[48rem] border-collapse text-left">
        <caption className="sr-only">
          {ROLE_PERMISSION_MATRIX_COPY.caption}
        </caption>
        <thead>
          <tr className="border-b border-border">
            <th
              scope="col"
              className="sticky left-0 z-10 bg-surface px-md py-sm text-caption font-semibold text-muted-foreground"
            >
              {ROLE_PERMISSION_MATRIX_COPY.permissionColumn}
            </th>
            {roles.map((role) => (
              <th
                key={role}
                scope="col"
                className={cn(
                  "px-md py-sm text-center text-caption font-semibold text-foreground",
                  highlightedRole === role && "bg-primary/10",
                )}
              >
                {rolePermissionRoleLabel(role)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groupSections.map((section) => (
            <TableGroupSection
              key={section.groupId}
              section={section}
              roles={roles}
              highlightedRole={highlightedRole}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableGroupSection({
  section,
  roles,
  highlightedRole,
}: {
  section: RolePermissionMatrixGroupSection;
  roles: TeamMemberRole[];
  highlightedRole: TeamMemberRole | null;
}) {
  return (
    <>
      <tr className="border-b border-border bg-muted/40">
        <th
          scope="colgroup"
          colSpan={roles.length + 1}
          className="sticky left-0 px-md py-sm text-left text-caption font-semibold uppercase tracking-wide text-muted-foreground"
        >
          {section.label}
        </th>
      </tr>
      {section.rows.map((row) => (
        <tr key={row.key} className="border-b border-border last:border-0">
          <th
            scope="row"
            className="sticky left-0 z-10 bg-surface px-md py-md text-body-sm font-medium text-foreground"
          >
            {row.label}
          </th>
          {roles.map((role) => (
            <td
              key={role}
              className={cn(
                "px-md py-md text-center text-body-sm text-foreground",
                highlightedRole === role && "bg-primary/5",
              )}
            >
              <RolePermissionMatrixGrantMark cell={row.grants[role]} compact />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
