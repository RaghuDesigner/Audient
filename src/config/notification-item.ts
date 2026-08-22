/**
 * COMPONENT-038 — Notification Item constants.
 * Mock inbox row only — no push / Supabase / notification API.
 */

import { INVOICE_HISTORY_ROUTE } from "@/config/invoice-history";
import { MANAGE_MEMBERSHIP_ROUTE } from "@/config/manage-membership";
import { BILLING_PAYMENTS_ROUTE } from "@/config/billing-payments";
import { PAYMENT_FAILURE_ROUTE } from "@/config/payment-failure";

export const NOTIFICATION_ITEM_TYPES = [
  "audit_completed",
  "audit_failed",
  "low_credits",
  "payment_successful",
  "payment_failed",
  "subscription_activated",
  "subscription_renewal",
  "invoice_available",
  "membership_upgrade",
  "membership_expiry",
  "team_activity",
  "system",
] as const;

export type NotificationItemType = (typeof NOTIFICATION_ITEM_TYPES)[number];

export const NOTIFICATION_ITEM_TYPE_LABELS: Record<
  NotificationItemType,
  string
> = {
  audit_completed: "Audit Completed",
  audit_failed: "Audit Failed",
  low_credits: "Low Credits",
  payment_successful: "Payment Successful",
  payment_failed: "Payment Failed",
  subscription_activated: "Subscription Activated",
  subscription_renewal: "Subscription Renewal",
  invoice_available: "Invoice Available",
  membership_upgrade: "Membership Upgrade",
  membership_expiry: "Membership Expiry",
  team_activity: "Team Activity",
  system: "System Notification",
};

export const NOTIFICATION_ITEM_VARIANTS = [
  "default",
  "compact",
  "preview",
] as const;

export type NotificationItemVariant =
  (typeof NOTIFICATION_ITEM_VARIANTS)[number];

export const NOTIFICATION_ITEM_SURFACES = [
  "list",
  "dropdown",
  "preview",
] as const;

export type NotificationItemSurface =
  (typeof NOTIFICATION_ITEM_SURFACES)[number];

export const NOTIFICATION_ITEM_STATES = [
  "default",
  "loading",
] as const;

export type NotificationItemState =
  (typeof NOTIFICATION_ITEM_STATES)[number];

/**
 * Default deep links for mock routing — existing App Router paths only.
 * null = mark-read only (no navigation).
 */
export const NOTIFICATION_ITEM_DEFAULT_HREF: Record<
  NotificationItemType,
  string | null
> = {
  audit_completed: "/history",
  audit_failed: "/history",
  low_credits: MANAGE_MEMBERSHIP_ROUTE,
  payment_successful: INVOICE_HISTORY_ROUTE,
  payment_failed: BILLING_PAYMENTS_ROUTE,
  subscription_activated: INVOICE_HISTORY_ROUTE,
  subscription_renewal: INVOICE_HISTORY_ROUTE,
  invoice_available: INVOICE_HISTORY_ROUTE,
  membership_upgrade: MANAGE_MEMBERSHIP_ROUTE,
  membership_expiry: MANAGE_MEMBERSHIP_ROUTE,
  team_activity: null,
  system: null,
};

/** Fallback for unknown / future type strings from mock payloads. */
export const NOTIFICATION_ITEM_FALLBACK_TYPE: NotificationItemType = "system";

export const NOTIFICATION_ITEM_COPY = {
  unread: "Unread",
  read: "Read",
  loadingLabel: "Loading notification",
  optionalActionFallback: "View",
} as const;

export const NOTIFICATION_ITEM_ANALYTICS_SOURCES = {
  list: "notification_item_list",
  dropdown: "notification_item_dropdown",
  preview: "notification_item_preview",
} as const;

/** Re-export for type default maps that also surface failure path. */
export const NOTIFICATION_ITEM_PAYMENT_FAILURE_HREF = PAYMENT_FAILURE_ROUTE;
