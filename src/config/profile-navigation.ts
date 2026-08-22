/**
 * Profile dropdown navigation — SCREEN-008 menu routes.
 * Single source for menu items and action → route mapping.
 */

import { AUTH_ROUTES } from "@/config/auth";
import { BUSINESS_WORKSPACE_ROUTE } from "@/config/business-workspace-screen";
import { MANAGE_MEMBERSHIP_ROUTE } from "@/config/manage-membership";
import {
  NOTIFICATIONS_COPY,
  NOTIFICATIONS_ROUTE,
} from "@/config/notifications-screen";
import { SETTINGS_ROUTE } from "@/config/settings-screen";

export const PROFILE_ROUTE = "/profile";

export const AUDIT_HISTORY_ROUTE = "/history";

export const PROFILE_NAVIGATION_MENU_ITEMS = [
  { id: "profile", label: "Profile", href: PROFILE_ROUTE },
  { id: "history", label: "History", href: AUDIT_HISTORY_ROUTE },
  {
    id: "notifications",
    label: NOTIFICATIONS_COPY.pageTitle,
    href: NOTIFICATIONS_ROUTE,
  },
  { id: "settings", label: "Account Settings", href: SETTINGS_ROUTE },
  { id: "manage_plan", label: "Manage Plan", href: MANAGE_MEMBERSHIP_ROUTE },
  { id: "logout", label: "Logout", href: AUTH_ROUTES.signOut },
] as const;

export const PROFILE_WORKSPACE_MENU_ITEM = {
  id: "workspace",
  label: "Business Workspace",
  href: BUSINESS_WORKSPACE_ROUTE,
} as const;

export type ProfileNavigationMenuAction =
  (typeof PROFILE_NAVIGATION_MENU_ITEMS)[number]["id"];

export type ProfileNavigationAction =
  | ProfileNavigationMenuAction
  | typeof PROFILE_WORKSPACE_MENU_ITEM.id;

/** Resolve href for a profile action (null for logout). */
export function getProfileActionHref(
  action: ProfileNavigationAction,
): string | null {
  if (action === "logout") return null;
  if (action === "workspace") return PROFILE_WORKSPACE_MENU_ITEM.href;
  const item = PROFILE_NAVIGATION_MENU_ITEMS.find(
    (entry) => entry.id === action,
  );
  return item?.href ?? null;
}
