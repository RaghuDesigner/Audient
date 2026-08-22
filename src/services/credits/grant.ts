import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PLANS, type PlanTier } from "@/config/plans";

/**
 * Grant purchased (top-up) credits after verified Stripe payment.
 * Idempotent when payment_id already has a TOPUP ledger row.
 */
export async function grantTopUpCredits(input: {
  appUserId: string;
  credits: number;
  paymentId: string;
  note?: string;
}): Promise<{ granted: boolean; balanceAfter: number }> {
  if (input.credits <= 0) {
    throw new Error("INVALID_CREDIT_GRANT");
  }

  const admin = createSupabaseAdminClient();

  const { data: existingTxn } = await admin
    .from("credit_transactions")
    .select("id, balance_after")
    .eq("payment_id", input.paymentId)
    .eq("type", "TOPUP")
    .maybeSingle();

  if (existingTxn) {
    return {
      granted: false,
      balanceAfter: (existingTxn as { balance_after: number }).balance_after,
    };
  }

  const { data: wallet, error } = await admin
    .from("credits")
    .select("id, plan_credits, purchased_credits, balance")
    .eq("user_id", input.appUserId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !wallet) {
    throw new Error("CREDITS_MISSING");
  }

  const row = wallet as {
    id: string;
    plan_credits: number;
    purchased_credits: number;
    balance: number;
  };

  const purchasedAfter = row.purchased_credits + input.credits;
  const balanceAfter = row.plan_credits + purchasedAfter;

  const { error: updError } = await admin
    .from("credits")
    .update({
      purchased_credits: purchasedAfter,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);

  if (updError) {
    throw new Error("CREDIT_UPDATE_FAILED");
  }

  const { error: txnError } = await admin.from("credit_transactions").insert({
    credits_id: row.id,
    type: "TOPUP",
    amount: input.credits,
    balance_after: balanceAfter,
    plan_after: row.plan_credits,
    purchased_after: purchasedAfter,
    payment_id: input.paymentId,
    note: input.note ?? "Stripe credit top-up",
  });

  if (txnError) {
    // Unique race: treat as already granted
    if (txnError.code === "23505") {
      return { granted: false, balanceAfter };
    }
    throw new Error("CREDIT_TXN_FAILED");
  }

  return { granted: true, balanceAfter };
}

/**
 * Align plan_credits with subscription tier monthly grant after upgrade.
 * Does not wipe purchased credits. Idempotent via payment_id MONTHLY_GRANT when provided.
 */
export async function syncPlanCreditsForTier(input: {
  appUserId: string;
  tier: PlanTier;
  paymentId?: string | null;
  note?: string;
}): Promise<void> {
  const admin = createSupabaseAdminClient();
  const monthly = PLANS[input.tier].monthlyCredits;

  if (input.paymentId) {
    const { data: existing } = await admin
      .from("credit_transactions")
      .select("id")
      .eq("payment_id", input.paymentId)
      .eq("type", "MONTHLY_GRANT")
      .maybeSingle();
    if (existing) return;
  }

  const { data: wallet } = await admin
    .from("credits")
    .select("id, plan_credits, purchased_credits, monthly_grant")
    .eq("user_id", input.appUserId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!wallet) return;
  const row = wallet as {
    id: string;
    plan_credits: number;
    purchased_credits: number;
    monthly_grant: number;
  };

  // On upgrade: set plan pool to the new monthly allotment (purchased untouched).
  const planAfter = monthly;
  const balanceAfter = planAfter + row.purchased_credits;

  await admin
    .from("credits")
    .update({
      plan_credits: planAfter,
      monthly_grant: monthly,
      is_unlimited: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);

  await admin.from("credit_transactions").insert({
    credits_id: row.id,
    type: "MONTHLY_GRANT",
    amount: planAfter - row.plan_credits,
    balance_after: balanceAfter,
    plan_after: planAfter,
    purchased_after: row.purchased_credits,
    payment_id: input.paymentId ?? null,
    note: input.note ?? `Plan credits synced for ${input.tier}`,
  });
}
