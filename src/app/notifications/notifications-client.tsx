"use client";

import * as React from "react";

import { AuthSessionFallback } from "@/components/auth/AuthSessionFallback";
import { NotificationsScreen } from "@/components/notifications/NotificationsScreen";
import {
  NOTIFICATIONS_COPY,
  NOTIFICATIONS_ROUTE,
  type NotificationsScreenState,
} from "@/config/notifications-screen";
import { getMockNotificationsScreen } from "@/data/mock-notifications-screen";
import type { MockNotificationItem } from "@/data/mock-notification-item";
import { useAppState } from "@/hooks/use-app-state";
import { useRealNotificationsApi } from "@/hooks/use-real-notifications-api";
import { useRequireAuth } from "@/hooks/use-require-auth";
import {
  fetchNotifications,
  markAllNotificationsReadRemote,
  markNotificationReadRemote,
} from "@/lib/notifications/client";
import { NotificationInboxProvider } from "@/providers/notification-inbox-provider";

export type NotificationsClientProps = {
  state?: NotificationsScreenState | null;
  empty?: boolean;
};

/**
 * SCREEN-018 client shell — mock inbox for mock auth; API for real users.
 */
export function NotificationsClient({
  state = null,
  empty = false,
}: NotificationsClientProps) {
  const { user, isReady } = useRequireAuth({
    redirectTo: NOTIFICATIONS_ROUTE,
  });
  const useReal = useRealNotificationsApi();
  const { appState } = useAppState({
    notificationState: state ?? undefined,
    notificationEmpty: empty || state === "empty",
  });
  const [screenState, setScreenState] = React.useState<NotificationsScreenState>(
    state ?? "loading",
  );
  const [items, setItems] = React.useState<MockNotificationItem[]>([]);
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    if (!isReady || !user) return;

    if (!useReal || empty || state === "empty") {
      const bundle = getMockNotificationsScreen({
        state: state ?? undefined,
        empty: empty || state === "empty",
      });
      setScreenState(
        state ?? (empty ? "empty" : ("success" as NotificationsScreenState)),
      );
      setItems(
        empty || state === "empty" ? [] : appState.notifications,
      );
      if (bundle.state === "error") setScreenState("error");
      return;
    }

    let cancelled = false;
    setScreenState("loading");
    void (async () => {
      try {
        const result = await fetchNotifications({ limit: 50 });
        if (cancelled) return;
        setItems(result.notifications);
        setScreenState(
          result.notifications.length === 0 ? "empty" : "success",
        );
      } catch {
        if (!cancelled) {
          setItems([]);
          setScreenState("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    appState.notifications,
    empty,
    isReady,
    reloadKey,
    state,
    useReal,
    user,
  ]);

  if (!isReady || !user) {
    return (
      <AuthSessionFallback message={NOTIFICATIONS_COPY.guestRedirect} />
    );
  }

  return (
    <NotificationInboxProvider
      key={`${user.id}-${useReal ? "api" : "mock"}-${reloadKey}-${items.length}`}
      initialItems={items}
      onMarkReadPersist={
        useReal
          ? async (id) => {
              await markNotificationReadRemote(id);
            }
          : undefined
      }
      onMarkAllReadPersist={
        useReal
          ? async () => {
              await markAllNotificationsReadRemote();
            }
          : undefined
      }
    >
      <NotificationsScreen
        screenState={screenState}
        onRetry={() => {
          setReloadKey((k) => k + 1);
        }}
      />
    </NotificationInboxProvider>
  );
}
