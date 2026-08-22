import "server-only";

import type { NotificationItemType } from "@/config/notification-item";
import { NOTIFICATION_ITEM_DEFAULT_HREF } from "@/config/notification-item";
import { INVOICE_HISTORY_ROUTE } from "@/config/invoice-history";
import { isTrustedHostedInvoiceUrl } from "@/utils/hosted-invoice-url";

/** Matches public.notification_type enum — do not invent values. */
export type DbNotificationType =
  | "AUDIT_COMPLETE"
  | "AUDIT_FAILED"
  | "LOW_CREDITS"
  | "SUBSCRIPTION_EXPIRING"
  | "PAYMENT_SUCCEEDED"
  | "SYSTEM";

export type NotificationMetadata = {
  /** Dedupes duplicate webhook / retry deliveries. */
  idempotencyKey: string;
  /** Finer UI type when DB enum is coarser. */
  uiType?: NotificationItemType;
  href?: string | null;
  actionLabel?: string | null;
  auditId?: string;
  paymentId?: string;
  stripeInvoiceId?: string;
  stripeSubscriptionId?: string;
  planTier?: string;
  credits?: number;
  [key: string]: unknown;
};

export type NotificationRecord = {
  id: string;
  userId: string;
  type: DbNotificationType;
  title: string;
  message: string;
  read: boolean;
  metadata: NotificationMetadata | null;
  createdAt: string;
  updatedAt: string;
};

export function dbTypeToUiType(
  type: DbNotificationType,
  metadata: NotificationMetadata | null,
): NotificationItemType {
  if (metadata?.uiType) return metadata.uiType;
  switch (type) {
    case "AUDIT_COMPLETE":
      return "audit_completed";
    case "AUDIT_FAILED":
      return "audit_failed";
    case "LOW_CREDITS":
      return "low_credits";
    case "SUBSCRIPTION_EXPIRING":
      return "membership_expiry";
    case "PAYMENT_SUCCEEDED":
      return "payment_successful";
    case "SYSTEM":
    default:
      return "system";
  }
}

const PAYMENT_INVOICE_UI_TYPES: ReadonlySet<NotificationItemType> = new Set([
  "payment_successful",
  "invoice_available",
  "subscription_activated",
  "subscription_renewal",
]);

/**
 * Resolve notification action href.
 * Prefer authenticated owned hosted invoice URL when provided; never invent URLs.
 */
export function resolveNotificationHref(
  uiType: NotificationItemType,
  metadata: NotificationMetadata | null,
  options?: { hostedInvoiceUrl?: string | null },
): string | null {
  const hosted = options?.hostedInvoiceUrl?.trim() ?? null;
  if (hosted && isTrustedHostedInvoiceUrl(hosted)) {
    return hosted;
  }

  if (metadata?.href !== undefined) {
    const explicit = metadata.href;
    if (explicit && isTrustedHostedInvoiceUrl(explicit)) return explicit;
    if (explicit != null && explicit.startsWith("/") && !explicit.startsWith("//")) {
      return explicit;
    }
    if (explicit === null) return null;
  }

  if (uiType === "audit_completed" && metadata?.auditId) {
    return `/audit/${metadata.auditId}/report`;
  }
  if (uiType === "audit_failed" && metadata?.auditId) {
    return `/audit/${metadata.auditId}`;
  }
  if (PAYMENT_INVOICE_UI_TYPES.has(uiType) && metadata?.paymentId) {
    return `${INVOICE_HISTORY_ROUTE}?invoice=${metadata.paymentId}`;
  }
  return NOTIFICATION_ITEM_DEFAULT_HREF[uiType];
}
