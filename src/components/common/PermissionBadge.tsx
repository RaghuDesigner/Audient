"use client";

import * as React from "react";
import { Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PERMISSION_BADGE_ICONS } from "@/config/permission-badge";
import type { PermissionBadgeState } from "@/config/permission-badge";
import {
  resolvePermissionBadge,
  type PermissionBadgeResolved,
} from "@/utils/permission-badge";
import type { RolePermissionGrantCell } from "@/utils/role-permission-matrix";
import { cn } from "@/utils/cn";

export type PermissionBadgeProps = {
  /** Semantic status — provide `state` or `cell`. */
  state?: PermissionBadgeState;
  cell?: RolePermissionGrantCell;
  label?: string;
  size?: "sm" | "md" | "lg";
  /** Matrix-style stacked icon + label. */
  compact?: boolean;
  icon?: React.ReactNode;
  className?: string;
  title?: string;
};

/**
 * COMPONENT-060 — Permission Badge.
 * Compact permission status — icon + visible text; not color-only.
 */
export function PermissionBadge({
  state,
  cell,
  label,
  size = "sm",
  compact = false,
  icon,
  className,
  title,
}: PermissionBadgeProps) {
  const resolved = resolvePermissionBadge({ state, cell, label });
  const decorativeIcon = icon ?? permissionBadgeIcon(resolved.state);

  return (
    <Badge
      variant={resolved.variant}
      size={size}
      shape={compact ? "rounded" : "pill"}
      title={title ?? (resolved.label.length > 24 ? resolved.label : undefined)}
      className={cn(
        compact && "min-h-11 min-w-11 flex-col gap-sm whitespace-normal px-sm py-sm",
        !compact && "min-h-7",
        className,
      )}
      icon={
        decorativeIcon ? (
          <span aria-hidden="true" className="inline-flex shrink-0 leading-none">
            {decorativeIcon}
          </span>
        ) : undefined
      }
    >
      <span className={cn(compact && "text-center text-caption leading-tight")}>
        {resolved.label}
      </span>
    </Badge>
  );
}

function permissionBadgeIcon(state: PermissionBadgeResolved["state"]): React.ReactNode {
  if (state === "restricted") {
    return <Lock className="size-3.5" aria-hidden />;
  }
  return (
    <span className="text-inherit">{PERMISSION_BADGE_ICONS[state]}</span>
  );
}
