/**
 * Phase-1 mock Notification Item fixtures — COMPONENT-038.
 * Mixed types / read states; no backend / push / Supabase.
 */

import type { NotificationItemType } from "@/config/notification-item";
import type { NotificationItemSurface } from "@/config/notification-item";

export type MockNotificationItem = {
  id: string;
  type: NotificationItemType;
  title: string;
  description: string;
  /** ISO timestamp */
  timestamp: string;
  read: boolean;
  /** Override default type href when set. */
  href?: string | null;
  actionLabel?: string | null;
  userId: string;
  surface?: NotificationItemSurface;
};

export const MOCK_NOTIFICATION_OWNER = "mock-notification-owner";

const owner = MOCK_NOTIFICATION_OWNER;

/** Catalog rebinding to session user on consume. */
export const MOCK_NOTIFICATION_CATALOG: MockNotificationItem[] = [
  {
    id: "notif_audit_done_1",
    type: "audit_completed",
    title: "Audit completed",
    description: "Homepage redesign scored 82 — view your report.",
    timestamp: "2026-08-09T10:15:00.000Z",
    read: false,
    actionLabel: "View report",
    userId: owner,
  },
  {
    id: "notif_audit_fail_1",
    type: "audit_failed",
    title: "Audit failed",
    description: "We couldn’t finish scanning example.com. Try again.",
    timestamp: "2026-08-09T08:00:00.000Z",
    read: false,
    actionLabel: "Open history",
    userId: owner,
  },
  {
    id: "notif_low_credits_1",
    type: "low_credits",
    title: "Low credits",
    description: "You have fewer than 150 credits left this month.",
    timestamp: "2026-08-08T18:30:00.000Z",
    read: false,
    actionLabel: "Buy credits",
    userId: owner,
  },
  {
    id: "notif_pay_ok_1",
    type: "payment_successful",
    title: "Payment successful",
    description: "Pro monthly — invoice INV-2026-012 is ready.",
    timestamp: "2026-08-05T14:20:00.000Z",
    read: true,
    actionLabel: "View invoice",
    userId: owner,
  },
  {
    id: "notif_pay_fail_1",
    type: "payment_failed",
    title: "Payment failed",
    description: "We couldn’t complete your payment. Subscription unchanged.",
    timestamp: "2026-08-04T11:00:00.000Z",
    read: true,
    actionLabel: "Try again",
    userId: owner,
  },
  {
    id: "notif_sub_active_1",
    type: "subscription_activated",
    title: "Subscription activated",
    description: "Your Pro plan is now active. Credits have been added.",
    timestamp: "2026-08-05T14:21:00.000Z",
    read: false,
    userId: owner,
  },
  {
    id: "notif_sub_renew_1",
    type: "subscription_renewal",
    title: "Renewal upcoming",
    description: "Your Pro plan renews on Aug 28. Manage billing anytime.",
    timestamp: "2026-08-01T09:00:00.000Z",
    read: true,
    actionLabel: "Manage membership",
    userId: owner,
  },
  {
    id: "notif_invoice_1",
    type: "invoice_available",
    title: "Invoice available",
    description: "INV-2026-011 is ready to view or download.",
    timestamp: "2026-07-28T10:05:00.000Z",
    read: false,
    href: "/invoice-history?invoice=inv_2026_011",
    actionLabel: "Open invoice",
    userId: owner,
  },
  {
    id: "notif_upgrade_1",
    type: "membership_upgrade",
    title: "Upgrade available",
    description: "Unlock URL audits and more credits with Business.",
    timestamp: "2026-07-20T16:00:00.000Z",
    read: true,
    actionLabel: "View plans",
    userId: owner,
  },
  {
    id: "notif_expiry_1",
    type: "membership_expiry",
    title: "Membership ending soon",
    description: "Your trial period ends in 3 days.",
    timestamp: "2026-07-15T12:00:00.000Z",
    read: true,
    userId: owner,
  },
  {
    id: "notif_team_1",
    type: "team_activity",
    title: "Team seat update",
    description: "A teammate joined your Business workspace (mock).",
    timestamp: "2026-07-10T08:45:00.000Z",
    read: true,
    userId: owner,
  },
  {
    id: "notif_system_1",
    type: "system",
    title: "Scheduled maintenance",
    description: "Brief downtime Sunday 2–3am UTC. No action needed.",
    timestamp: "2026-07-01T07:00:00.000Z",
    read: true,
    userId: owner,
  },
];

export function rebindMockNotificationsToUser(
  items: readonly MockNotificationItem[],
  userId: string,
): MockNotificationItem[] {
  return items.map((item) => ({ ...item, userId }));
}

export function getMockNotifications(input?: {
  userId?: string;
  unreadOnly?: boolean;
  limit?: number;
}): MockNotificationItem[] {
  const userId = input?.userId ?? MOCK_NOTIFICATION_OWNER;
  let list = rebindMockNotificationsToUser(MOCK_NOTIFICATION_CATALOG, userId);
  if (input?.unreadOnly) {
    list = list.filter((n) => !n.read);
  }
  if (input?.limit != null && input.limit >= 0) {
    list = list.slice(0, input.limit);
  }
  return list;
}

export function getMockNotificationById(
  id: string,
  userId?: string,
): MockNotificationItem | null {
  const list = getMockNotifications({ userId });
  return list.find((n) => n.id === id) ?? null;
}

export const MOCK_NOTIFICATION_UNREAD_PREVIEW: MockNotificationItem[] =
  getMockNotifications({ unreadOnly: true, limit: 3 });

export const MOCK_NOTIFICATION_DROPDOWN: MockNotificationItem[] =
  getMockNotifications({ limit: 5 });
