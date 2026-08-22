import { NextResponse } from "next/server";

import { processStripeWebhook } from "@/services/billing/webhook";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/webhooks/stripe — Stripe signed webhooks (no browser auth).
 * Raw body required for signature verification.
 */
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  try {
    const result = await processStripeWebhook(rawBody, signature);
    return NextResponse.json(
      { received: true, skipped: Boolean(result.skipped) },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "WEBHOOK_ERROR";
    if (message === "INVALID_SIGNATURE" || message === "MISSING_SIGNATURE") {
      return NextResponse.json(
        { error: "Invalid signature", code: message },
        { status: 400 },
      );
    }
    console.error("[webhooks/stripe]", message);
    return NextResponse.json(
      { error: "Webhook processing failed", code: "WEBHOOK_FAILED" },
      { status: 500 },
    );
  }
}
