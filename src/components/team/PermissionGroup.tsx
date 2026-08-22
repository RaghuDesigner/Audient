"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { RolePermissionMatrixGrantMark } from "@/components/team/RolePermissionMatrixGrantMark";
import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  PERMISSION_GROUP_COPY,
  type PermissionGroupLayout,
  type PermissionGroupState,
} from "@/config/permission-group";
import type { RolePermissionGroupId } from "@/config/role-permission-matrix";
import type { TeamMemberRole } from "@/config/team-member-card";
import { permissionGroupAnalytics } from "@/lib/analytics/permission-group-events";
import {
  buildPermissionGroupItemsFromRows,
  permissionGroupElementId,
  permissionGroupLabel,
  permissionGroupSummaryAriaLabel,
  type PermissionGroupItem,
} from "@/utils/permission-group";
import type { RolePermissionMatrixRow } from "@/utils/role-permission-matrix";
import { cn } from "@/utils/cn";

export type PermissionGroupProps = {
  groupId: RolePermissionGroupId;
  groupLabel?: string;
  permissions: PermissionGroupItem[];
  role?: TeamMemberRole;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  state?: PermissionGroupState;
  layout?: PermissionGroupLayout;
  className?: string;
};

/**
 * COMPONENT-058 — Permission Group.
 * Groups related permissions — static on desktop, accordion on mobile.
 * Mock data only; no backend.
 */
export function PermissionGroup({
  groupId,
  groupLabel: groupLabelProp,
  permissions,
  role,
  expanded: expandedProp,
  defaultExpanded = false,
  onExpandedChange,
  state = "default",
  layout = "auto",
  className,
}: PermissionGroupProps) {
  const headingId = permissionGroupElementId(groupId, role, "heading");
  const panelId = permissionGroupElementId(groupId, role, "panel");
  const summaryId = permissionGroupElementId(groupId, role, "summary");
  const loading = state === "loading";
  const label = permissionGroupLabel(groupId, groupLabelProp);
  const controlled = expandedProp !== undefined;
  const [internalExpanded, setInternalExpanded] = React.useState(defaultExpanded);
  const expanded = controlled ? expandedProp : internalExpanded;

  if (!loading && permissions.length === 0) {
    return null;
  }

  const showStatic = layout === "static" || layout === "auto";
  const showAccordion = layout === "accordion" || layout === "auto";

  const handleToggle = (next: boolean) => {
    if (!controlled) {
      setInternalExpanded(next);
    }
    onExpandedChange?.(next);
    if (next) {
      permissionGroupAnalytics.expanded({ groupId, role });
    } else {
      permissionGroupAnalytics.collapsed({ groupId, role });
    }
  };

  return (
    <div className={cn("flex flex-col", className)} aria-busy={loading || undefined}>
      {loading ? (
        <PermissionGroupSkeleton label={label} />
      ) : (
        <>
          {showStatic ? (
            <section
              className={cn(layout === "auto" && "hidden md:block")}
              aria-labelledby={headingId}
            >
              <h4
                id={headingId}
                className="mb-md text-caption font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {label}
              </h4>
              <PermissionList
                id={panelId}
                permissions={permissions}
                labelledBy={headingId}
              />
            </section>
          ) : null}

          {showAccordion ? (
            <details
              className={cn(
                "group rounded-md border border-border",
                layout === "auto" && "md:hidden",
              )}
              open={expanded}
              onToggle={(event) => {
                handleToggle(event.currentTarget.open);
              }}
            >
              <summary
                id={summaryId}
                className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-md px-md py-sm marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none [&::-webkit-details-marker]:hidden"
                aria-expanded={expanded}
                aria-controls={panelId}
                aria-label={permissionGroupSummaryAriaLabel({
                  groupLabel: label,
                  role,
                  expanded,
                })}
              >
                <BodySmall className="font-semibold text-foreground">
                  {label}
                </BodySmall>
                <ChevronDown
                  className="size-4 shrink-0 text-muted-foreground transition-transform duration-fast group-open:rotate-180 motion-reduce:transition-none motion-reduce:group-open:rotate-0"
                  aria-hidden
                />
              </summary>
              <div id={panelId} className="border-t border-border p-md pt-sm">
                <PermissionList
                  permissions={permissions}
                  labelledBy={summaryId}
                />
              </div>
            </details>
          ) : null}
        </>
      )}
    </div>
  );
}

/** Convenience wrapper for Role Permission Matrix mobile rows. */
export type PermissionGroupFromMatrixRowsProps = {
  groupId: RolePermissionGroupId;
  groupLabel?: string;
  role: TeamMemberRole;
  rows: RolePermissionMatrixRow[];
  layout?: PermissionGroupLayout;
  className?: string;
};

export function PermissionGroupFromMatrixRows({
  groupId,
  groupLabel,
  role,
  rows,
  layout = "accordion",
  className,
}: PermissionGroupFromMatrixRowsProps) {
  const permissions = buildPermissionGroupItemsFromRows(rows, role);
  return (
    <PermissionGroup
      groupId={groupId}
      groupLabel={groupLabel}
      permissions={permissions}
      role={role}
      layout={layout}
      className={className}
    />
  );
}

function PermissionList({
  id,
  permissions,
  labelledBy,
}: {
  id?: string;
  permissions: PermissionGroupItem[];
  labelledBy: string;
}) {
  return (
    <ul
      id={id}
      className="m-0 flex list-none flex-col gap-sm p-0"
      aria-labelledby={labelledBy}
    >
      {permissions.map((item) => (
        <li
          key={item.key}
          className="flex flex-col gap-sm border-b border-border py-sm last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-md"
        >
          <div className="min-w-0 flex-1">
            <BodySmall className="font-semibold text-foreground">
              {item.label}
            </BodySmall>
            <Caption className="mt-sm text-muted-foreground">
              {item.description}
            </Caption>
          </div>
          <RolePermissionMatrixGrantMark cell={item.grant} compact />
        </li>
      ))}
    </ul>
  );
}

function PermissionGroupSkeleton({ label }: { label: string }) {
  return (
    <>
      <Caption className="sr-only" role="status">
        {PERMISSION_GROUP_COPY.loading}
      </Caption>
      <div className="flex flex-col gap-sm rounded-md border border-border p-md">
        <BodySmall className="font-semibold text-foreground">{label}</BodySmall>
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </>
  );
}
