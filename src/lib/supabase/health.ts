import "server-only";

import { createClient } from "@supabase/supabase-js";

import { USE_MOCK_AUTH } from "@/config/auth";
import {
  isProductionRuntime,
  validateRuntimeConfiguration,
} from "@/lib/config/runtime";
import { hasOpenAiApiKey } from "@/lib/ai/env";
import { isStripeConfigured } from "@/lib/stripe/env";
import { readSupabasePublicEnv } from "@/lib/supabase/env";

export type SupabaseConnectivity = {
  configured: boolean;
  reachable: boolean | null;
  urlHost: string | null;
  error: string | null;
};

export type HealthCheckResult = {
  status: "ok" | "degraded" | "unhealthy";
  time: string;
  mockAuth: boolean;
  production: boolean;
  ready: boolean;
  supabase: SupabaseConnectivity;
  /** Non-secret dependency flags only. */
  dependencies: {
    openaiConfigured: boolean;
    stripeConfigured: boolean;
  };
  /** Safe config issue codes (no secret values). */
  configIssues: string[];
};

/**
 * Safe connectivity probe — does not create tables or mutate data.
 * Uses Auth health endpoint with the public anon key.
 */
export async function checkSupabaseConnectivity(
  timeoutMs = 5_000,
): Promise<SupabaseConnectivity> {
  const envResult = readSupabasePublicEnv();
  if (!envResult.ok) {
    return {
      configured: false,
      reachable: null,
      urlHost: null,
      error: envResult.message,
    };
  }

  const { url, anonKey } = envResult.env;
  let urlHost: string | null = null;
  try {
    urlHost = new URL(url).host;
  } catch {
    urlHost = null;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${url}/auth/v1/health`, {
      method: "GET",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timer);

    if (!response.ok) {
      return {
        configured: true,
        reachable: false,
        urlHost,
        error: `Auth health returned HTTP ${response.status}`,
      };
    }

    createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    return {
      configured: true,
      reachable: true,
      urlHost,
      error: null,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.cause &&
          typeof error.cause === "object" &&
          "code" in error.cause
          ? `${error.message} (${String(error.cause.code)})`
          : error.message
        : "Unknown connectivity error";
    return {
      configured: true,
      reachable: false,
      urlHost,
      error: message,
    };
  }
}

export async function getHealthCheckResult(): Promise<HealthCheckResult> {
  const supabase = await checkSupabaseConnectivity();
  const mockAuth = USE_MOCK_AUTH;
  const production = isProductionRuntime();
  const configIssues = validateRuntimeConfiguration();
  const errorCodes = configIssues
    .filter((i) => i.severity === "error")
    .map((i) => i.code);

  const openaiConfigured = hasOpenAiApiKey();
  const stripeConfigured = isStripeConfigured();

  // Production readiness: no mock auth, Supabase reachable, no config errors.
  const ready =
    errorCodes.length === 0 &&
    (!production || (supabase.reachable === true && !mockAuth));

  let status: HealthCheckResult["status"];
  if (production) {
    status = ready ? "ok" : "unhealthy";
  } else if (supabase.reachable === true || mockAuth) {
    status = errorCodes.length > 0 ? "degraded" : "ok";
  } else {
    status = "degraded";
  }

  return {
    status,
    time: new Date().toISOString(),
    mockAuth,
    production,
    ready,
    supabase,
    dependencies: {
      openaiConfigured,
      stripeConfigured,
    },
    configIssues: errorCodes,
  };
}
