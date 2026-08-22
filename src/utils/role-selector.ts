/**
 * COMPONENT-059 — Role Selector helpers.
 * Option and disabled rules — no React / no API.
 */

import { ROLE_SELECTOR_COPY } from "@/config/role-selector";
import {
  ASSIGNABLE_TEAM_MEMBER_ROLES,
  TEAM_MEMBER_ROLE_LABELS,
  type AssignableTeamMemberRole,
  type TeamMemberRole,
} from "@/config/team-member-card";
import type { RoleSelectorState } from "@/config/role-selector";
import { teamMemberRoleLabel } from "@/utils/team-member-card";

export function roleSelectorLabel(memberName: string): string {
  return `${ROLE_SELECTOR_COPY.labelPrefix} ${memberName}`;
}

export function isRoleSelectorOwnerLocked(role: TeamMemberRole): boolean {
  return role === "owner";
}

export function isRoleSelectorControlDisabled(input: {
  role: TeamMemberRole;
  disabled?: boolean;
  state?: RoleSelectorState;
}): boolean {
  if (input.disabled) return true;
  if (input.state === "loading") return true;
  return isRoleSelectorOwnerLocked(input.role);
}

export function roleSelectorOptions(): Array<{
  value: AssignableTeamMemberRole;
  label: string;
}> {
  return ASSIGNABLE_TEAM_MEMBER_ROLES.map((value) => ({
    value,
    label: TEAM_MEMBER_ROLE_LABELS[value],
  }));
}

export function isAssignableRoleValue(
  value: string,
): value is AssignableTeamMemberRole {
  return (ASSIGNABLE_TEAM_MEMBER_ROLES as readonly string[]).includes(value);
}

export function roleSelectorDisplayValue(role: TeamMemberRole): string {
  return teamMemberRoleLabel(role);
}
