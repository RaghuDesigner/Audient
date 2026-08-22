import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export class CreditMutationError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status = 500) {
    super(message);
    this.name = "CreditMutationError";
    this.code = code;
    this.status = status;
  }
}

type CreditsWalletRow = {
  id: string;
  user_id: string;
  plan_credits: number;
  purchased_credits: number;
  balance: number;
  lifetime_used: number;
  is_unlimited: boolean;
};

function splitDeduction(
  planCredits: number,
  purchasedCredits: number,
  cost: number,
): { planAfter: number; purchasedAfter: number } {
  let remaining = cost;
  let planAfter = planCredits;
  let purchasedAfter = purchasedCredits;

  if (remaining > 0 && planAfter > 0) {
    const take = Math.min(planAfter, remaining);
    planAfter -= take;
    remaining -= take;
  }
  if (remaining > 0) {
    if (purchasedAfter < remaining) {
      throw new CreditMutationError(
        "INSUFFICIENT_CREDITS",
        "Not enough credits for this audit.",
        402,
      );
    }
    purchasedAfter -= remaining;
  }

  return { planAfter, purchasedAfter };
}

/**
 * Server-only credit deduct for an audit. Uses service role (RLS denies client writes).
 * Deducts plan credits first, then purchased. Appends AUDIT_DEDUCTION ledger row.
 */
export async function deductCreditsForAudit(input: {
  appUserId: string;
  auditId: string;
  cost: number;
  note?: string;
}): Promise<{ balanceAfter: number }> {
  if (input.cost < 0) {
    throw new CreditMutationError(
      "INVALID_COST",
      "Credit cost must be non-negative.",
      400,
    );
  }

  let admin: SupabaseClient;
  try {
    admin = createSupabaseAdminClient();
  } catch {
    throw new CreditMutationError(
      "SERVICE_ROLE_REQUIRED",
      "Credit authorization requires SUPABASE_SERVICE_ROLE_KEY (server-only).",
      503,
    );
  }

  const { data: wallet, error: readError } = await admin
    .from("credits")
    .select(
      "id, user_id, plan_credits, purchased_credits, balance, lifetime_used, is_unlimited",
    )
    .eq("user_id", input.appUserId)
    .is("deleted_at", null)
    .maybeSingle();

  if (readError || !wallet) {
    throw new CreditMutationError(
      "CREDITS_MISSING",
      "Credit wallet not found.",
      404,
    );
  }

  const row = wallet as CreditsWalletRow;

  // Idempotent: one AUDIT_DEDUCTION per audit_id
  const { data: existingDeduction } = await admin
    .from("credit_transactions")
    .select("id, balance_after")
    .eq("audit_id", input.auditId)
    .eq("type", "AUDIT_DEDUCTION")
    .limit(1)
    .maybeSingle();

  if (existingDeduction) {
    return {
      balanceAfter:
        typeof (existingDeduction as { balance_after?: number }).balance_after ===
        "number"
          ? (existingDeduction as { balance_after: number }).balance_after
          : row.balance,
    };
  }

  if (row.is_unlimited || input.cost === 0) {
    const { error: txnError } = await admin.from("credit_transactions").insert({
      credits_id: row.id,
      type: "AUDIT_DEDUCTION",
      amount: 0,
      balance_after: row.balance,
      plan_after: row.plan_credits,
      purchased_after: row.purchased_credits,
      audit_id: input.auditId,
      note:
        input.note ??
        (row.is_unlimited
          ? "Audit authorization (unlimited plan)"
          : "Audit authorization (zero cost)"),
    });
    if (txnError) {
      throw new CreditMutationError(
        "LEDGER_WRITE_FAILED",
        "Unable to record credit transaction.",
        500,
      );
    }
    return { balanceAfter: row.balance };
  }

  if (row.balance < input.cost) {
    throw new CreditMutationError(
      "INSUFFICIENT_CREDITS",
      "Not enough credits for this audit.",
      402,
    );
  }

  const { planAfter, purchasedAfter } = splitDeduction(
    row.plan_credits,
    row.purchased_credits,
    input.cost,
  );
  const balanceAfter = planAfter + purchasedAfter;

  const { data: updated, error: updateError } = await admin
    .from("credits")
    .update({
      plan_credits: planAfter,
      purchased_credits: purchasedAfter,
      lifetime_used: row.lifetime_used + input.cost,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id)
    .eq("plan_credits", row.plan_credits)
    .eq("purchased_credits", row.purchased_credits)
    .select("balance")
    .maybeSingle();

  if (updateError || !updated) {
    throw new CreditMutationError(
      "CREDIT_CONFLICT",
      "Credits changed during authorization. Retry.",
      409,
    );
  }

  const { error: txnError } = await admin.from("credit_transactions").insert({
    credits_id: row.id,
    type: "AUDIT_DEDUCTION",
    amount: -input.cost,
    balance_after: balanceAfter,
    plan_after: planAfter,
    purchased_after: purchasedAfter,
    audit_id: input.auditId,
    note: input.note ?? "Audit credit authorization",
  });

  if (txnError) {
    // Unique violation = concurrent duplicate deduction — treat as success.
    if (txnError.code === "23505") {
      const { data: again } = await admin
        .from("credits")
        .select("balance")
        .eq("user_id", input.appUserId)
        .maybeSingle();
      return {
        balanceAfter: (again as { balance?: number } | null)?.balance ?? balanceAfter,
      };
    }
    // Best-effort rollback of wallet (ledger insert failed).
    await admin
      .from("credits")
      .update({
        plan_credits: row.plan_credits,
        purchased_credits: row.purchased_credits,
        lifetime_used: row.lifetime_used,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    throw new CreditMutationError(
      "LEDGER_WRITE_FAILED",
      "Unable to record credit transaction.",
      500,
    );
  }

  return { balanceAfter };
}

/**
 * Full refund for a failed audit (PRICING.md). Idempotent if refund already exists.
 */
export async function refundCreditsForFailedAudit(input: {
  appUserId: string;
  auditId: string;
  cost: number;
  note?: string;
}): Promise<{ balanceAfter: number; refunded: boolean }> {
  if (input.cost <= 0) {
    return { balanceAfter: 0, refunded: false };
  }

  let admin: SupabaseClient;
  try {
    admin = createSupabaseAdminClient();
  } catch {
    throw new CreditMutationError(
      "SERVICE_ROLE_REQUIRED",
      "Credit refund requires SUPABASE_SERVICE_ROLE_KEY (server-only).",
      503,
    );
  }

  const { data: existing } = await admin
    .from("credit_transactions")
    .select("id")
    .eq("audit_id", input.auditId)
    .eq("type", "REFUND")
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { data: wallet } = await admin
      .from("credits")
      .select("balance")
      .eq("user_id", input.appUserId)
      .maybeSingle();
    return {
      balanceAfter: (wallet as { balance: number } | null)?.balance ?? 0,
      refunded: false,
    };
  }

  const { data: wallet, error: readError } = await admin
    .from("credits")
    .select(
      "id, user_id, plan_credits, purchased_credits, balance, lifetime_used, is_unlimited",
    )
    .eq("user_id", input.appUserId)
    .is("deleted_at", null)
    .maybeSingle();

  if (readError || !wallet) {
    throw new CreditMutationError(
      "CREDITS_MISSING",
      "Credit wallet not found.",
      404,
    );
  }

  const row = wallet as CreditsWalletRow;
  if (row.is_unlimited) {
    return { balanceAfter: row.balance, refunded: false };
  }

  const planAfter = row.plan_credits + input.cost;
  const balanceAfter = planAfter + row.purchased_credits;
  const lifetimeUsed = Math.max(0, row.lifetime_used - input.cost);

  const { error: updateError } = await admin
    .from("credits")
    .update({
      plan_credits: planAfter,
      lifetime_used: lifetimeUsed,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id)
    .eq("plan_credits", row.plan_credits)
    .eq("purchased_credits", row.purchased_credits);

  if (updateError) {
    throw new CreditMutationError(
      "CREDIT_CONFLICT",
      "Unable to refund credits.",
      409,
    );
  }

  const { error: txnError } = await admin.from("credit_transactions").insert({
    credits_id: row.id,
    type: "REFUND",
    amount: input.cost,
    balance_after: balanceAfter,
    plan_after: planAfter,
    purchased_after: row.purchased_credits,
    audit_id: input.auditId,
    note: input.note ?? "Failed audit refund",
  });

  if (txnError) {
    await admin
      .from("credits")
      .update({
        plan_credits: row.plan_credits,
        lifetime_used: row.lifetime_used,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    throw new CreditMutationError(
      "LEDGER_WRITE_FAILED",
      "Unable to record refund transaction.",
      500,
    );
  }

  return { balanceAfter, refunded: true };
}
