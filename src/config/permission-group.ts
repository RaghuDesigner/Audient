/**
 * COMPONENT-058 — Permission Group constants.
 * Mock permission category display — no backend.
 */

import type { RolePermissionKey } from "@/config/role-permission-matrix";

export const PERMISSION_GROUP_STATES = ["default", "loading"] as const;

export type PermissionGroupState = (typeof PERMISSION_GROUP_STATES)[number];

export const PERMISSION_GROUP_LAYOUTS = [
  "auto",
  "static",
  "accordion",
] as const;

export type PermissionGroupLayout =
  (typeof PERMISSION_GROUP_LAYOUTS)[number];

/** Mock permission descriptions (COMPONENT_PERMISSION_GROUP §4). */
export const ROLE_PERMISSION_DESCRIPTIONS: Record<RolePermissionKey, string> =
  {
    view_dashboard: "Access the organization dashboard and overview metrics",
    run_audit: "Start new screenshot and URL audits",
    view_audit_reports: "Open completed audit reports",
    export_reports: "Export reports to PDF and other formats",
    manage_team: "Add, remove, and manage team members",
    invite_members: "Send invitations to join the organization",
    view_team_activity: "See recent team activity in the workspace",
    manage_organization: "Update organization profile and settings",
    manage_billing: "Manage plan, payment methods, and billing details",
    view_invoices: "View and download billing invoices",
    manage_roles: "View and assign team member roles",
  };

export const PERMISSION_GROUP_COPY = {
  loading: "Loading permissions…",
  expandGroup: "Press to expand permissions.",
  collapseGroup: "Press to collapse permissions.",
  permissionsForRole: "permissions for",
} as const;

export const PERMISSION_GROUP_ANALYTICS_SOURCE = "permission_group" as const;
