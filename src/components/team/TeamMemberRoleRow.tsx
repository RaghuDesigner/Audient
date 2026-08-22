"use client";

import * as React from "react";

import { UserAvatar } from "@/components/dashboard/UserAvatar";
import { RoleSelector } from "@/components/team/RoleSelector";
import { BodySmall, Caption } from "@/components/ui/typography";
import { TEAM_MEMBER_CARD_COPY } from "@/config/team-member-card";
import type {
  AssignableTeamMemberRole,
  TeamMemberRole,
  TeamMemberStatus,
} from "@/config/team-member-card";
import type { RoleSelectorState } from "@/config/role-selector";
import {
  teamMemberRoleLabel,
  teamMemberStatusLabel,
} from "@/utils/team-member-card";
import { cn } from "@/utils/cn";

export type TeamMemberRoleRowProps = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  lastActive: string;
  selectorState?: RoleSelectorState;
  selectorErrorMessage?: string;
  selectorDisabled?: boolean;
  onStageChange: (
    memberId: string,
    fromRole: TeamMemberRole,
    toRole: AssignableTeamMemberRole,
  ) => void;
  onFocusRole?: (role: TeamMemberRole) => void;
  className?: string;
};

/**
 * SCREEN-022 — Team member row with RoleSelector (COMPONENT-059).
 * Owner rows are read-only — mock only.
 */
export function TeamMemberRoleRow({
  id,
  name,
  email,
  avatarUrl = null,
  role,
  status,
  lastActive,
  selectorState = "default",
  selectorErrorMessage,
  selectorDisabled = false,
  onStageChange,
  onFocusRole,
  className,
}: TeamMemberRoleRowProps) {
  return (
    <article
      className={cn(
        "flex w-full flex-col gap-md rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg",
        className,
      )}
      aria-labelledby={`member-name-${id}`}
    >
      <div className="flex flex-col gap-md lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-col gap-md sm:flex-row sm:items-center">
          <UserAvatar displayName={name} avatarUrl={avatarUrl} size="md" />
          <div className="min-w-0 flex-1">
            <BodySmall
              id={`member-name-${id}`}
              className="font-semibold text-foreground"
            >
              {name}
            </BodySmall>
            <Caption className="mt-sm break-all text-muted-foreground">
              {email}
            </Caption>
          </div>
        </div>

        <RoleSelector
          memberId={id}
          memberName={name}
          value={role}
          state={selectorState}
          errorMessage={selectorErrorMessage}
          disabled={selectorDisabled}
          className="w-full lg:max-w-xs"
          onFocus={onFocusRole}
          onStageChange={(fromRole, toRole) =>
            onStageChange(id, fromRole, toRole)
          }
        />
      </div>

      <dl className="m-0 grid grid-cols-1 gap-md sm:grid-cols-2">
        <div className="flex flex-col gap-sm">
          <dt className="text-caption font-semibold text-muted-foreground">
            {TEAM_MEMBER_CARD_COPY.role}
          </dt>
          <dd className="m-0 text-body-sm text-foreground">
            {teamMemberRoleLabel(role)}
          </dd>
        </div>
        <div className="flex flex-col gap-sm">
          <dt className="text-caption font-semibold text-muted-foreground">
            {TEAM_MEMBER_CARD_COPY.status}
          </dt>
          <dd className="m-0 text-body-sm text-foreground">
            {teamMemberStatusLabel(status)}
          </dd>
        </div>
        <div className="flex flex-col gap-sm sm:col-span-2 lg:col-span-1">
          <dt className="text-caption font-semibold text-muted-foreground">
            {TEAM_MEMBER_CARD_COPY.lastActive}
          </dt>
          <dd className="m-0 text-body-sm text-foreground">{lastActive}</dd>
        </div>
      </dl>
    </article>
  );
}
