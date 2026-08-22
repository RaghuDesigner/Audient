/**
 * SCREEN-018 — Notifications screen constants.
 * Mock inbox only — no Supabase / no notification API.
 */

import { MANAGE_MEMBERSHIP_ROUTE } from "@/config/manage-membership";

export const NOTIFICATIONS_ROUTE = "/notifications";

export const NOTIFICATIONS_DASHBOARD_ROUTE = "/dashboard";

export const NOTIFICATIONS_MEMBERSHIP_ROUTE = MANAGE_MEMBERSHIP_ROUTE;

export const NOTIFICATIONS_PAGE_SIZE = 10;

export const NOTIFICATIONS_STATES = [
  "loading",
  "success",
  "empty",
  "error",
] as const;

export type NotificationsScreenState =
  (typeof NOTIFICATIONS_STATES)[number];

export const NOTIFICATIONS_COPY = {
  pageTitle: "Notifications",
  guestRedirect: "Redirecting to sign in…",
  unreadCountOne: "1 unread",
  unreadCountMany: (n: number) => `${n} unread`,
  unreadCountOverflow: "99+ unread",
  loadError: "Unable to load notifications.",
  retry: "Retry",
  backToDashboard: "Back to Dashboard",
  breadcrumbDashboard: "Dashboard",
  breadcrumbCurrent: "Notifications",
  paginationNav: "Notifications pagination",
} as const;

export const NOTIFICATIONS_ANALYTICS_SOURCE =
  "notifications_screen" as const;

/** QA: `?state=loading|error|empty|success` on `/notifications`. */
export const NOTIFICATIONS_QA_STATE_PARAM = "state" as const;

export const NOTIFICATIONS_QA_EMPTY_PARAM = "empty" as const;
