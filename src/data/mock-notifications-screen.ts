/**
 * Phase-1 mock Notifications screen — SCREEN-018.
 * Reuses notification item catalog; no API / no Supabase.
 */

import type { NotificationsScreenState } from "@/config/notifications-screen";
import {
  MOCK_NOTIFICATION_CATALOG,
  rebindMockNotificationsToUser,
  type MockNotificationItem,
} from "@/data/mock-notification-item";
import { applyMockNotificationReadOverlay } from "@/lib/notifications/mock-read-state";

export type MockNotificationsScreen = {
  state: NotificationsScreenState;
  notifications: MockNotificationItem[];
};

export function getMockNotificationsScreen(input?: {
  userId?: string;
  state?: NotificationsScreenState;
  empty?: boolean;
}): MockNotificationsScreen {
  const userId = input?.userId ?? "mock-notifications-user";
  const state = input?.state ?? "success";

  if (state === "loading") {
    return { state: "loading", notifications: [] };
  }

  if (state === "error") {
    return { state: "error", notifications: [] };
  }

  if (input?.empty || state === "empty") {
    return { state: "empty", notifications: [] };
  }

  const notifications = applyMockNotificationReadOverlay(
    rebindMockNotificationsToUser(MOCK_NOTIFICATION_CATALOG, userId),
  );

  return {
    state: "success",
    notifications,
  };
}

export const MOCK_NOTIFICATIONS_SCREEN_SUCCESS: MockNotificationsScreen =
  getMockNotificationsScreen({ userId: "mock-google-user" });

export const MOCK_NOTIFICATIONS_SCREEN_EMPTY: MockNotificationsScreen =
  getMockNotificationsScreen({ empty: true });

export const MOCK_NOTIFICATIONS_SCREEN_LOADING: MockNotificationsScreen =
  getMockNotificationsScreen({ state: "loading" });

export const MOCK_NOTIFICATIONS_SCREEN_ERROR: MockNotificationsScreen =
  getMockNotificationsScreen({ state: "error" });
