import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isTrustedHostedInvoiceUrl } from "@/utils/hosted-invoice-url";

export type StripePaymentIds = {
  stripeInvoiceId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePaymentIntentId?: string | null;
  externalPaymentId?: string | null;
};

export type UpsertPaymentInput = StripePaymentIds & {
  appUserId: string;
  membershipId?: string | null;
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
  type: "SUBSCRIPTION" | "CREDIT_TOPUP" | "REFUND";
  creditsGranted?: number | null;
  invoiceUrl?: string | null;
  invoiceNumber?: string | null;
  description?: string | null;
  paidAt?: string | null;
};

type AdminClient = ReturnType<typeof createSupabaseAdminClient>;

function stripeFieldPatch(
  input: StripePaymentIds &
    Partial<
      Pick<
        UpsertPaymentInput,
        | "status"
        | "creditsGranted"
        | "invoiceUrl"
        | "invoiceNumber"
        | "description"
        | "paidAt"
      >
    >,
): Record<string, unknown> {
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.status) patch.status = input.status;
  if (input.stripeInvoiceId) patch.stripe_invoice_id = input.stripeInvoiceId;
  if (input.stripePaymentIntentId) {
    patch.stripe_payment_intent_id = input.stripePaymentIntentId;
  }
  if (input.stripeSubscriptionId) {
    patch.stripe_subscription_id = input.stripeSubscriptionId;
  }
  if (input.externalPaymentId) {
    patch.external_payment_id = input.externalPaymentId;
  }
  if (input.creditsGranted != null) patch.credits_granted = input.creditsGranted;
  if (input.invoiceUrl) patch.invoice_url = input.invoiceUrl;
  if (input.invoiceNumber) patch.invoice_number = input.invoiceNumber;
  if (input.paidAt) patch.paid_at = input.paidAt;
  if (input.description) patch.description = input.description;
  return patch;
}

async function findPaymentIdByStripeIds(
  admin: AdminClient,
  ids: StripePaymentIds,
): Promise<string | null> {
  if (ids.externalPaymentId) {
    const { data } = await admin
      .from("payments")
      .select("id")
      .eq("external_payment_id", ids.externalPaymentId)
      .is("deleted_at", null)
      .maybeSingle();
    if (data?.id) return data.id as string;
  }
  if (ids.stripePaymentIntentId) {
    const { data } = await admin
      .from("payments")
      .select("id")
      .eq("stripe_payment_intent_id", ids.stripePaymentIntentId)
      .is("deleted_at", null)
      .maybeSingle();
    if (data?.id) return data.id as string;
  }
  if (ids.stripeInvoiceId) {
    const { data } = await admin
      .from("payments")
      .select("id")
      .eq("stripe_invoice_id", ids.stripeInvoiceId)
      .is("deleted_at", null)
      .maybeSingle();
    if (data?.id) return data.id as string;
  }
  return null;
}

/**
 * Attach Stripe ids to an existing payment row. Never inserts.
 * Used by subscription checkout.session.completed after invoice.paid.
 */
export async function attachStripeIdsToExistingPayment(
  ids: StripePaymentIds & { creditsGranted?: number | null },
): Promise<{ paymentId: string } | null> {
  const admin = createSupabaseAdminClient();
  const paymentId = await findPaymentIdByStripeIds(admin, ids);
  if (!paymentId) return null;
  await admin.from("payments").update(stripeFieldPatch(ids)).eq("id", paymentId);
  return { paymentId };
}

/**
 * Upsert payment by Stripe ids / external checkout session id (idempotent).
 */
export async function upsertPayment(
  input: UpsertPaymentInput,
): Promise<{ paymentId: string; created: boolean }> {
  const admin = createSupabaseAdminClient();

  const existingId = await findPaymentIdByStripeIds(admin, input);
  if (existingId) {
    await admin
      .from("payments")
      .update(stripeFieldPatch(input))
      .eq("id", existingId);
    return { paymentId: existingId, created: false };
  }

  const { data: inserted, error } = await admin
    .from("payments")
    .insert({
      user_id: input.appUserId,
      membership_id: input.membershipId ?? null,
      amount: input.amount,
      currency: input.currency.toLowerCase().slice(0, 3),
      status: input.status,
      type: input.type,
      stripe_invoice_id: input.stripeInvoiceId ?? null,
      stripe_subscription_id: input.stripeSubscriptionId ?? null,
      stripe_payment_intent_id: input.stripePaymentIntentId ?? null,
      external_payment_id: input.externalPaymentId ?? null,
      credits_granted: input.creditsGranted ?? null,
      invoice_url: input.invoiceUrl ?? null,
      invoice_number: input.invoiceNumber ?? null,
      description: input.description ?? null,
      paid_at: input.paidAt ?? null,
    })
    .select("id")
    .single();

  if (error?.code === "23505") {
    const raced = await findPaymentIdByStripeIds(admin, input);
    if (raced) {
      await admin.from("payments").update(stripeFieldPatch(input)).eq("id", raced);
      return { paymentId: raced, created: false };
    }
  }

  if (error || !inserted) {
    throw new Error(`PAYMENT_UPSERT_FAILED:${error?.message ?? "unknown"}`);
  }

  return { paymentId: inserted.id as string, created: true };
}

export async function listPaymentsForUser(
  appUserId: string,
  limit = 50,
): Promise<
  Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    type: string;
    invoiceNumber: string | null;
    invoiceUrl: string | null;
    paidAt: string | null;
    createdAt: string;
    description: string | null;
    creditsGranted: number | null;
    stripeSubscriptionId: string | null;
  }>
> {
  const admin = createSupabaseAdminClient();
  // Prefer user-owned reads via RLS when possible — admin used for consistency with webhook writers.
  const { data, error } = await admin
    .from("payments")
    .select(
      "id, amount, currency, status, type, invoice_number, invoice_url, paid_at, created_at, description, credits_granted, stripe_subscription_id",
    )
    .eq("user_id", appUserId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: String(r.id),
      amount: Number(r.amount),
      currency: String(r.currency),
      status: String(r.status),
      type: String(r.type),
      invoiceNumber: (r.invoice_number as string | null) ?? null,
      invoiceUrl: (r.invoice_url as string | null) ?? null,
      paidAt: (r.paid_at as string | null) ?? null,
      createdAt: String(r.created_at),
      description: (r.description as string | null) ?? null,
      creditsGranted: (r.credits_granted as number | null) ?? null,
      stripeSubscriptionId:
        (r.stripe_subscription_id as string | null) ?? null,
    };
  });
}

/**
 * Own-payment hosted invoice URLs only (caller must pass authenticated user id).
 */
export async function getOwnedPaymentInvoiceUrls(
  appUserId: string,
  paymentIds: readonly string[],
): Promise<Map<string, string>> {
  const unique = [
    ...new Set(
      paymentIds
        .map((id) => id.trim())
        .filter((id) => id.length > 0 && id.length <= 80),
    ),
  ];
  const result = new Map<string, string>();
  if (unique.length === 0) return result;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("payments")
    .select("id, invoice_url")
    .eq("user_id", appUserId)
    .in("id", unique)
    .is("deleted_at", null);

  if (error || !data) return result;

  for (const row of data) {
    const r = row as { id: string; invoice_url: string | null };
    const url = r.invoice_url?.trim() ?? "";
    if (url && isTrustedHostedInvoiceUrl(url)) {
      result.set(String(r.id), url);
    }
  }
  return result;
}
