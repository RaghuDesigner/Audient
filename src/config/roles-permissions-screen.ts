/**
 * SCREEN-022 — Roles & Permissions screen constants.
 * Mock Business RBAC management — no backend / no Supabase.
 */

import { BUSINESS_WORKSPACE_ROUTE } from "@/config/business-workspace-screen";

export const ROLES_PERMISSIONS_ROUTE = "/workspace/roles";

export const ROLES_PERMISSIONS_DASHBOARD_ROUTE = "/dashboard";

export const ROLES_PERMISSIONS_WORKSPACE_ROUTE = BUSINESS_WORKSPACE_ROUTE;

export const ROLES_PERMISSIONS_STATES = [
  "loading",
  "success",
  "empty",
  "error",
  "unauthorized",
] as const;

export type RolesPermissionsScreenState =
  (typeof ROLES_PERMISSIONS_STATES)[number];

/** Mock actor org roles for QA — `?actor=designer` etc. */
export const ROLES_PERMISSIONS_ACTOR_ROLES = [
  "owner",
  "admin",
  "designer",
  "analyst",
  "viewer",
] as const;

export type RolesPermissionsActorRole =
  (typeof ROLES_PERMISSIONS_ACTOR_ROLES)[number];

export const ROLES_PERMISSIONS_COPY = {
  pageTitle: "Roles & Permissions",
  pageDescription:
    "Review default role permissions and assign roles to team members.",
  breadcrumbDashboard: "Dashboard",
  breadcrumbWorkspace: "Business Workspace",
  breadcrumbCurrent: "Roles & Permissions",
  membersHeading: "Team member roles",
  membersEmptyTitle: "No team members yet",
  membersEmptyDescription:
    "Invite teammates from Business Workspace, then assign roles here.",
  unsavedIndicator: "Unsaved changes",
  unsavedTitle: "Discard unsaved changes?",
  unsavedDescription:
    "You have unsaved role changes. Leave without saving?",
  unsavedStay: "Stay on page",
  unsavedDiscard: "Discard changes",
  cancel: "Cancel",
  saveSuccess: "Permissions updated successfully.",
  saveError: "Unable to save permissions. Try again.",
  loadError: "Unable to load roles and permissions.",
  retry: "Retry",
  backToWorkspace: "Back to Workspace",
  guestRedirect: "Redirecting to sign in…",
  loading: "Loading roles and permissions…",
  forbiddenTitle: "Business plan required",
  forbiddenDescription:
    "Role management is available on the Business plan. Upgrade to manage team permissions.",
  upgradeCta: "View Business plans",
  unauthorizedTitle: "Access restricted",
  unauthorizedMessage: "You don't have permission to manage roles.",
  manageRolesCta: "Manage roles",
  roleChangeConfirmTitle: "Change role for",
  roleChangeConfirmAction: "Confirm",
  roleChangeConfirmPrefix: "will move from",
  roleChangeConfirmSuffix: "Permissions update when you save.",
} as const;

export const ROLES_PERMISSIONS_MOCK_SAVE_DELAY_MS = 600 as const;

export const ROLES_PERMISSIONS_ANALYTICS_SOURCE =
  "roles_permissions_screen" as const;
