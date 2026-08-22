"use client";

import * as React from "react";

import { useAppState } from "@/hooks/use-app-state";
import { useAuth } from "@/hooks/use-auth";
import { useRealNotificationsApi } from "@/hooks/use-real-notifications-api";
import { useNotificationInboxOptional } from "@/providers/notification-inbox-provider";
import { fetchNotifications } from "@/lib/notifications/client";
import { countUnreadNotifications } from "@/utils/notification-filter";

export type MockNotificationUnread = {
  unreadCount: number;
  ready: boolean;
};

/**
 * Unread total — inbox store when open; real API for Supabase users; mock app state otherwise.
 */
export function useMockNotificationUnreadCount(): MockNotificationUnread {
  const { isGuest, isLoading } = useAuth();
  const useReal = useRealNotificationsApi();
  const { appState } = useAppState();
  const inbox = useNotificationInboxOptional();
  const [remoteUnread, setRemoteUnread] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!useReal || inbox || isGuest || isLoading) {
      setRemoteUnread(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const result = await fetchNotifications({ limit: 1 });
        if (!cancelled) setRemoteUnread(result.unreadCount);
      } catch {
        if (!cancelled) setRemoteUnread(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [inbox, isGuest, isLoading, useReal]);

  return React.useMemo(() => {
    if (inbox) {
      return { unreadCount: inbox.unreadCount, ready: true };
    }

    if (isLoading || isGuest) {
      return { unreadCount: 0, ready: false };
    }

    if (useReal) {
      return {
        unreadCount: remoteUnread ?? 0,
        ready: remoteUnread != null,
      };
    }

    return {
      unreadCount: countUnreadNotifications(appState.notifications),
      ready: true,
    };
  }, [
    appState.notifications,
    inbox,
    isGuest,
    isLoading,
    remoteUnread,
    useReal,
  ]);
}
