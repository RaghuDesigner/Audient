import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";

import type { TopUpPackId } from "@/config/plans";
import { appBaseUrl, isStripeConfigured } from "@/lib/stripe/env";
import { getStripe } from "@/lib/stripe/client";
import {
  assertKnownSubscriptionTier,
  assertKnownTopUpPack,
  expectedCreditsForPack,
  expectedCreditsForSubscription,
  resolveSubscriptionPriceId,
  resolveTopUpPriceId,
  uiPlanToTier,
  type StripeSubscriptionProduct,
} from "@/lib/stripe/prices";
import { loadAccountSnapshot } from "@/services/account";
import { ensureStripeCustomer } from "@/services/billing/customer";

export class BillingError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.name = "BillingError";
    this.code = code;
    this.status = status;
  }
}

export type CreateCheckoutInput =
  | {
      kind: "subscription";
      plan: "pro" | "business";
      /** Authoritative product only supports MONTHLY. */
      cycle?: "monthly" | "yearly";
    }
  | {
      kind: "credit_topup";
      packId: TopUpPackId | string;
    };

export type CreateCheckoutResult = {
  sessionId: string;
  url: string;
};

function mapUiPlan(plan: string): "pro" | "business" | null {
  const p = plan.trim().toLowerCase();
  if (p === "pro" || p === "business") return p;
  return null;
}

/**
 * Create a Stripe Checkout Session. Server validates plan/pack + Price IDs.
 */
export async function createCheckoutSession(
  supabase: SupabaseClient,
  authUser: User,
  input: CreateCheckoutInput,
): Promise<CreateCheckoutResult> {
  if (!isStripeConfigured()) {
    throw new BillingError(
      "STRIPE_NOT_CONFIGURED",
      "Stripe is not configured on the server.",
      503,
    );
  }

  const account = await loadAccountSnapshot(supabase, authUser);
  if (!account) {
    throw new BillingError("ACCOUNT_MISSING", "Account is not ready.", 404);
  }

  const { customerId } = await ensureStripeCustomer({
    appUserId: account.appUserId,
    email: account.email,
    name: account.displayName,
    supabase,
  });

  const stripe = getStripe();
  const base = appBaseUrl();

  if (input.kind === "subscription") {
    const uiPlan = mapUiPlan(input.plan);
    if (!uiPlan) {
      throw new BillingError("INVALID_PLAN", "Plan must be pro or business.", 400);
    }
    if (input.cycle && input.cycle !== "monthly") {
      throw new BillingError(
        "INVALID_INTERVAL",
        "Only monthly billing is supported by the current pricing catalog.",
        400,
      );
    }

    const tier: StripeSubscriptionProduct = uiPlanToTier(uiPlan);
    const priceId = resolveSubscriptionPriceId(tier);
    if (!priceId) {
      throw new BillingError(
        "PRICE_NOT_CONFIGURED",
        `Stripe Price ID missing for ${tier}. Set env mapping.`,
        503,
      );
    }

    const credits = expectedCreditsForSubscription(tier);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/payment-success?session_id={CHECKOUT_SESSION_ID}&plan=${uiPlan}&cycle=monthly&source=stripe`,
      cancel_url: `${base}/payment-failure?plan=${uiPlan}&cycle=monthly&reason=cancelled&source=stripe`,
      client_reference_id: account.appUserId,
      metadata: {
        audient_user_id: account.appUserId,
        kind: "subscription",
        plan_tier: tier,
        credits: String(credits),
      },
      subscription_data: {
        metadata: {
          audient_user_id: account.appUserId,
          plan_tier: tier,
          credits: String(credits),
        },
      },
    });

    if (!session.url) {
      throw new BillingError("CHECKOUT_FAILED", "Stripe did not return a URL.", 502);
    }

    return { sessionId: session.id, url: session.url };
  }

  const packId = assertKnownTopUpPack(String(input.packId));
  if (!packId) {
    throw new BillingError("INVALID_PACK", "Unknown credit pack.", 400);
  }
  if (!account.limits.topUpsEnabled) {
    throw new BillingError(
      "TOPUP_NOT_ALLOWED",
      "Credit top-ups require an eligible plan.",
      403,
    );
  }

  const priceId = resolveTopUpPriceId(packId);
  if (!priceId) {
    throw new BillingError(
      "PRICE_NOT_CONFIGURED",
      `Stripe Price ID missing for ${packId}.`,
      503,
    );
  }

  const credits = expectedCreditsForPack(packId);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${base}/payment-success?session_id={CHECKOUT_SESSION_ID}&plan=pro&cycle=monthly&source=stripe&pack=${packId}`,
    cancel_url: `${base}/payment-failure?plan=pro&cycle=monthly&reason=cancelled&source=stripe&pack=${packId}`,
    client_reference_id: account.appUserId,
    metadata: {
      audient_user_id: account.appUserId,
      kind: "credit_topup",
      pack_id: packId,
      credits: String(credits),
    },
    payment_intent_data: {
      metadata: {
        audient_user_id: account.appUserId,
        kind: "credit_topup",
        pack_id: packId,
        credits: String(credits),
      },
    },
  });

  if (!session.url) {
    throw new BillingError("CHECKOUT_FAILED", "Stripe did not return a URL.", 502);
  }

  return { sessionId: session.id, url: session.url };
}

export function parseCheckoutBody(body: unknown): CreateCheckoutInput {
  if (!body || typeof body !== "object") {
    throw new BillingError("INVALID_BODY", "Invalid JSON body.", 400);
  }
  const raw = body as Record<string, unknown>;
  const kind = String(raw.kind ?? "").toLowerCase();

  if (kind === "credit_topup" || raw.packId || raw.pack) {
    return {
      kind: "credit_topup",
      packId: String(raw.packId ?? raw.pack ?? ""),
    };
  }

  const plan = String(raw.plan ?? "").toLowerCase();
  const mapped = mapUiPlan(plan);
  if (!mapped) {
    // Also accept PRO / ENTERPRISE
    const tier = assertKnownSubscriptionTier(plan);
    if (!tier) {
      throw new BillingError("INVALID_PLAN", "Provide plan pro|business or packId.", 400);
    }
    return {
      kind: "subscription",
      plan: tier === "ENTERPRISE" ? "business" : "pro",
      cycle: String(raw.cycle ?? "monthly").toLowerCase() as "monthly" | "yearly",
    };
  }

  return {
    kind: "subscription",
    plan: mapped,
    cycle: String(raw.cycle ?? "monthly").toLowerCase() as "monthly" | "yearly",
  };
}
