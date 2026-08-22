import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  DbNotificationType,
  NotificationMetadata,
  NotificationRecord,
} from "@/services/notification/types";

export type CreateNotificationInput = {
  appUserId: string;
  type: DbNotificationType;
  title: string;
  message: string;
  metadata: NotificationMetadata;
};

function mapRow(row: Record<string, unknown>): NotificationRecord {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    type: row.type as NotificationRecord["type"],
    title: String(row.title),
    message: String(row.message),
    read: Boolean(row.read),
    metadata: (row.metadata as NotificationMetadata | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

/**
 * Insert a system notification (service-role). Idempotent on metadata.idempotencyKey.
 * Never throws to callers via notifySafely — this may throw for internal use.
 */
export async function createNotification(
  input: CreateNotificationInput,
): Promise<{ notificationId: string; created: boolean }> {
  const key = input.metadata.idempotencyKey?.trim();
  if (!key) {
    throw new Error("NOTIFICATION_MISSING_IDEMPOTENCY_KEY");
  }

  const admin = createSupabaseAdminClient();

  const { data: existing } = await admin
    .from("notifications")
    .select("id")
    .eq("user_id", input.appUserId)
    .is("deleted_at", null)
    .contains("metadata", { idempotencyKey: key })
    .maybeSingle();

  if (existing?.id) {
    return { notificationId: existing.id as string, created: false };
  }

  const { data, error } = await admin
    .from("notifications")
    .insert({
      user_id: input.appUserId,
      type: input.type,
      title: input.title.trim(),
      message: input.message.trim(),
      read: false,
      metadata: input.metadata,
    })
    .select("id")
    .single();

  if (error?.code === "23505") {
    const { data: raced } = await admin
      .from("notifications")
      .select("id")
      .eq("user_id", input.appUserId)
      .is("deleted_at", null)
      .contains("metadata", { idempotencyKey: key })
      .maybeSingle();
    if (raced?.id) {
      return { notificationId: raced.id as string, created: false };
    }
  }

  if (error || !data) {
    throw new Error(`NOTIFICATION_CREATE_FAILED:${error?.message ?? "unknown"}`);
  }

  return { notificationId: data.id as string, created: true };
}

/**
 * Side-effect wrapper: log failures, never throw (payments/audits stay successful).
 */
export async function notifySafely(
  label: string,
  run: () => Promise<unknown>,
): Promise<void> {
  try {
    await run();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      "[notifications]",
      label,
      message.replace(/sk_(live|test)_[A-Za-z0-9]+/g, "[redacted]"),
    );
  }
}

export { mapRow as mapNotificationRow };
