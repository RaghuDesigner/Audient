import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getStripe } from "@/lib/stripe/client";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Ensure membership row has a Stripe customer; create one if missing.
 * Stores stripe_customer_id on public.memberships (authoritative mapping).
 */
export async function ensureStripeCustomer(input: {
  appUserId: string;
  email: string | null;
  name: string | null;
  /** Authenticated user-scoped client for reads; writes use admin for Stripe fields. */
  supabase: SupabaseClient;
}): Promise<{ customerId: string; membershipId: string }> {
  const admin = createSupabaseAdminClient();

  const { data: membership, error } = await admin
    .from("memberships")
    .select("id, stripe_customer_id, user_id")
    .eq("user_id", input.appUserId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !membership) {
    throw new Error("MEMBERSHIP_MISSING");
  }

  const existing = (membership as { stripe_customer_id: string | null })
    .stripe_customer_id;
  if (existing) {
    return {
      customerId: existing,
      membershipId: (membership as { id: string }).id,
    };
  }

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: input.email ?? undefined,
    name: input.name ?? undefined,
    metadata: {
      audient_user_id: input.appUserId,
    },
  });

  const { error: updateError } = await admin
    .from("memberships")
    .update({
      stripe_customer_id: customer.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", (membership as { id: string }).id)
    .is("deleted_at", null);

  if (updateError) {
    throw new Error("CUSTOMER_PERSIST_FAILED");
  }

  return {
    customerId: customer.id,
    membershipId: (membership as { id: string }).id,
  };
}
