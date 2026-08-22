/**
 * COMPONENT-052 — Team Member Card constants.
 * Mock team member display — no backend / no Supabase.
 */

export const TEAM_MEMBER_ROLES = [
  "owner",
  "admin",
  "designer",
  "analyst",
  "viewer",
] as const;

export type TeamMemberRole = (typeof TEAM_MEMBER_ROLES)[number];

/** Roles assignable via invite or role editor — Owner is not assignable. */
export const ASSIGNABLE_TEAM_MEMBER_ROLES = [
  "admin",
  "designer",
  "analyst",
  "viewer",
] as const;

export type AssignableTeamMemberRole =
  (typeof ASSIGNABLE_TEAM_MEMBER_ROLES)[number];

export const TEAM_MEMBER_ROLE_LABELS: Record<TeamMemberRole, string> = {
  owner: "Owner",
  admin: "Admin",
  designer: "Designer",
  analyst: "Analyst",
  viewer: "Viewer",
};

export const TEAM_MEMBER_STATUSES = [
  "active",
  "invited",
  "suspended",
] as const;

export type TeamMemberStatus = (typeof TEAM_MEMBER_STATUSES)[number];

export const TEAM_MEMBER_STATUS_LABELS: Record<TeamMemberStatus, string> = {
  active: "Active",
  invited: "Invited",
  suspended: "Suspended",
};

export const TEAM_MEMBER_CARD_STATES = [
  "default",
  "loading",
  "error",
] as const;

export type TeamMemberCardState = (typeof TEAM_MEMBER_CARD_STATES)[number];

export const TEAM_MEMBER_CARD_COPY = {
  role: "Role",
  status: "Status",
  lastActive: "Last active",
  view: "View",
  edit: "Edit",
  remove: "Remove",
  removeConfirmTitle: "Remove team member?",
  removeConfirmDescription:
    "This removes the member from the team in this mock preview. No account data is permanently deleted.",
  removeConfirmAction: "Remove",
  cancel: "Cancel",
  loading: "Loading member…",
  loadError: "Unable to load team member.",
  retry: "Retry",
  removeSuccess: "Member removed (mock).",
  actionSoon: "Coming soon.",
  ownerRoleDisabled: "Organization owner",
  roleSelectLabel: "Role for",
} as const;

export const TEAM_MEMBER_CARD_ANALYTICS_SOURCE = "team_member_card" as const;
