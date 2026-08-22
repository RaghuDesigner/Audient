import { NextResponse } from "next/server";

import { AuthRequiredError } from "@/lib/auth/session";
import { checkRateLimit, RateLimitError } from "@/lib/rate-limit";
import { isStripeConfigured } from "@/lib/stripe/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadAccountSnapshot } from "@/services/account";
import {
  BillingError,
  createCheckoutSession,
  parseCheckoutBody,
} from "@/services/billing/checkout";

export const dynamic = "force-dynamic";

/**
 * POST /api/billing/checkout — create Stripe Checkout Session (server-owned Price IDs).
 */
export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          error: "Stripe is not configured",
          code: "STRIPE_NOT_CONFIGURED",
        },
        { status: 503 },
      );
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) throw new AuthRequiredError();

    const account = await loadAccountSnapshot(supabase, user);
    if (account) {
      const limit = checkRateLimit({
        key: `billing:checkout:${account.appUserId}`,
        limit: 8,
        windowMs: 60_000,
      });
      if (!limit.allowed) {
        throw new RateLimitError(limit.retryAfterSec);
      }
    }

    const body = await request.json().catch(() => null);
    const input = parseCheckoutBody(body);
    const result = await createCheckoutSession(supabase, user, input);

    return NextResponse.json(
      {
        sessionId: result.sessionId,
        url: result.url,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        {
          status: 429,
          headers: { "Retry-After": String(error.retryAfterSec) },
        },
      );
    }
    if (error instanceof AuthRequiredError) {
      return NextResponse.json(
        { error: "Authentication required", code: "AUTH_REQUIRED" },
        { status: 401 },
      );
    }
    if (error instanceof BillingError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }
    console.error("[billing/checkout]", error);
    return NextResponse.json(
      { error: "Unable to create checkout", code: "CHECKOUT_FAILED" },
      { status: 500 },
    );
  }
}
