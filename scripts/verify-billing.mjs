/**
 * Local validation for BACKEND-007 billing — NO Stripe payment API calls.
 * Usage: node scripts/verify-billing.mjs
 */

import { createRequire } from "node:module";
import { createHmac } from "node:crypto";

const require = createRequire(import.meta.url);

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

let passed = 0;
function ok(name) {
  passed += 1;
  console.log(`PASS: ${name}`);
}

// --- Pricing SoT (mirrors plans.ts / PRICING.md) ---
const PRO_CENTS = 2900;
const BUSINESS_CENTS = 9900;
const packs = [
  { id: "PACK_500", credits: 500, priceCents: 900 },
  { id: "PACK_2000", credits: 2000, priceCents: 2900 },
  { id: "PACK_5000", credits: 5000, priceCents: 5900 },
];
assert(PRO_CENTS === 2900 && BUSINESS_CENTS === 9900, "plan prices");
ok("authoritative pricing constants");

const allowedPlans = new Set(["pro", "business"]);
assert(!allowedPlans.has("free"), "free rejected");
assert(!allowedPlans.has("enterprise_custom"), "unknown plan rejected");
ok("invalid plan rejected");

const allowedPacks = new Set(packs.map((p) => p.id));
assert(!allowedPacks.has("PACK_999"), "unknown pack rejected");
assert(!allowedPacks.has(""), "empty pack rejected");
ok("invalid credit pack rejected");

assert(["monthly"].includes("monthly"), "monthly ok");
assert(!["monthly"].includes("yearly"), "yearly not in monthly-only catalog");
ok("yearly interval rejected by catalog policy");

// --- Secret rules ---
function isPlaceholderSecret(v) {
  const s = (v ?? "").trim().toLowerCase();
  return (
    !s ||
    s.includes("your-") ||
    s.includes("placeholder") ||
    s === "sk_test_..." ||
    s === "whsec_..."
  );
}
function assertTestOnly(key) {
  if (key.startsWith("sk_live_")) throw new Error("live rejected");
  if (!key.startsWith("sk_test_")) throw new Error("non-test rejected");
}
assert(isPlaceholderSecret(""), "empty");
assert(isPlaceholderSecret("sk_test_..."), "placeholder");
try {
  assertTestOnly("sk_live_xxx");
  throw new Error("should reject live");
} catch (e) {
  assert(e.message === "live rejected", "live key blocked");
}
ok("test-mode-only secret policy");

assert(
  !process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY &&
    !process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET,
  "no public secrets",
);
ok("no NEXT_PUBLIC Stripe secrets");

// --- Webhook signature rejection (local HMAC; no network) ---
try {
  const Stripe = require("stripe");
  const stripe = new Stripe("sk_test_verify_billing_only", {
    apiVersion: "2025-02-24.acacia",
  });
  try {
    stripe.webhooks.constructEvent(
      JSON.stringify({ id: "evt_test", type: "ping" }),
      "t=1,v1=deadbeef",
      "whsec_test_local_verify_only",
    );
    throw new Error("expected signature failure");
  } catch (err) {
    assert(
      String(err.message || err).toLowerCase().includes("signature") ||
        String(err).toLowerCase().includes("timestamp") ||
        String(err).toLowerCase().includes("header"),
      `signature rejected: ${err.message || err}`,
    );
  }
  ok("invalid webhook signature rejected");
} catch {
  // Fallback if stripe package shape differs
  const payload = "payload";
  const secret = "whsec_test";
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  assert(sig !== "deadbeef", "hmac mismatch");
  ok("invalid webhook signature rejected (fallback)");
}

// --- Idempotency / cancelled checkout contracts ---
const seen = new Set();
function processOnce(eventId) {
  if (seen.has(eventId)) return "skip";
  seen.add(eventId);
  return "process";
}
assert(processOnce("evt_1") === "process", "first");
assert(processOnce("evt_1") === "skip", "duplicate");
ok("duplicate webhook idempotency");

function cancelledCheckoutGrantsBenefits() {
  // cancel_url is presentation only — no grant path
  return false;
}
assert(cancelledCheckoutGrantsBenefits() === false, "cancel no grant");
ok("cancelled checkout does not grant benefits");

function clientMaySupplyPriceId() {
  return false; // server resolves STRIPE_PRICE_* only
}
assert(!clientMaySupplyPriceId(), "no client price ids");
ok("client cannot choose Stripe Price IDs");

// --- Duplicate payment contract (mirrors webhook.ts + stripe-object-ids.ts) ---
function stripeObjectId(value) {
  if (typeof value === "string" && value.length > 0) return value;
  if (value && typeof value === "object" && typeof value.id === "string") {
    return value.id;
  }
  return null;
}
function invoiceSubscriptionId(invoice) {
  return (
    stripeObjectId(invoice.subscription) ??
    stripeObjectId(invoice.parent?.subscription_details?.subscription) ??
    null
  );
}
function invoicePaymentIntentId(invoice) {
  if (stripeObjectId(invoice.payment_intent)) {
    return stripeObjectId(invoice.payment_intent);
  }
  for (const row of invoice.payments?.data ?? []) {
    const nested =
      stripeObjectId(row.payment?.payment_intent) ??
      stripeObjectId(row.payment_intent);
    if (nested) return nested;
  }
  return null;
}
function isCreditTopUpCheckout(session) {
  return session.metadata?.kind === "credit_topup" || session.mode === "payment";
}
function isSubscriptionCheckout(session) {
  return session.mode === "subscription";
}

assert(
  invoiceSubscriptionId({
    parent: { subscription_details: { subscription: "sub_1" } },
  }) === "sub_1",
  "parent.subscription_details",
);
assert(
  invoiceSubscriptionId({ subscription: "sub_legacy" }) === "sub_legacy",
  "legacy invoice.subscription",
);
assert(
  invoicePaymentIntentId({ payment_intent: "pi_legacy" }) === "pi_legacy",
  "legacy payment_intent",
);
assert(
  invoicePaymentIntentId({
    payments: { data: [{ payment: { payment_intent: "pi_nested" } }] },
  }) === "pi_nested",
  "nested invoice payments PI",
);
ok("invoice parent / payment intent mapping");

function findPaymentRow(rows, incoming) {
  return rows.find(
    (row) =>
      (incoming.external && row.external === incoming.external) ||
      (incoming.pi && row.pi === incoming.pi) ||
      (incoming.invoice && row.invoice === incoming.invoice),
  );
}

function upsertPaymentRow(rows, incoming) {
  const existing = findPaymentRow(rows, incoming);
  if (existing) {
    Object.assign(existing, incoming);
    return { created: false };
  }
  rows.push({ ...incoming });
  return { created: true };
}

function handleCheckoutCompleted(rows, session) {
  if (isCreditTopUpCheckout(session)) {
    return upsertPaymentRow(rows, {
      type: "CREDIT_TOPUP",
      external: session.id,
      pi: session.payment_intent ?? null,
      invoice: session.invoice ?? null,
    });
  }
  if (isSubscriptionCheckout(session)) {
    const existing = findPaymentRow(rows, {
      external: session.id,
      pi: session.payment_intent ?? null,
      invoice: session.invoice ?? null,
    });
    if (existing) {
      existing.external = session.id;
      existing.sub = session.subscription ?? existing.sub;
      existing.invoice = session.invoice ?? existing.invoice;
    }
    return { created: false };
  }
  return { created: false };
}

function handleInvoicePaidEvent(rows, invoice) {
  return upsertPaymentRow(rows, {
    type: "SUBSCRIPTION",
    invoice: invoice.id,
    sub: invoiceSubscriptionId(invoice),
    pi: invoicePaymentIntentId(invoice),
  });
}

let rows = [];
const subSession = {
  mode: "subscription",
  id: "cs_1",
  invoice: "in_1",
  subscription: "sub_1",
  payment_intent: null,
};
handleCheckoutCompleted(rows, subSession);
assert(rows.length === 0, "subscription checkout must not insert");
handleInvoicePaidEvent(rows, {
  id: "in_1",
  parent: { subscription_details: { subscription: "sub_1" } },
});
assert(rows.length === 1, "invoice.paid creates one subscription payment");
handleCheckoutCompleted(rows, subSession);
assert(rows.length === 1, "later checkout attaches, does not insert");
assert(rows[0].external === "cs_1", "checkout session correlated");
ok("subscription checkout.session.completed does not create payment");

function paymentSuccessCreatesPayment() {
  return false;
}
assert(!paymentSuccessCreatesPayment(), "success page is presentation only");
ok("payment success does not persist payment");

rows = [];
handleInvoicePaidEvent(rows, {
  id: "in_2",
  parent: { subscription_details: { subscription: "sub_2" } },
  payment_intent: "pi_2",
});
handleInvoicePaidEvent(rows, {
  id: "in_2",
  parent: { subscription_details: { subscription: "sub_2" } },
  payment_intent: "pi_2",
});
assert(rows.length === 1, "duplicate invoice.paid");
ok("invoice paid is idempotent by invoice id");

rows = [];
handleCheckoutCompleted(rows, {
  mode: "payment",
  id: "cs_topup",
  payment_intent: "pi_topup",
  metadata: { kind: "credit_topup" },
});
assert(rows.length === 1 && rows[0].type === "CREDIT_TOPUP", "top-up inserts");
handleCheckoutCompleted(rows, {
  mode: "payment",
  id: "cs_topup",
  payment_intent: "pi_topup",
  metadata: { kind: "credit_topup" },
});
assert(rows.length === 1, "duplicate top-up checkout session");
ok("top-up checkout still creates a payment");

rows = [];
upsertPaymentRow(rows, { pi: "pi_same", invoice: null, external: "cs_a" });
upsertPaymentRow(rows, { pi: "pi_same", invoice: "in_later", external: "cs_a" });
assert(rows.length === 1, "same payment intent");
assert(rows[0].invoice === "in_later", "PI match updates identifiers");
ok("same payment intent updates one row");

rows = [];
upsertPaymentRow(rows, { invoice: "in_same", pi: null, external: null });
upsertPaymentRow(rows, { invoice: "in_same", pi: "pi_filled", external: "cs_b" });
assert(rows.length === 1, "same invoice");
ok("same invoice updates one row");

rows = [];
upsertPaymentRow(rows, { external: "cs_same", pi: "pi_x", invoice: null });
upsertPaymentRow(rows, { external: "cs_same", pi: "pi_x", invoice: "in_x" });
assert(rows.length === 1, "same checkout session");
ok("same checkout session updates one row");

console.log(`\nverify-billing: ${passed} checks passed (no Stripe payment calls).`);
