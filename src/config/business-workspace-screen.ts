/**
 * SCREEN-020 — Business Workspace screen constants.
 * Mock Business hub — no backend / no Supabase / no realtime.
 */

export const BUSINESS_WORKSPACE_ROUTE = "/workspace";

export const BUSINESS_WORKSPACE_DASHBOARD_ROUTE = "/dashboard";

export const BUSINESS_WORKSPACE_BILLING_ROUTE = "/billing";

export const BUSINESS_WORKSPACE_STATES = [
  "loading",
  "success",
  "empty",
  "error",
] as const;

export type BusinessWorkspaceScreenState =
  (typeof BUSINESS_WORKSPACE_STATES)[number];

export const BUSINESS_WORKSPACE_SECTIONS = [
  "overview",
  "usage",
  "members",
  "permissions",
  "activity",
] as const;

export type BusinessWorkspaceSectionId =
  (typeof BUSINESS_WORKSPACE_SECTIONS)[number];

export const BUSINESS_WORKSPACE_SECTION_LABELS: Record<
  BusinessWorkspaceSectionId,
  string
> = {
  overview: "Team Overview",
  usage: "Business Usage",
  members: "Team Members",
  permissions: "Role Permissions",
  activity: "Team Activity",
};

export const BUSINESS_WORKSPACE_COPY = {
  pageTitle: "Business Workspace",
  breadcrumbDashboard: "Dashboard",
  breadcrumbCurrent: "Business Workspace",
  guestRedirect: "Redirecting to sign in…",
  inviteMember: "Invite Member",
  manageMembers: "Manage Members",
  viewActivity: "View Activity",
  viewUsage: "View Usage",
  manageRoles: "Manage Roles",
  membersHeading: "Team Members",
  membersEmptyTitle: "No team members yet",
  membersEmptyDescription:
    "Invite teammates to collaborate on audits in this Business workspace.",
  loadError: "Unable to load your Business workspace.",
  retry: "Retry",
  back: "Back to Dashboard",
  forbiddenTitle: "Business plan required",
  forbiddenDescription:
    "Team workspace is available on the Business plan. Upgrade to manage members, usage, and permissions.",
  upgradeCta: "View Business plans",
  loading: "Loading Business workspace…",
} as const;

export const BUSINESS_WORKSPACE_ANALYTICS_SOURCE =
  "business_workspace_screen" as const;
