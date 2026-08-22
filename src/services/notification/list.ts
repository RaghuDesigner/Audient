import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  mapNotificationRow,
} from "@/services/notification/create";
import type { NotificationRecord } from "@/services/notification/types";

const NOTIFICATION_SELECT =
  "id, user_id, type, title, message, read, metadata, created_at, updated_at";

export async function listNotificationsForUser(
  supabase: SupabaseClient,
  appUserId: string,
  options?: { unreadOnly?: boolean; limit?: number },
): Promise<{ notifications: NotificationRecord[]; unreadCount: number }> {
  const limit = Math.min(Math.max(options?.limit ?? 50, 1), 100);

  let query = supabase
    .from("notifications")
    .select(NOTIFICATION_SELECT)
    .eq("user_id", appUserId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (options?.unreadOnly) {
    query = query.eq("read", false);
  }

  const { data, error } = await query;
  if (error || !data) {
    return { notifications: [], unreadCount: 0 };
  }

  const notifications = data.map((row) =>
    mapNotificationRow(row as Record<string, unknown>),
  );

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", appUserId)
    .eq("read", false)
    .is("deleted_at", null);

  return {
    notifications,
    unreadCount: count ?? notifications.filter((n) => !n.read).length,
  };
}

export async function markNotificationRead(
  supabase: SupabaseClient,
  appUserId: string,
  notificationId: string,
): Promise<boolean> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("notifications")
    .update({ read: true, updated_at: now })
    .eq("id", notificationId)
    .eq("user_id", appUserId)
    .eq("read", false)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) return false;
  // Already read is still success for the caller.
  if (data?.id) return true;

  const { data: owned } = await supabase
    .from("notifications")
    .select("id, read")
    .eq("id", notificationId)
    .eq("user_id", appUserId)
    .is("deleted_at", null)
    .maybeSingle();

  return Boolean(owned);
}

export async function markAllNotificationsRead(
  supabase: SupabaseClient,
  appUserId: string,
): Promise<number> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("notifications")
    .update({ read: true, updated_at: now })
    .eq("user_id", appUserId)
    .eq("read", false)
    .is("deleted_at", null)
    .select("id");

  if (error || !data) return 0;
  return data.length;
}
