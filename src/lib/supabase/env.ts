/**
 * Supabase public environment helpers.
 * Shared by browser, server, and Edge middleware — no `server-only` import.
 *
 * NEXT_PUBLIC_* values are safe for the browser. Never put the service-role
 * key here.
 */

export class SupabaseEnvError extends Error {
  readonly code = "SUPABASE_ENV" as const;

  constructor(message: string) {
    super(message);
    this.name = "SupabaseEnvError";
  }
}

export type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

/**
 * Project origin only — strip accidental `/rest/v1` (common Dashboard copy mistake).
 */
export function normalizeSupabaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");
  try {
    const url = new URL(trimmed);
    if (url.pathname === "/rest/v1" || url.pathname.startsWith("/rest/v1/")) {
      url.pathname = "";
      url.search = "";
      url.hash = "";
      return url.origin;
    }
    return trimmed.replace(/\/rest\/v1\/?$/i, "");
  } catch {
    return trimmed.replace(/\/rest\/v1\/?$/i, "");
  }
}

function isPlaceholder(value: string): boolean {
  const lower = value.toLowerCase();
  return (
    lower.includes("your-project-ref") ||
    lower.includes("your-anon-key") ||
    lower.includes("your-service-role") ||
    lower === "changeme"
  );
}

/**
 * Non-throwing read — used by health checks and mock-mode guards.
 */
export function readSupabasePublicEnv():
  | { ok: true; env: SupabasePublicEnv }
  | { ok: false; missing: string[]; message: string } {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const missing: string[] = [];

  if (!rawUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (missing.length > 0) {
    return {
      ok: false,
      missing,
      message: `Missing Supabase env: ${missing.join(", ")}. Copy .env.example → .env.local and set Project Settings → API values.`,
    };
  }

  if (isPlaceholder(rawUrl) || isPlaceholder(anonKey)) {
    return {
      ok: false,
      missing: [],
      message:
        "Supabase env still has placeholder values. Replace NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY with your project credentials.",
    };
  }

  let url: string;
  try {
    url = normalizeSupabaseUrl(rawUrl);
    // Validate absolute https URL after normalize
    const parsed = new URL(url);
    if (!parsed.protocol.startsWith("http")) {
      throw new Error("invalid protocol");
    }
  } catch {
    return {
      ok: false,
      missing: [],
      message:
        "NEXT_PUBLIC_SUPABASE_URL is invalid. Use the project origin (https://<ref>.supabase.co), not the /rest/v1 path.",
    };
  }

  return { ok: true, env: { url, anonKey } };
}

/**
 * Throws a clear development error when public Supabase env is missing/invalid.
 * Call only when constructing a real Supabase client (not in mock-auth middleware).
 */
export function requireSupabasePublicEnv(): SupabasePublicEnv {
  const result = readSupabasePublicEnv();
  if (!result.ok) {
    throw new SupabaseEnvError(result.message);
  }
  return result.env;
}

/**
 * Non-throwing check — whether server-only service role is configured.
 * Never returns or logs the secret value.
 */
export function hasSupabaseServiceRoleKey(): boolean {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  return Boolean(key) && !isPlaceholder(key);
}

/**
 * Service-role key — server-only callers. Never import into client components.
 * Required for credit deduct/refund (RLS denies JWT writes to credits/ledger).
 */
export function requireSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  if (!key || isPlaceholder(key)) {
    throw new SupabaseEnvError(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Set it in .env.local (server-only). Never expose this key to the browser. Required for audit credit authorization.",
    );
  }
  return key;
}
