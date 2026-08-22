import "server-only";

import type Stripe from "stripe";

import type { PlanTier } from "@/config/plans";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { syncPlanCreditsForTier } from "@/services/credits/grant";

export type AudientMembershipStatus =
  | "ACTIVE"
  | "TRIALING"
  | "PAST_DUE"
  | "CANCELED";

export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): AudientMembershipStatus {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "trialing":
      return "TRIALING";
    case "past_due":
    case "unpaid":
      return "PAST_DUE";
    case "canceled":
    case "incomplete_expired":
      return "CANCELED";
    case "incomplete":
    case "paused":
    default:
      return "PAST_DUE";
  }
}

function tierFromMetadata(
  meta: Stripe.Metadata | null | undefined,
): PlanTier | null {
  const raw = meta?.plan_tier?.toUpperCase();
  if (raw === "PRO" || raw === "ENTERPRISE") return raw;
  if (raw === "BUSINESS") return "ENTERPRISE";
  return null;
}

async function resolvePlanId(tier: PlanTier): Promise<string | null> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("plans")
    .select("id")
    .eq("key", tier)
    .is("deleted_at", null)
    .maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

/**
 * Sync membership from Stripe subscription (authoritative).
 */
export async function syncMembershipFromSubscription(
  subscription: Stripe.Subscription,
  options?: { paymentIdForCreditSync?: string | null },
): Promise<void> {
  const admin = createSupabaseAdminClient();
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const appUserId = subscription.metadata?.audient_user_id?.trim() || null;
  const tier =
    tierFromMetadata(subscription.metadata) ??
    (subscription.status === "canceled" ? "FREE" : null);

  const { data: membership } = await admin
    .from("memberships")
    .select("id, user_id, tier")
    .eq("stripe_customer_id", customerId)
    .is("deleted_at", null)
    .maybeSingle();

  let membershipRow = membership as
    | { id: string; user_id: string; tier: string }
    | null;

  if (!membershipRow && appUserId) {
    const { data: byUser } = await admin
      .from("memberships")
      .select("id, user_id, tier")
      .eq("user_id", appUserId)
      .is("deleted_at", null)
      .maybeSingle();
    membershipRow = byUser as typeof membershipRow;
  }

  if (!membershipRow) {
    console.error("[stripe] membership not found for subscription", subscription.id);
    return;
  }

  const status = mapStripeSubscriptionStatus(subscription.status);
  const nextTier: PlanTier =
    status === "CANCELED"
      ? "FREE"
      : (tier ?? (membershipRow.tier as PlanTier) ?? "FREE");

  const planId = await resolvePlanId(nextTier);
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;
  const canceledAt = subscription.canceled_at
    ? new Date(subscription.canceled_at * 1000).toISOString()
    : null;

  await admin
    .from("memberships")
    .update({
      tier: nextTier,
      status,
      billing_interval: "MONTHLY",
      plan_id: planId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      current_period_end: periodEnd,
      canceled_at: canceledAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", membershipRow.id);

  if (nextTier === "PRO" || nextTier === "ENTERPRISE") {
    if (status === "ACTIVE" || status === "TRIALING") {
      await syncPlanCreditsForTier({
        appUserId: membershipRow.user_id,
        tier: nextTier,
        paymentId: options?.paymentIdForCreditSync ?? null,
        note: `Subscription ${subscription.status} → ${nextTier}`,
      });
    }
  } else if (nextTier === "FREE") {
    await syncPlanCreditsForTier({
      appUserId: membershipRow.user_id,
      tier: "FREE",
      paymentId: options?.paymentIdForCreditSync ?? null,
      note: "Subscription ended → FREE",
    });
  }
}
