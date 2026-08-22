import type { NotificationItemType } from "@/config/notification-item";
import type { MockNotificationItem } from "@/data/mock-notification-item";

export type NotificationDto = {
  id: string;
  type: NotificationItemType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  href: string | null;
  actionLabel: string | null;
  userId: string;
};

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string; code?: string };
    return body.error ?? body.code ?? response.statusText;
  } catch {
    return response.statusText || "Request failed";
  }
}

export async function fetchNotifications(options?: {
  unreadOnly?: boolean;
  limit?: number;
}): Promise<{ notifications: MockNotificationItem[]; unreadCount: number }> {
  const params = new URLSearchParams();
  if (options?.unreadOnly) params.set("unread", "true");
  if (options?.limit) params.set("limit", String(options.limit));
  const qs = params.toString();
  const response = await fetch(
    qs ? `/api/notifications?${qs}` : "/api/notifications",
    {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    },
  );
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  const body = (await response.json()) as {
    notifications: NotificationDto[];
    unreadCount: number;
  };
  return {
    unreadCount: body.unreadCount ?? 0,
    notifications: (body.notifications ?? []).map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      description: n.description,
      timestamp: n.timestamp,
      read: n.read,
      href: n.href,
      actionLabel: n.actionLabel,
      userId: n.userId,
    })),
  };
}

export async function markNotificationReadRemote(
  notificationId: string,
): Promise<void> {
  const response = await fetch(`/api/notifications/${notificationId}`, {
    method: "PATCH",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ read: true }),
  });
  if (!response.ok) {
    throw new Error(await readError(response));
  }
}

export async function markAllNotificationsReadRemote(): Promise<void> {
  const response = await fetch("/api/notifications/read-all", {
    method: "POST",
    credentials: "same-origin",
  });
  if (!response.ok) {
    throw new Error(await readError(response));
  }
}
