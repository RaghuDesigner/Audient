/**
 * CLI connectivity check for BACKEND-001.
 * Usage: npm run verify:supabase
 *
 * Does not mutate the database. Safe with USE_MOCK_AUTH=true.
 */

import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function normalizeSupabaseUrl(raw) {
  const trimmed = String(raw).trim().replace(/\/+$/, "");
  try {
    const url = new URL(trimmed);
    if (url.pathname === "/rest/v1" || url.pathname.startsWith("/rest/v1/")) {
      return url.origin;
    }
    return trimmed.replace(/\/rest\/v1\/?$/i, "");
  } catch {
    return trimmed.replace(/\/rest\/v1\/?$/i, "");
  }
}

function loadEnvLocal() {
  const envPath = join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

async function main() {
  loadEnvLocal();

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!rawUrl || !anonKey) {
    console.error(
      "FAIL: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
    );
    process.exit(1);
  }

  const url = normalizeSupabaseUrl(rawUrl);
  if (rawUrl !== url) {
    console.log(
      `Note: normalized URL (stripped /rest/v1) → ${new URL(url).origin}`,
    );
  }

  console.log(`Checking Supabase Auth health at ${new URL(url).host} …`);

  createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  console.log("OK: public env present; Supabase JS client initializes.");

  let response;
  try {
    response = await fetch(`${url}/auth/v1/health`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.cause && typeof error.cause === "object" && "code" in error.cause
          ? String(error.cause.code)
          : error.message
        : String(error);
    console.error(
      `FAIL: network probe to Auth health failed (${detail}).\n` +
        "Confirm the project exists in the Supabase Dashboard and that\n" +
        "NEXT_PUBLIC_SUPABASE_URL is the project origin (https://<ref>.supabase.co).",
    );
    process.exit(1);
  }

  if (!response.ok) {
    console.error(`FAIL: Auth health HTTP ${response.status}`);
    process.exit(1);
  }

  console.log("OK: Auth health reachable — Supabase foundation connectivity verified.");
  process.exit(0);
}

main().catch((error) => {
  console.error("FAIL:", error instanceof Error ? error.message : error);
  process.exit(1);
});
