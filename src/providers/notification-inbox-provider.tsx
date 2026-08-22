"use client";

import * as React from "react";

import type { MockNotificationItem } from "@/data/mock-notification-item";
import {
  applyMockNotificationReadOverlay,
  markMockNotificationsRead,
} from "@/lib/notifications/mock-read-state";
import { markAllMockNotificationsReadAsync } from "@/utils/mark-all-read-button";
import { countUnreadNotifications } from "@/utils/notification-filter";

type NotificationInboxContextValue = {
  items: MockNotificationItem[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => Promise<void>;
  setItems: (items: MockNotificationItem[]) => void;
};

const NotificationInboxContext =
  React.createContext<NotificationInboxContextValue | null>(null);

export type NotificationInboxProviderProps = {
  initialItems: MockNotificationItem[];
  children: React.ReactNode;
  /** Optional server persist for real notification API. */
  onMarkReadPersist?: (id: string) => Promise<void>;
  onMarkAllReadPersist?: (ids: string[]) => Promise<void>;
};

/**
 * SCREEN-018 — Notification inbox store.
 * Mock path keeps session overlay; real path persists via optional callbacks.
 */
export function NotificationInboxProvider({
  initialItems,
  children,
  onMarkReadPersist,
  onMarkAllReadPersist,
}: NotificationInboxProviderProps) {
  const [items, setItems] = React.useState<MockNotificationItem[]>(() =>
    applyMockNotificationReadOverlay(initialItems),
  );

  React.useEffect(() => {
    setItems(
      onMarkReadPersist
        ? initialItems
        : applyMockNotificationReadOverlay(initialItems),
    );
  }, [initialItems, onMarkReadPersist]);

  const unreadCount = React.useMemo(
    () => countUnreadNotifications(items),
    [items],
  );

  const markRead = React.useCallback(
    (id: string) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id && !item.read ? { ...item, read: true } : item,
        ),
      );
      if (onMarkReadPersist) {
        void onMarkReadPersist(id).catch(() => {
          setItems((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, read: false } : item,
            ),
          );
        });
        return;
      }
      markMockNotificationsRead([id]);
    },
    [onMarkReadPersist],
  );

  const markAllRead = React.useCallback(async () => {
    const unreadIds = items.filter((i) => !i.read).map((i) => i.id);
    if (onMarkAllReadPersist) {
      setItems((prev) => prev.map((item) => ({ ...item, read: true })));
      try {
        await onMarkAllReadPersist(unreadIds);
      } catch {
        setItems((prev) =>
          prev.map((item) =>
            unreadIds.includes(item.id) ? { ...item, read: false } : item,
          ),
        );
      }
      return;
    }
    const result = await markAllMockNotificationsReadAsync(items);
    setItems(result.items);
    markMockNotificationsRead(result.items.map((item) => item.id));
  }, [items, onMarkAllReadPersist]);

  const value = React.useMemo(
    () => ({
      items,
      unreadCount,
      markRead,
      markAllRead,
      setItems,
    }),
    [items, markAllRead, markRead, unreadCount],
  );

  return (
    <NotificationInboxContext.Provider value={value}>
      {children}
    </NotificationInboxContext.Provider>
  );
}

export function useNotificationInbox(): NotificationInboxContextValue {
  const ctx = React.useContext(NotificationInboxContext);
  if (!ctx) {
    throw new Error(
      "useNotificationInbox must be used within NotificationInboxProvider",
    );
  }
  return ctx;
}

export function useNotificationInboxOptional(): NotificationInboxContextValue | null {
  return React.useContext(NotificationInboxContext);
}
