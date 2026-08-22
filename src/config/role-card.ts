/**
 * COMPONENT-057 — Role Card constants.
 * Mock role summary display — no backend / no Supabase.
 */

import type { TeamMemberRole } from "@/config/team-member-card";

export const ROLE_CARD_STATUSES = ["system"] as const;

export type RoleCardStatus = (typeof ROLE_CARD_STATUSES)[number];

export const ROLE_CARD_STATUS_LABELS: Record<RoleCardStatus, string> = {
  system: "System",
};

export const ROLE_CARD_DESCRIPTIONS: Record<TeamMemberRole, string> = {
  owner: "Full organization access",
  admin: "Organization administration",
  designer: "Product and audit work",
  analyst: "Analytics and reporting",
  viewer: "Read-only access",
};

export const ROLE_CARD_COPY = {
  permissions: "Permissions",
  members: "Members",
  status: "Status",
  viewPermissions: "View Permissions",
  editRole: "Edit Role",
  permissionSingular: "permission",
  permissionPlural: "permissions",
  memberSingular: "member",
  memberPlural: "members",
  editDisabledHint: "System roles cannot be edited",
  selectedLabel: "Selected",
} as const;

export const ROLE_CARD_ANALYTICS_SOURCE = "role_card" as const;
