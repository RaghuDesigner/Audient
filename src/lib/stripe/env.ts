import "server-only";

/**
 * Server-only Stripe environment.
 * Never use NEXT_PUBLIC_ for secret or webhook secret.
 */

function isPlaceholder(value: string): boolean {
  const lower = value.toLowerCase();
  return (
    !value ||
    lower.includes("your-") ||
    lower.includes("changeme") ||
    lower.includes("placeholder") ||
    lower === "sk_test_..." ||
    lower === "whsec_..." ||
    lower === "pk_test_..."
  );
}

export function readStripeSecretKey(): string | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
  if (isPlaceholder(key)) return null;
  return key;
}

/**
 * BACKEND-007: default TEST mode only.
 * BACKEND-010: production may allow live keys only when ALLOW_STRIPE_LIVE=true.
 */
export function assertStripeKeyMode(key: string): void {
  const allowLive =
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_STRIPE_LIVE === "true";

  if (allowLive) {
    if (!key.startsWith("sk_live_")) {
      throw new Error(
        "Production with ALLOW_STRIPE_LIVE=true requires STRIPE_SECRET_KEY=sk_live_…",
      );
    }
    return;
  }

  if (key.startsWith("sk_live_")) {
    throw new Error(
      "Live Stripe keys are not allowed unless NODE_ENV=production and ALLOW_STRIPE_LIVE=true. Use sk_test_… for local/test.",
    );
  }
  if (!key.startsWith("sk_test_")) {
    throw new Error(
      "STRIPE_SECRET_KEY must be a Stripe TEST secret (sk_test_…) unless live mode is explicitly enabled.",
    );
  }
}

/** @deprecated Prefer assertStripeKeyMode — kept for call-site compatibility. */
export function assertStripeTestModeSecret(key: string): void {
  assertStripeKeyMode(key);
}

export function readStripeWebhookSecret(): string | null {
  const key = process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";
  if (isPlaceholder(key)) return null;
  return key;
}

/** Publishable key may be NEXT_PUBLIC_ (browser-safe). Optional for Checkout Session redirect flow. */
export function readStripePublishableKey(): string | null {
  const key =
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ||
    process.env.STRIPE_PUBLISHABLE_KEY?.trim() ||
    "";
  if (isPlaceholder(key)) return null;
  return key;
}

export function isStripeConfigured(): boolean {
  const key = readStripeSecretKey();
  if (!key) return false;
  try {
    assertStripeKeyMode(key);
    return true;
  } catch {
    return false;
  }
}

export function requireStripeSecretKey(): string {
  const key = readStripeSecretKey();
  if (!key) {
    throw new Error(
      "Missing STRIPE_SECRET_KEY (server-only). Set it in .env.local. Never use NEXT_PUBLIC_STRIPE_SECRET_KEY.",
    );
  }
  assertStripeKeyMode(key);
  return key;
}

export function requireStripeWebhookSecret(): string {
  const key = readStripeWebhookSecret();
  if (!key) {
    throw new Error(
      "Missing STRIPE_WEBHOOK_SECRET (server-only). Set the signing secret from Stripe CLI / Dashboard.",
    );
  }
  return key;
}

export function appBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    "http://localhost:3000";
  return raw.replace(/\/$/, "");
}
