"use client";

import { PermissionBadge } from "@/components/common/PermissionBadge";
import type { RolePermissionGrantCell } from "@/utils/role-permission-matrix";
import { cn } from "@/utils/cn";

export type RolePermissionMatrixGrantMarkProps = {
  cell: RolePermissionGrantCell;
  /** Compact layout for dense table cells. */
  compact?: boolean;
  className?: string;
};

/**
 * COMPONENT-054 — Grant indicator for Role Permission Matrix cells.
 * Composes PermissionBadge (COMPONENT-060).
 */
export function RolePermissionMatrixGrantMark({
  cell,
  compact = false,
  className,
}: RolePermissionMatrixGrantMarkProps) {
  return (
    <PermissionBadge
      cell={cell}
      size="sm"
      compact={compact}
      className={cn(compact && "min-w-[5.5rem]", className)}
    />
  );
}
