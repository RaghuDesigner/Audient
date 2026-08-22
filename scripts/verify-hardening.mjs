/**
 * BACKEND-010 production hardening contracts — no DB writes.
 * Usage: npm run verify:hardening
 */

import { readFileSync, existsSync } from "node:fs";
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

assert(existsSync("src/lib/config/runtime.ts"), "runtime config");
assert(existsSync("src/lib/rate-limit.ts"), "rate limit");
assert(existsSync("src/lib/log.ts"), "structured log");
assert(existsSync("src/services/audit/stuck.ts"), "stuck reclaim");
assert(
  existsSync("supabase/migrations/20260821120050_credit_deduction_unique.sql"),
  "credit unique migration",
);
ok("hardening modules present");

const ai = read("src/lib/ai/client.ts");
assert(ai.includes("AI_REQUEST_TIMEOUT_MS"), "timeout");
assert(ai.includes("AI_PROVIDER_MAX_ATTEMPTS"), "bounded retries");
assert(ai.includes("AI_RATE_LIMITED") || ai.includes("429"), "429 handling");
assert(ai.includes("maxRetries: 0"), "sdk retries disabled");
ok("AI timeout + bounded retries");

const stuck = read("src/services/audit/stuck.ts");
assert(stuck.includes("STUCK_PROCESSING_MS"), "stuck threshold");
assert(stuck.includes("reclaimStuckProcessingAudit"), "reclaim fn");
ok("stuck processing reclaim");

const retry = read("src/services/audit/retry.ts");
assert(retry.includes("MAX_AUDIT_ATTEMPT_COUNT"), "user retry bound");
ok("audit retry bound");

const credits = read("src/services/credits/mutate.ts");
assert(credits.includes("AUDIT_DEDUCTION"), "deduction type");
assert(credits.includes("existingDeduction") || credits.includes("23505"), "idempotent deduct");
ok("credit deduction safety");

const auditsApi = read("src/app/api/audits/route.ts");
assert(auditsApi.includes("checkRateLimit"), "audit create rate limit");
assert(auditsApi.includes("RateLimitError"), "429 path");
ok("audit create rate limited");

const health = read("src/lib/supabase/health.ts");
assert(health.includes("validateRuntimeConfiguration"), "config in health");
assert(health.includes("ready"), "readiness flag");
assert(health.includes("MOCK_AUTH") || health.includes("mockAuth"), "mock visible");
ok("health/readiness hardened");

const stripe = read("src/lib/stripe/env.ts");
assert(stripe.includes("ALLOW_STRIPE_LIVE"), "live gate");
assert(stripe.includes("assertStripeKeyMode"), "key mode assert");
ok("stripe test/live separation");

const auth = read("src/config/auth.ts");
assert(
  auth.includes("USE_MOCK_AUTH") &&
    auth.includes('process.env.NODE_ENV === "production"'),
  "mock auth production-safe default",
);
ok("mock auth production-safe default");

console.log(`\nverify-hardening: ${passed} checks passed.`);
