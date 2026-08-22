/**
 * BACKEND-012 production readiness contracts — read-only, no provider calls.
 * Usage: npm run verify:production-readiness
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

let passed = 0;
function ok(name) {
  passed += 1;
  console.log(`PASS: ${name}`);
}

function read(path) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

// --- Required modules ---
const required = [
  "src/lib/config/runtime.ts",
  "src/lib/log.ts",
  "src/lib/rate-limit.ts",
  "src/lib/supabase/health.ts",
  "src/app/api/health/route.ts",
  "src/instrumentation.ts",
  "scripts/deploy-health-gate.mjs",
  "src/lib/stripe/env.ts",
  "src/lib/stripe/prices.ts",
  "src/lib/ai/client.ts",
  "src/lib/ai/env.ts",
  "src/services/audit/stuck.ts",
  "docs/backend/BACKEND-012_PRODUCTION_READINESS.md",
  "docs/backend/BACKEND-012A_PRODUCTION_BLOCKER_CLOSURE.md",
];
for (const p of required) {
  assert(existsSync(p), `missing ${p}`);
}
ok("production readiness artifacts present");

// --- Mock auth production safety (BACKEND-012 P0) ---
const auth = read("src/config/auth.ts");
assert(
  auth.includes('process.env.NODE_ENV === "production"') &&
    auth.includes("? false"),
  "USE_MOCK_AUTH must be false in production builds",
);
assert(
  auth.includes('process.env.NODE_ENV === "production") return false'),
  "real OAuth dev path disabled in production",
);
ok("mock auth disabled in production builds");

// --- Runtime config guards ---
const runtime = read("src/lib/config/runtime.ts");
assert(runtime.includes("MOCK_AUTH_IN_PRODUCTION"), "mock auth prod guard");
assert(runtime.includes("SUPABASE_SERVICE_ROLE_KEY"), "service role required");
assert(runtime.includes("OPENAI_API_KEY"), "openai required in prod");
assert(runtime.includes("STRIPE_WEBHOOK_SECRET"), "webhook secret required");
assert(runtime.includes("ALLOW_STRIPE_LIVE"), "stripe live gate");
assert(runtime.includes("APP_URL_LOCALHOST"), "prod localhost app url guard");
assert(runtime.includes("STRIPE_PRICE_IDS"), "stripe price ids required in prod");
assert(runtime.includes("STRIPE_PUBLISHABLE_KEY"), "publishable key required in prod");
assert(runtime.includes("assertProductionSafeOrThrow"), "boot fail-closed export");
ok("production runtime validation covers critical env");

// --- BACKEND-012A boot fail-closed + health gate ---
const instrumentation = read("src/instrumentation.ts");
assert(
  instrumentation.includes("assertProductionSafeOrThrow"),
  "instrumentation calls production assert",
);
assert(
  instrumentation.includes('process.env.NODE_ENV !== "production"'),
  "instrumentation skips non-production",
);
const healthGate = read("scripts/deploy-health-gate.mjs");
assert(healthGate.includes("body.ready === true"), "health gate checks ready");
assert(healthGate.includes("mockAuth === false"), "health gate checks mockAuth");
ok("boot fail-closed and deploy health gate wired");

// --- Secrets not in client bundle patterns ---
const envExample = read(".env.example");
const badPublicSecrets = envExample
  .split("\n")
  .filter((line) => /^[^#]*NEXT_PUBLIC_(STRIPE_SECRET|OPENAI|STRIPE_WEBHOOK)/.test(line));
assert(badPublicSecrets.length === 0, "env example must not assign secrets with NEXT_PUBLIC_");
const stripeEnv = read("src/lib/stripe/env.ts");
assert(
  stripeEnv.includes("Never use NEXT_PUBLIC_") ||
    stripeEnv.includes("never NEXT_PUBLIC"),
  "stripe secrets server-only documented",
);
ok("secret exposure guards documented in code");

// --- Stripe architecture ---
assert(stripeEnv.includes("assertStripeKeyMode"), "stripe key mode");
assert(stripeEnv.includes("sk_live_"), "live key handling");
assert(read("src/lib/stripe/prices.ts").includes("missingStripePriceEnvVars"), "price env validation helper");
assert(read("src/app/api/webhooks/stripe/route.ts").includes("stripe-signature"), "webhook signature header");
ok("stripe production architecture intact");

// --- OpenAI production controls ---
const ai = read("src/lib/ai/client.ts");
assert(ai.includes("AI_REQUEST_TIMEOUT_MS = 60_000"), "60s timeout");
assert(ai.includes("AI_PROVIDER_MAX_ATTEMPTS = 3"), "bounded retries");
assert(ai.includes("AI_MAX_OUTPUT_TOKENS"), "output token cap");
assert(ai.includes("AI_MAX_IMAGE_DATA_URL_CHARS"), "image size cap");
assert(read("src/services/audit/ai-processor.ts").includes("fetchAuditForUser"), "audit ownership before AI");
ok("openai cost and reliability controls present");

// --- Logging safety ---
const log = read("src/lib/log.ts");
assert(log.includes("[redacted]"), "log redaction");
assert(log.includes("secret") || log.includes("token"), "sensitive field names redacted");
ok("structured logging redacts secrets");

// --- Health readiness ---
const health = read("src/lib/supabase/health.ts");
assert(health.includes("ready"), "readiness flag");
assert(health.includes("configIssues"), "safe config issue codes");
assert(!health.includes("OPENAI_API_KEY") || health.includes("openaiConfigured"), "no raw key in health");
ok("health endpoint supports launch gate");

// --- Rate limits ---
const limits = [
  ["src/app/api/audits/route.ts", "audit:create"],
  ["src/app/api/audits/[auditId]/retry/route.ts", "audit:retry"],
  ["src/app/api/billing/checkout/route.ts", "checkout"],
  ["src/app/api/workspaces/[workspaceId]/invitations/route.ts", "invite"],
];
for (const [file, keyFragment] of limits) {
  const src = read(file);
  assert(src.includes("checkRateLimit"), `${file} rate limited`);
  assert(src.includes(keyFragment) || src.includes("RateLimitError"), `${file} limit key/error`);
}
ok("rate limits on sensitive endpoints");

// --- Migrations present ---
const migrations = readdirSync("supabase/migrations").filter((f) => f.endsWith(".sql"));
assert(migrations.length >= 20, "migration set present");
assert(
  migrations.some((f) => f.includes("rls")),
  "RLS migration present",
);
assert(
  migrations.some((f) => f.includes("credit_deduction_unique")),
  "credit idempotency migration present",
);
ok("database migrations catalog present");

// --- RLS not weakened ---
const rls = read("supabase/migrations/20260730100009_rls_policies.sql");
assert(rls.includes("ENABLE ROW LEVEL SECURITY"), "RLS enabled");
assert(rls.includes("service_role"), "service role documented");
ok("RLS foundation migration intact");

console.log(`\nverify-production-readiness: ${passed} checks passed (no deploy, no live Stripe).`);
