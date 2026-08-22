/**
 * COMPONENT-052 — Team Member Card helpers.
 * Labels + action availability — no React / no API.
 */

import {
  TEAM_MEMBER_CARD_COPY,
  TEAM_MEMBER_ROLE_LABELS,
  TEAM_MEMBER_STATUS_LABELS,
  type TeamMemberRole,
  type TeamMemberStatus,
} from "@/config/team-member-card";

export type TeamMemberCardActions = {
  view?: boolean;
  edit?: boolean;
  remove?: boolean;
};

export type TeamMemberCardModel = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  lastActive: string;
};

export function teamMemberRoleLabel(role: TeamMemberRole): string {
  return TEAM_MEMBER_ROLE_LABELS[role];
}

export function teamMemberStatusLabel(status: TeamMemberStatus): string {
  return TEAM_MEMBER_STATUS_LABELS[status];
}

/**
 * Default action visibility for a target member.
 * Owner cannot be removed from the card by default.
 */
export function defaultTeamMemberCardActions(
  role: TeamMemberRole,
  overrides?: TeamMemberCardActions,
): Required<TeamMemberCardActions> {
  const base: Required<TeamMemberCardActions> = {
    view: true,
    edit: true,
    remove: role !== "owner",
  };
  return {
    view: overrides?.view ?? base.view,
    edit: overrides?.edit ?? true,
    remove: overrides?.remove ?? base.remove,
  };
}

export function teamMemberActionAriaLabel(
  action: "view" | "edit" | "remove",
  memberName: string,
): string {
  const verb =
    action === "view"
      ? TEAM_MEMBER_CARD_COPY.view
      : action === "edit"
        ? TEAM_MEMBER_CARD_COPY.edit
        : TEAM_MEMBER_CARD_COPY.remove;
  return `${verb} ${memberName}`;
}
