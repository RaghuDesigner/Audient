import "server-only";

import type Stripe from "stripe";

import { getStripe } from "@/lib/stripe/client";
import { requireStripeWebhookSecret } from "@/lib/stripe/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logInfo, logWarn } from "@/lib/log";
import { grantTopUpCredits } from "@/services/credits/grant";
import { syncMembershipFromSubscription } from "@/services/billing/membership-sync";
import {
  attachStripeIdsToExistingPayment,
  upsertPayment,
} from "@/services/billing/payments";
import {
  checkoutInvoiceId,
  checkoutPaymentIntentId,
  checkoutSubscriptionId,
  invoicePaymentIntentId,
  invoiceSubscriptionId,
  isCreditTopUpCheckout,
  isSubscriptionCheckout,
} from "@/services/billing/stripe-object-ids";
import {
  notifyCreditPurchaseSucceeded,
  notifyPaymentFailed,
  notifySubscriptionCanceled,
  notifySubscriptionPaymentSucceeded,
} from "@/services/notification/emit";

async function beginWebhookEvent(
  event: Stripe.Event,
): Promise<"process" | "skip"> {
  const admin = createSupabaseAdminClient();
  const { data: existing } = await admin
    .from("processed_webhook_events")
    .select("id, status")
    .eq("stripe_event_id", event.id)
    .maybeSingle();

  if (existing) {
    const status = (existing as { status: string }).status;
    if (status === "PROCESSED") return "skip";
    // PENDING/FAILED → allow retry processing
  } else {
    const { error } = await admin.from("processed_webhook_events").insert({
      stripe_event_id: event.id,
      event_type: event.type,
      status: "PENDING",
      payload: event as unknown as Record<string, unknown>,
    });
    if (error?.code === "23505") {
      return "skip";
    }
  }
  return "process";
}

async function finishWebhookEvent(
  eventId: string,
  ok: boolean,
  errorMessage?: string,
): Promise<void> {
  const admin = createSupabaseAdminClient();
  await admin
    .from("processed_webhook_events")
    .update({
      status: ok ? "PROCESSED" : "FAILED",
      error_message: errorMessage ?? null,
      processed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_event_id", eventId);
}

async function resolveAppUserIdFromCustomer(
  customerId: string,
): Promise<{ appUserId: string; membershipId: string } | null> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("memberships")
    .select("id, user_id")
    .eq("stripe_customer_id", customerId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!data) return null;
  return {
    appUserId: (data as { user_id: string }).user_id,
    membershipId: (data as { id: string }).id,
  };
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const appUserId =
    session.metadata?.audient_user_id ||
    session.client_reference_id ||
    null;

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;

  let membershipId: string | null = null;
  if (customerId) {
    const resolved = await resolveAppUserIdFromCustomer(customerId);
    membershipId = resolved?.membershipId ?? null;
  }

  const paymentIntentId = checkoutPaymentIntentId(session);

  if (isCreditTopUpCheckout(session)) {
    if (!appUserId) {
      throw new Error("CHECKOUT_MISSING_USER");
    }
    const amount = session.amount_total ?? 0;
    const currency = session.currency ?? "usd";
    const credits = Number(session.metadata?.credits ?? "0");
    const { paymentId } = await upsertPayment({
      appUserId,
      membershipId,
      amount: amount > 0 ? amount : 1,
      currency,
      status: session.payment_status === "paid" ? "SUCCEEDED" : "PENDING",
      type: "CREDIT_TOPUP",
      stripePaymentIntentId: paymentIntentId,
      stripeInvoiceId: checkoutInvoiceId(session),
      externalPaymentId: session.id,
      creditsGranted: credits > 0 ? credits : null,
      description: `Credit pack ${session.metadata?.pack_id ?? ""}`.trim(),
      paidAt:
        session.payment_status === "paid" ? new Date().toISOString() : null,
    });

    if (session.payment_status === "paid" && credits > 0) {
      await grantTopUpCredits({
        appUserId,
        credits,
        paymentId,
        note: `Stripe checkout ${session.id}`,
      });
      await notifyCreditPurchaseSucceeded({
        appUserId,
        paymentId,
        credits,
      });
    }
    return;
  }

  // Subscription: invoice.paid is the authoritative payment writer.
  // Checkout may attach session/invoice/subscription ids to that row only.
  if (isSubscriptionCheckout(session)) {
    const subId = checkoutSubscriptionId(session);
    await attachStripeIdsToExistingPayment({
      stripeInvoiceId: checkoutInvoiceId(session),
      stripePaymentIntentId: paymentIntentId,
      stripeSubscriptionId: subId,
      externalPaymentId: session.id,
      creditsGranted: Number(session.metadata?.credits ?? "0") || null,
    });

    if (subId) {
      const stripe = getStripe();
      const subscription = await stripe.subscriptions.retrieve(subId);
      await syncMembershipFromSubscription(subscription);
    }
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id ?? null;
  if (!customerId) return;

  const resolved = await resolveAppUserIdFromCustomer(customerId);
  if (!resolved) return;

  const subId = invoiceSubscriptionId(invoice);
  const paymentIntentId = invoicePaymentIntentId(invoice);

  const { paymentId } = await upsertPayment({
    appUserId: resolved.appUserId,
    membershipId: resolved.membershipId,
    amount: invoice.amount_paid > 0 ? invoice.amount_paid : invoice.total || 1,
    currency: invoice.currency ?? "usd",
    status: "SUCCEEDED",
    type: "SUBSCRIPTION",
    stripeInvoiceId: invoice.id,
    stripeSubscriptionId: subId,
    stripePaymentIntentId: paymentIntentId,
    invoiceUrl: invoice.hosted_invoice_url ?? invoice.invoice_pdf ?? null,
    invoiceNumber: invoice.number ?? null,
    description: invoice.description ?? "Subscription invoice",
    paidAt: invoice.status_transitions?.paid_at
      ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
      : new Date().toISOString(),
  });

  if (subId) {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(subId);
    await syncMembershipFromSubscription(subscription, {
      paymentIdForCreditSync: paymentId,
    });
    const planTier =
      subscription.metadata?.plan_tier ??
      invoice.metadata?.plan_tier ??
      null;
    await notifySubscriptionPaymentSucceeded({
      appUserId: resolved.appUserId,
      paymentId,
      planTier,
      invoiceNumber: invoice.number ?? null,
      amountCents: invoice.amount_paid,
      billingReason: invoice.billing_reason ?? null,
    });
  } else {
    await notifySubscriptionPaymentSucceeded({
      appUserId: resolved.appUserId,
      paymentId,
      invoiceNumber: invoice.number ?? null,
      amountCents: invoice.amount_paid,
      billingReason: invoice.billing_reason ?? null,
    });
  }
}

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
): Promise<void> {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id ?? null;
  if (!customerId) return;
  const resolved = await resolveAppUserIdFromCustomer(customerId);
  if (!resolved) return;

  const subId = invoiceSubscriptionId(invoice);

  const { paymentId } = await upsertPayment({
    appUserId: resolved.appUserId,
    membershipId: resolved.membershipId,
    amount: invoice.amount_due > 0 ? invoice.amount_due : 1,
    currency: invoice.currency ?? "usd",
    status: "FAILED",
    type: "SUBSCRIPTION",
    stripeInvoiceId: invoice.id,
    stripeSubscriptionId: subId,
    stripePaymentIntentId: invoicePaymentIntentId(invoice),
    invoiceUrl: invoice.hosted_invoice_url ?? null,
    invoiceNumber: invoice.number ?? null,
    description: "Invoice payment failed",
  });
  if (subId) {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(subId);
    await syncMembershipFromSubscription(subscription);
  }
  await notifyPaymentFailed({
    appUserId: resolved.appUserId,
    paymentId,
    stripeInvoiceId: invoice.id,
  });
}

async function dispatchEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(
        event.data.object as Stripe.Checkout.Session,
      );
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await syncMembershipFromSubscription(subscription);
      if (
        event.type === "customer.subscription.deleted" ||
        subscription.status === "canceled"
      ) {
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;
        const resolved = await resolveAppUserIdFromCustomer(customerId);
        if (resolved) {
          await notifySubscriptionCanceled({
            appUserId: resolved.appUserId,
            stripeSubscriptionId: subscription.id,
          });
        }
      }
      break;
    }
    case "invoice.paid":
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;
    case "payment_intent.succeeded":
    case "payment_intent.payment_failed":
      // Covered by checkout.session.completed / invoice.* for our flows.
      break;
    default:
      break;
  }
}

/**
 * Verify signature and process Stripe webhook idempotently.
 */
export async function processStripeWebhook(
  rawBody: string,
  signatureHeader: string | null,
): Promise<{ ok: boolean; skipped?: boolean }> {
  if (!signatureHeader) {
    throw new Error("MISSING_SIGNATURE");
  }

  const stripe = getStripe();
  const secret = requireStripeWebhookSecret();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signatureHeader, secret);
  } catch {
    throw new Error("INVALID_SIGNATURE");
  }

  const gate = await beginWebhookEvent(event);
  if (gate === "skip") {
    return { ok: true, skipped: true };
  }

  try {
    await dispatchEvent(event);
    await finishWebhookEvent(event.id, true);
    logInfo("stripe.webhook_ok", {
      stripeEventId: event.id,
      type: event.type,
    });
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook processing failed";
    await finishWebhookEvent(event.id, false, message);
    logWarn("stripe.webhook_failed", {
      stripeEventId: event.id,
      type: event.type,
      detail: message.slice(0, 200),
    });
    throw error;
  }
}
