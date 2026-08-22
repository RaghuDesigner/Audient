/**
 * COMPONENT-055 — Team Activity Card constants.
 * Mock activity feed — no realtime / no backend.
 */

export const TEAM_ACTIVITY_TYPES = [
  "audit_created",
  "audit_completed",
  "audit_deleted",
  "member_invited",
  "member_removed",
  "role_changed",
  "subscription_updated",
] as const;

export type TeamActivityType = (typeof TEAM_ACTIVITY_TYPES)[number];

export const TEAM_ACTIVITY_TYPE_LABELS: Record<TeamActivityType, string> = {
  audit_created: "Audit Created",
  audit_completed: "Audit Completed",
  audit_deleted: "Audit Deleted",
  member_invited: "Member Invited",
  member_removed: "Member Removed",
  role_changed: "Role Changed",
  subscription_updated: "Subscription Updated",
};

export const TEAM_ACTIVITY_CARD_STATES = [
  "default",
  "loading",
  "empty",
] as const;

export type TeamActivityCardState =
  (typeof TEAM_ACTIVITY_CARD_STATES)[number];

export const TEAM_ACTIVITY_CARD_COPY = {
  title: "Team activity",
  systemUser: "System",
  emptyTitle: "No team activity yet",
  emptyDescription:
    "When your team creates audits or manages members, activity will show up here.",
  loading: "Loading team activity…",
  viewAll: "View all",
} as const;

export const TEAM_ACTIVITY_CARD_ANALYTICS_SOURCE =
  "team_activity_card" as const;
