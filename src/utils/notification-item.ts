/**
 * COMPONENT-038 — Notification Item helpers.
 * Type map, time labels, a11y — no React / no API / no Supabase.
 */

import {
  NOTIFICATION_ITEM_COPY,
  NOTIFICATION_ITEM_DEFAULT_HREF,
  NOTIFICATION_ITEM_FALLBACK_TYPE,
  NOTIFICATION_ITEM_TYPE_LABELS,
  NOTIFICATION_ITEM_TYPES,
  NOTIFICATION_ITEM_VARIANTS,
  type NotificationItemType,
  type NotificationItemVariant,
} from "@/config/notification-item";
import { isTrustedHostedInvoiceUrl } from "@/utils/hosted-invoice-url";
import { formatAuditDate } from "@/utils/recent-audit";

export function isNotificationItemType(
  value: string | null | undefined,
): value is NotificationItemType {
  return (
    value != null &&
    (NOTIFICATION_ITEM_TYPES as readonly string[]).includes(value)
  );
}

export function isNotificationItemVariant(
  value: string | null | undefined,
): value is NotificationItemVariant {
  return (
    value != null &&
    (NOTIFICATION_ITEM_VARIANTS as readonly string[]).includes(value)
  );
}

/** Unknown mock type → system styling. */
export function parseNotificationItemType(
  value: string | null | undefined,
): NotificationItemType {
  if (isNotificationItemType(value)) return value;
  return NOTIFICATION_ITEM_FALLBACK_TYPE;
}

export function notificationItemTypeLabel(type: NotificationItemType): string {
  return NOTIFICATION_ITEM_TYPE_LABELS[type];
}

/**
 * Resolve navigation target: explicit href wins; else type default.
 * Internal App Router paths + trusted Stripe hosted invoice URLs only.
 * null means mark-read only (no route).
 */
export function resolveNotificationItemHref(
  type: NotificationItemType,
  href?: string | null,
): string | null {
  if (href != null && href.trim().length > 0) {
    const trimmed = href.trim();
    if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
      return trimmed;
    }
    if (isTrustedHostedInvoiceUrl(trimmed)) {
      return trimmed;
    }
    return null;
  }
  return NOTIFICATION_ITEM_DEFAULT_HREF[type] ?? null;
}

/** Relative display string for UI (e.g. “2h ago”). */
export function formatNotificationRelativeTime(
  timestamp: string | Date,
  now: Date = new Date(),
): string {
  const date =
    typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  if (Number.isNaN(date.getTime())) return "Just now";

  const diffMs = now.getTime() - date.getTime();
  const abs = Math.abs(diffMs);
  const future = diffMs < 0;

  const minutes = Math.floor(abs / 60_000);
  const hours = Math.floor(abs / 3_600_000);
  const days = Math.floor(abs / 86_400_000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) {
    return future ? `in ${minutes}m` : `${minutes}m ago`;
  }
  if (hours < 24) {
    return future ? `in ${hours}h` : `${hours}h ago`;
  }
  if (days < 7) {
    return future ? `in ${days}d` : `${days}d ago`;
  }
  return formatAuditDate(date);
}

/** Absolute date for screen readers (not color / visual primary). */
export function formatNotificationAbsoluteTime(
  timestamp: string | Date,
): string {
  return formatAuditDate(timestamp);
}

export function shouldClampNotificationDescription(
  variant: NotificationItemVariant,
): boolean {
  return variant === "compact" || variant === "preview";
}

/**
 * Accessible name: type, title, optional description, time, read state.
 */
export function buildNotificationItemA11yLabel(input: {
  type: NotificationItemType;
  title: string;
  description?: string | null;
  timestamp?: string | Date | null;
  read: boolean;
  now?: Date;
}): string {
  const parts = [
    notificationItemTypeLabel(input.type),
    input.title,
  ];

  if (input.description?.trim()) {
    parts.push(input.description.trim());
  }

  if (input.timestamp != null) {
    parts.push(
      formatNotificationRelativeTime(input.timestamp, input.now),
      formatNotificationAbsoluteTime(input.timestamp),
    );
  }

  parts.push(
    input.read
      ? NOTIFICATION_ITEM_COPY.read
      : NOTIFICATION_ITEM_COPY.unread,
  );

  return parts.filter(Boolean).join(". ");
}

/** Lucide icon key per type — component maps to icons. */
export type NotificationItemIconKey =
  | "check_circle"
  | "x_circle"
  | "coins"
  | "credit_card"
  | "alert_triangle"
  | "sparkles"
  | "calendar"
  | "file_text"
  | "arrow_up"
  | "clock"
  | "users"
  | "bell";

export function notificationItemIconKey(
  type: NotificationItemType,
): NotificationItemIconKey {
  switch (type) {
    case "audit_completed":
      return "check_circle";
    case "audit_failed":
      return "x_circle";
    case "low_credits":
      return "coins";
    case "payment_successful":
      return "credit_card";
    case "payment_failed":
      return "alert_triangle";
    case "subscription_activated":
      return "sparkles";
    case "subscription_renewal":
      return "calendar";
    case "invoice_available":
      return "file_text";
    case "membership_upgrade":
      return "arrow_up";
    case "membership_expiry":
      return "clock";
    case "team_activity":
      return "users";
    case "system":
    default:
      return "bell";
  }
}

export function notificationItemIconToneClass(
  type: NotificationItemType,
): string {
  switch (type) {
    case "audit_completed":
    case "payment_successful":
    case "subscription_activated":
      return "text-success";
    case "audit_failed":
    case "payment_failed":
    case "membership_expiry":
      return "text-error";
    case "low_credits":
    case "subscription_renewal":
    case "membership_upgrade":
      return "text-warning";
    default:
      return "text-muted-foreground";
  }
}
