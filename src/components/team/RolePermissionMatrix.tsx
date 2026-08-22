"use client";

import * as React from "react";

import { RolePermissionMatrixGrantMark } from "@/components/team/RolePermissionMatrixGrantMark";
import { RolePermissionMatrixMobileGroup } from "@/components/team/RolePermissionMatrixMobileGroup";
import { RolePermissionMatrixTable } from "@/components/team/RolePermissionMatrixTable";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  ROLE_PERMISSION_MATRIX_COPY,
  type RolePermissionMatrixState,
} from "@/config/role-permission-matrix";
import type { TeamMemberRole } from "@/config/team-member-card";
import { rolePermissionMatrixAnalytics } from "@/lib/analytics/role-permission-matrix-events";
import {
  buildRolePermissionMatrixGroupSections,
  getRolePermissionMatrix,
  rolePermissionMatrixRoles,
  rolePermissionRoleLabel,
  type RolePermissionMatrixData,
} from "@/utils/role-permission-matrix";
import { cn } from "@/utils/cn";

export type RolePermissionMatrixProps = {
  /** Override default mock grants (partial merge). */
  matrix?: Partial<RolePermissionMatrixData> | null;
  /** Admin billing org flag — affects Admin billing cells. */
  adminBillingEnabled?: boolean;
  /** Highlight a role column / card when member role is focused. */
  highlightedRole?: TeamMemberRole | null;
  state?: RolePermissionMatrixState;
  onRetry?: () => void;
  className?: string;
};

/**
 * COMPONENT-054 — Role Permission Matrix.
 * Read-only Business role × permission table — mock data only.
 */
export function RolePermissionMatrix({
  matrix: matrixOverride = null,
  adminBillingEnabled = true,
  highlightedRole = null,
  state = "default",
  onRetry,
  className,
}: RolePermissionMatrixProps) {
  const viewed = React.useRef(false);
  const loading = state === "loading";
  const isError = state === "error";

  const matrix = React.useMemo(
    () => getRolePermissionMatrix(matrixOverride),
    [matrixOverride],
  );
  const groupSections = React.useMemo(
    () => buildRolePermissionMatrixGroupSections(matrix, adminBillingEnabled),
    [adminBillingEnabled, matrix],
  );
  const roles = rolePermissionMatrixRoles();

  React.useEffect(() => {
    if (viewed.current || loading || isError) return;
    viewed.current = true;
    rolePermissionMatrixAnalytics.viewed();
  }, [isError, loading]);

  return (
    <section
      className={cn(
        "flex w-full flex-col gap-lg rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg",
        className,
      )}
      aria-busy={loading || undefined}
      aria-labelledby="role-permission-matrix-title"
    >
      <div className="flex flex-col gap-sm">
        <h3
          id="role-permission-matrix-title"
          className="text-h4 font-semibold text-foreground"
        >
          {ROLE_PERMISSION_MATRIX_COPY.title}
        </h3>
        <BodySmall className="text-muted-foreground">
          {ROLE_PERMISSION_MATRIX_COPY.caption}
        </BodySmall>
      </div>

      <div className="flex flex-wrap gap-md" aria-hidden={loading || isError}>
        <LegendItem granted />
        <LegendItem granted={false} />
      </div>

      {loading ? <MatrixLoadingSkeleton /> : null}

      {isError ? (
        <MatrixErrorState onRetry={onRetry} />
      ) : null}

      {!loading && !isError ? (
        <>
          <div className="hidden md:block">
            <RolePermissionMatrixTable
              groupSections={groupSections}
              roles={roles}
              highlightedRole={highlightedRole}
            />
          </div>

          <ul className="m-0 flex list-none flex-col gap-md p-0 md:hidden">
            {roles.map((role) => (
              <li
                key={role}
                className={cn(
                  "flex flex-col gap-md rounded-md border border-border p-md",
                  highlightedRole === role &&
                    "border-primary ring-2 ring-ring",
                )}
              >
                <Caption className="font-semibold text-foreground">
                  {rolePermissionRoleLabel(role)}
                </Caption>
                <div className="flex flex-col gap-sm">
                  {groupSections.map((section) => (
                    <RolePermissionMatrixMobileGroup
                      key={`${role}-${section.groupId}`}
                      groupId={section.groupId}
                      groupLabel={section.label}
                      role={role}
                      rows={section.rows}
                    />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

function LegendItem({ granted }: { granted: boolean }) {
  return (
    <div className="inline-flex items-center gap-sm">
      <RolePermissionMatrixGrantMark
        cell={{ granted, orgDependent: false }}
        compact
      />
      <Caption className="text-muted-foreground">
        {granted
          ? ROLE_PERMISSION_MATRIX_COPY.legendAllowed
          : ROLE_PERMISSION_MATRIX_COPY.legendNotAllowed}
      </Caption>
    </div>
  );
}

function MatrixLoadingSkeleton() {
  return (
    <>
      <Caption className="sr-only" role="status">
        {ROLE_PERMISSION_MATRIX_COPY.loading}
      </Caption>
      <div className="flex flex-col gap-sm">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </>
  );
}

function MatrixErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div
      className="flex flex-col gap-md rounded-md border border-border p-md"
      role="alert"
    >
      <BodySmall className="text-foreground">
        {ROLE_PERMISSION_MATRIX_COPY.loadError}
      </BodySmall>
      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-full sm:w-auto"
          onClick={onRetry}
        >
          {ROLE_PERMISSION_MATRIX_COPY.retry}
        </Button>
      ) : null}
    </div>
  );
}
