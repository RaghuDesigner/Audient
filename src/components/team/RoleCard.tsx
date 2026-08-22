"use client";

import * as React from "react";

import {
  Card,
  CardActions,
  CardBadge,
  CardContent,
  CardFooter,
  CardHeader,
  CardSubtitle,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BodySmall } from "@/components/ui/typography";
import {
  ROLE_CARD_COPY,
  ROLE_CARD_STATUS_LABELS,
  type RoleCardStatus,
} from "@/config/role-card";
import type { TeamMemberRole } from "@/config/team-member-card";
import { roleCardAnalytics } from "@/lib/analytics/role-card-events";
import {
  canEditRoleCard,
  countAllowedPermissionsForRole,
  formatRoleCardMemberCount,
  formatRoleCardPermissionCount,
  roleCardAccessibleName,
  roleCardDescription,
} from "@/utils/role-card";
import { teamMemberRoleLabel } from "@/utils/team-member-card";
import { cn } from "@/utils/cn";

export type RoleCardProps = {
  role: TeamMemberRole;
  memberCount: number;
  /** Affects Admin permission count — matches Role Permission Matrix. */
  adminBillingEnabled?: boolean;
  description?: string;
  status?: RoleCardStatus;
  selected?: boolean;
  disabled?: boolean;
  /** Enable Edit Role for non-owner roles (future custom roles). Default false. */
  showEditRole?: boolean;
  onViewPermissions?: (role: TeamMemberRole) => void;
  onEditRole?: (role: TeamMemberRole) => void;
  onSelect?: (role: TeamMemberRole) => void;
  className?: string;
};

/**
 * COMPONENT-057 — Role Card.
 * Role summary tile — mock data only; no backend.
 */
export function RoleCard({
  role,
  memberCount,
  adminBillingEnabled = true,
  description: descriptionProp,
  status = "system",
  selected = false,
  disabled = false,
  showEditRole = false,
  onViewPermissions,
  onEditRole,
  onSelect,
  className,
}: RoleCardProps) {
  const viewed = React.useRef(false);
  const titleId = React.useId();

  const description = descriptionProp ?? roleCardDescription(role);
  const permissionCount = countAllowedPermissionsForRole(
    role,
    adminBillingEnabled,
  );
  const permissionLabel = formatRoleCardPermissionCount(permissionCount);
  const memberLabel = formatRoleCardMemberCount(memberCount);
  const editAllowed = canEditRoleCard(role, showEditRole);
  const selectable = Boolean(onSelect) && !disabled;
  const ariaName = roleCardAccessibleName({
    role,
    memberCount,
    permissionCount,
    selected,
  });

  React.useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    roleCardAnalytics.viewed({ role });
  }, [role]);

  const handleSelect = () => {
    if (!selectable) return;
    roleCardAnalytics.selected({ role });
    onSelect?.(role);
  };

  const handleViewPermissions = () => {
    roleCardAnalytics.viewPermissionsClicked({ role });
    onViewPermissions?.(role);
  };

  const handleEditRole = () => {
    if (!editAllowed) return;
    roleCardAnalytics.editClicked({ role });
    onEditRole?.(role);
  };

  return (
    <Card
      clickable={selectable}
      interactive={selectable}
      padding="md"
      className={cn(
        "flex h-full flex-col",
        selected && "border-primary ring-2 ring-ring",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
      aria-label={ariaName}
      aria-pressed={selectable ? selected : undefined}
      aria-current={selected ? "true" : undefined}
      aria-disabled={disabled || undefined}
      onClick={selectable ? handleSelect : undefined}
    >
      <article className="flex h-full flex-col" aria-labelledby={titleId}>
        <CardHeader>
          <div className="flex min-w-0 flex-1 flex-col gap-sm">
            <CardTitle id={titleId} as="h3">
              {teamMemberRoleLabel(role)}
            </CardTitle>
            <CardSubtitle>{description}</CardSubtitle>
          </div>
          <CardBadge variant="secondary">
            {ROLE_CARD_STATUS_LABELS[status]}
          </CardBadge>
        </CardHeader>

        <CardContent className="flex-1">
          <dl className="m-0 grid grid-cols-1 gap-md sm:grid-cols-2">
            <MetricItem
              label={ROLE_CARD_COPY.permissions}
              value={permissionLabel}
            />
            <MetricItem label={ROLE_CARD_COPY.members} value={memberLabel} />
            <MetricItem
              label={ROLE_CARD_COPY.status}
              value={ROLE_CARD_STATUS_LABELS[status]}
            />
          </dl>
        </CardContent>

        <CardFooter>
          <CardActions className="w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 w-full sm:w-auto"
              disabled={disabled}
              onClick={(event) => {
                event.stopPropagation();
                handleViewPermissions();
              }}
            >
              {ROLE_CARD_COPY.viewPermissions}
            </Button>
            {showEditRole ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="min-h-11 w-full sm:w-auto"
                disabled={disabled || !editAllowed}
                title={
                  editAllowed ? undefined : ROLE_CARD_COPY.editDisabledHint
                }
                aria-label={
                  editAllowed
                    ? ROLE_CARD_COPY.editRole
                    : `${ROLE_CARD_COPY.editRole}. ${ROLE_CARD_COPY.editDisabledHint}`
                }
                onClick={(event) => {
                  event.stopPropagation();
                  handleEditRole();
                }}
              >
                {ROLE_CARD_COPY.editRole}
              </Button>
            ) : null}
          </CardActions>
        </CardFooter>
      </article>
    </Card>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-sm">
      <dt className="text-caption font-semibold text-muted-foreground">
        {label}
      </dt>
      <dd className="m-0">
        <BodySmall className="font-medium text-foreground">{value}</BodySmall>
      </dd>
    </div>
  );
}
