import "server-only";

import {
  createNotification,
  notifySafely,
} from "@/services/notification/create";
import type { DbNotificationType } from "@/services/notification/types";

function planLabel(tier: string | null | undefined): string {
  const t = (tier ?? "").toUpperCase();
  if (t === "ENTERPRISE" || t === "BUSINESS") return "Business";
  if (t === "PRO") return "Pro";
  return "your plan";
}

export async function notifyAuditCompleted(input: {
  appUserId: string;
  auditId: string;
  overallScore?: number | null;
}): Promise<void> {
  await notifySafely("audit_completed", async () => {
    const score =
      typeof input.overallScore === "number"
        ? ` Scored ${Math.round(input.overallScore)}.`
        : "";
    await createNotification({
      appUserId: input.appUserId,
      type: "AUDIT_COMPLETE",
      title: "Audit completed",
      message: `Your UX audit is ready.${score}`,
      metadata: {
        idempotencyKey: `audit:${input.auditId}:completed`,
        uiType: "audit_completed",
        auditId: input.auditId,
        actionLabel: "View report",
      },
    });
  });
}

export async function notifyAuditFailed(input: {
  appUserId: string;
  auditId: string;
  failureCode?: string | null;
}): Promise<void> {
  await notifySafely("audit_failed", async () => {
    await createNotification({
      appUserId: input.appUserId,
      type: "AUDIT_FAILED",
      title: "Audit failed",
      message: input.failureCode
        ? `We couldn’t finish this audit (${input.failureCode}). You can retry when ready.`
        : "We couldn’t finish this audit. You can retry when ready.",
      metadata: {
        idempotencyKey: `audit:${input.auditId}:failed`,
        uiType: "audit_failed",
        auditId: input.auditId,
        actionLabel: "Open audit",
      },
    });
  });
}

export async function notifySubscriptionPaymentSucceeded(input: {
  appUserId: string;
  paymentId: string;
  planTier?: string | null;
  invoiceNumber?: string | null;
  amountCents?: number;
  billingReason?: string | null;
}): Promise<void> {
  await notifySafely("subscription_payment", async () => {
    const plan = planLabel(input.planTier);
    const invoiceHint = input.invoiceNumber
      ? ` Invoice ${input.invoiceNumber} is ready.`
      : "";
    const isRenewal =
      input.billingReason === "subscription_cycle" ||
      input.billingReason === "subscription_update";
    await createNotification({
      appUserId: input.appUserId,
      type: "PAYMENT_SUCCEEDED",
      title: isRenewal ? `${plan} payment successful` : `${plan} subscription activated`,
      message: isRenewal
        ? `Your ${plan} renewal payment succeeded.${invoiceHint}`
        : `Your ${plan} plan is active.${invoiceHint}`,
      metadata: {
        idempotencyKey: `payment:${input.paymentId}:succeeded`,
        uiType: isRenewal ? "payment_successful" : "subscription_activated",
        paymentId: input.paymentId,
        planTier: input.planTier ?? undefined,
        actionLabel: "View invoice",
      },
    });
  });
}

export async function notifyCreditPurchaseSucceeded(input: {
  appUserId: string;
  paymentId: string;
  credits: number;
}): Promise<void> {
  await notifySafely("credit_purchase", async () => {
    await createNotification({
      appUserId: input.appUserId,
      type: "PAYMENT_SUCCEEDED",
      title: "Credit purchase successful",
      message: `${input.credits} credits were added to your account.`,
      metadata: {
        idempotencyKey: `payment:${input.paymentId}:topup`,
        uiType: "payment_successful",
        paymentId: input.paymentId,
        credits: input.credits,
        actionLabel: "View invoice",
      },
    });
  });
}

export async function notifyPaymentFailed(input: {
  appUserId: string;
  paymentId?: string | null;
  stripeInvoiceId?: string | null;
}): Promise<void> {
  await notifySafely("payment_failed", async () => {
    const key =
      input.paymentId != null
        ? `payment:${input.paymentId}:failed`
        : `invoice:${input.stripeInvoiceId ?? "unknown"}:failed`;
    await createNotification({
      appUserId: input.appUserId,
      type: "SYSTEM" as DbNotificationType,
      title: "Payment failed",
      message:
        "We couldn’t complete your payment. Your subscription status was updated from Stripe.",
      metadata: {
        idempotencyKey: key,
        uiType: "payment_failed",
        paymentId: input.paymentId ?? undefined,
        stripeInvoiceId: input.stripeInvoiceId ?? undefined,
        actionLabel: "Open billing",
      },
    });
  });
}

export async function notifySubscriptionCanceled(input: {
  appUserId: string;
  stripeSubscriptionId: string;
}): Promise<void> {
  await notifySafely("subscription_canceled", async () => {
    await createNotification({
      appUserId: input.appUserId,
      type: "SUBSCRIPTION_EXPIRING",
      title: "Subscription ended",
      message:
        "Your paid subscription has ended. You’re now on the Free plan.",
      metadata: {
        idempotencyKey: `subscription:${input.stripeSubscriptionId}:canceled`,
        uiType: "membership_expiry",
        stripeSubscriptionId: input.stripeSubscriptionId,
        actionLabel: "Manage membership",
      },
    });
  });
}

export async function notifyCreditRefunded(input: {
  appUserId: string;
  auditId: string;
  credits: number;
}): Promise<void> {
  await notifySafely("credit_refund", async () => {
    await createNotification({
      appUserId: input.appUserId,
      type: "SYSTEM",
      title: "Credits refunded",
      message: `${input.credits} credits were returned after an audit failure.`,
      metadata: {
        idempotencyKey: `audit:${input.auditId}:refund`,
        uiType: "system",
        auditId: input.auditId,
        credits: input.credits,
        actionLabel: "Open audit",
      },
    });
  });
}
