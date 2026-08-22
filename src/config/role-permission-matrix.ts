/**
 * COMPONENT-054 — Role Permission Matrix constants.
 * Read-only mock RBAC display — no backend.
 * SCREEN-022 — five roles, eleven permissions in six groups.
 */

import type { TeamMemberRole } from "@/config/team-member-card";
import { TEAM_MEMBER_ROLES } from "@/config/team-member-card";

export const ROLE_PERMISSION_MATRIX_STATES = [
  "default",
  "loading",
  "error",
] as const;

export type RolePermissionMatrixState =
  (typeof ROLE_PERMISSION_MATRIX_STATES)[number];

export const ROLE_PERMISSION_GROUPS = [
  "audit",
  "reports",
  "team",
  "organization",
  "billing",
  "administration",
] as const;

export type RolePermissionGroupId =
  (typeof ROLE_PERMISSION_GROUPS)[number];

export const ROLE_PERMISSION_GROUP_LABELS: Record<
  RolePermissionGroupId,
  string
> = {
  audit: "Audit",
  reports: "Reports",
  team: "Team",
  organization: "Organization",
  billing: "Billing",
  administration: "Administration",
};

export const ROLE_PERMISSION_KEYS = [
  "view_dashboard",
  "run_audit",
  "view_audit_reports",
  "export_reports",
  "manage_team",
  "invite_members",
  "view_team_activity",
  "manage_organization",
  "manage_billing",
  "view_invoices",
  "manage_roles",
] as const;

export type RolePermissionKey = (typeof ROLE_PERMISSION_KEYS)[number];

export const ROLE_PERMISSION_LABELS: Record<RolePermissionKey, string> = {
  view_dashboard: "View Dashboard",
  run_audit: "Run Audit",
  view_audit_reports: "View Audit Reports",
  export_reports: "Export Reports",
  manage_team: "Manage Team",
  invite_members: "Invite Members",
  view_team_activity: "View Team Activity",
  manage_organization: "Manage Organization",
  manage_billing: "Manage Billing",
  view_invoices: "View Invoices",
  manage_roles: "Manage Roles",
};

/** Permission → group mapping (SCREEN-022 §7). */
export const ROLE_PERMISSION_GROUP_BY_KEY: Record<
  RolePermissionKey,
  RolePermissionGroupId
> = {
  view_dashboard: "audit",
  run_audit: "audit",
  view_audit_reports: "reports",
  export_reports: "reports",
  manage_team: "team",
  invite_members: "team",
  view_team_activity: "team",
  manage_organization: "organization",
  manage_billing: "billing",
  view_invoices: "billing",
  manage_roles: "administration",
};

/** Permissions whose Admin grant depends on mock org config. */
export const ORG_DEPENDENT_ADMIN_PERMISSIONS = [
  "manage_billing",
  "view_invoices",
] as const satisfies readonly RolePermissionKey[];

export type OrgDependentAdminPermission =
  (typeof ORG_DEPENDENT_ADMIN_PERMISSIONS)[number];

/** Roles as columns — same order as Team Member Card. */
export const ROLE_PERMISSION_MATRIX_ROLES = TEAM_MEMBER_ROLES;

export type RolePermissionMatrixRole = TeamMemberRole;

/**
 * Default mock grants (SCREEN-022 §8).
 * Admin billing cells for `admin` are resolved via `adminBillingEnabled` in utils.
 * Informative only — not a live authz engine.
 */
export const DEFAULT_ROLE_PERMISSION_MATRIX: Record<
  RolePermissionKey,
  Record<RolePermissionMatrixRole, boolean>
> = {
  view_dashboard: {
    owner: true,
    admin: true,
    designer: true,
    analyst: true,
    viewer: true,
  },
  run_audit: {
    owner: true,
    admin: true,
    designer: true,
    analyst: false,
    viewer: false,
  },
  view_audit_reports: {
    owner: true,
    admin: true,
    designer: true,
    analyst: true,
    viewer: true,
  },
  export_reports: {
    owner: true,
    admin: true,
    designer: true,
    analyst: true,
    viewer: false,
  },
  manage_team: {
    owner: true,
    admin: true,
    designer: false,
    analyst: false,
    viewer: false,
  },
  invite_members: {
    owner: true,
    admin: true,
    designer: false,
    analyst: false,
    viewer: false,
  },
  view_team_activity: {
    owner: true,
    admin: true,
    designer: true,
    analyst: true,
    viewer: true,
  },
  manage_organization: {
    owner: true,
    admin: true,
    designer: false,
    analyst: false,
    viewer: false,
  },
  manage_billing: {
    owner: true,
    admin: false,
    designer: false,
    analyst: false,
    viewer: false,
  },
  view_invoices: {
    owner: true,
    admin: false,
    designer: false,
    analyst: false,
    viewer: false,
  },
  manage_roles: {
    owner: true,
    admin: true,
    designer: false,
    analyst: false,
    viewer: false,
  },
};

export const ROLE_PERMISSION_MATRIX_COPY = {
  title: "Role permissions",
  caption:
    "Default permissions by Business role (mock). Read-only reference matrix.",
  permissionColumn: "Permission",
  allowed: "Allowed",
  notAllowed: "Not allowed",
  allowedOrgSetting: "Allowed (organization setting)",
  notAllowedOrgSetting: "Not allowed (organization setting)",
  legendAllowed: "Allowed",
  legendNotAllowed: "Not allowed",
  loading: "Loading role permissions…",
  loadError: "Unable to load role permissions.",
  retry: "Retry",
  expandGroup: "Press to expand permissions.",
  collapseGroup: "Press to collapse permissions.",
  tableScrollLabel:
    "Role permissions matrix. Scroll horizontally to view all roles.",
} as const;

export const ROLE_PERMISSION_MATRIX_ANALYTICS_SOURCE =
  "role_permission_matrix" as const;
