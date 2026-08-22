import "server-only";

import { USE_MOCK_AUTH } from "@/config/auth";
import { hasOpenAiApiKey } from "@/lib/ai/env";
import {
  readStripeSecretKey,
  readStripeWebhookSecret,
  readStripePublishableKey,
  assertStripeKeyMode,
} from "@/lib/stripe/env";
import { missingStripePriceEnvVars } from "@/lib/stripe/prices";
import { readSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * BACKEND-010 — production / test configuration guards.
 * Local development remains usable; production fails closed on unsafe modes.
 */

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

export function isStripeLiveAllowed(): boolean {
  return (
    isProductionRuntime() && process.env.ALLOW_STRIPE_LIVE === "true"
  );
}

function readAppUrl(): string | null {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    null
  );
}

function isLocalhostAppUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host.endsWith(".local")
    );
  } catch {
    return true;
  }
}

export type ConfigValidationIssue = {
  code: string;
  message: string;
  severity: "error" | "warn";
};

/**
 * Validate configuration. In production, mock auth and missing critical env are errors.
 * In development, missing optional providers are warnings only.
 */
export function validateRuntimeConfiguration(): ConfigValidationIssue[] {
  const issues: ConfigValidationIssue[] = [];
  const prod = isProductionRuntime();

  if (prod && USE_MOCK_AUTH) {
    issues.push({
      code: "MOCK_AUTH_IN_PRODUCTION",
      message: "USE_MOCK_AUTH must be false in production.",
      severity: "error",
    });
  }

  const supabase = readSupabasePublicEnv();
  if (!supabase.ok) {
    issues.push({
      code: "SUPABASE_PUBLIC_ENV",
      message: supabase.message,
      severity: prod ? "error" : "warn",
    });
  }

  if (prod && !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    issues.push({
      code: "SUPABASE_SERVICE_ROLE",
      message: "SUPABASE_SERVICE_ROLE_KEY is required in production.",
      severity: "error",
    });
  }

  if (prod && !hasOpenAiApiKey()) {
    issues.push({
      code: "OPENAI_API_KEY",
      message: "OPENAI_API_KEY is required in production.",
      severity: "error",
    });
  }

  const stripeKey = readStripeSecretKey();
  if (prod) {
    if (!stripeKey) {
      issues.push({
        code: "STRIPE_SECRET_KEY",
        message: "STRIPE_SECRET_KEY is required in production.",
        severity: "error",
      });
    } else {
      try {
        assertStripeKeyMode(stripeKey);
      } catch (error) {
        issues.push({
          code: "STRIPE_KEY_MODE",
          message:
            error instanceof Error ? error.message : "Invalid Stripe key mode",
          severity: "error",
        });
      }
    }
    if (!readStripeWebhookSecret()) {
      issues.push({
        code: "STRIPE_WEBHOOK_SECRET",
        message: "STRIPE_WEBHOOK_SECRET is required in production.",
        severity: "error",
      });
    }
    const appUrl = readAppUrl();
    if (!appUrl) {
      issues.push({
        code: "APP_URL",
        message: "NEXT_PUBLIC_APP_URL (or APP_URL) is required in production.",
        severity: "error",
      });
    } else if (isLocalhostAppUrl(appUrl)) {
      issues.push({
        code: "APP_URL_LOCALHOST",
        message:
          "NEXT_PUBLIC_APP_URL must be the public production origin (not localhost).",
        severity: "error",
      });
    }

    if (stripeKey) {
      if (!readStripePublishableKey()) {
        issues.push({
          code: "STRIPE_PUBLISHABLE_KEY",
          message:
            "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required in production when Stripe is enabled.",
          severity: "error",
        });
      }

      const missingPrices = missingStripePriceEnvVars();
      if (missingPrices.length > 0) {
        issues.push({
          code: "STRIPE_PRICE_IDS",
          message: `Missing Stripe Price ID env vars: ${missingPrices.join(", ")}.`,
          severity: "error",
        });
      }
    }
  } else if (stripeKey) {
    try {
      assertStripeKeyMode(stripeKey);
    } catch (error) {
      issues.push({
        code: "STRIPE_KEY_MODE",
        message:
          error instanceof Error ? error.message : "Invalid Stripe key mode",
        severity: "error",
      });
    }
  }

  return issues;
}

export function formatConfigIssueMessage(issue: ConfigValidationIssue): string {
  return `${issue.code}: ${issue.message}`;
}

/**
 * BACKEND-012A — fail closed at server boot in production only.
 * Messages are actionable and never include secret values.
 */
export function assertProductionSafeOrThrow(): void {
  if (!isProductionRuntime()) return;
  const errors = validateRuntimeConfiguration().filter(
    (i) => i.severity === "error",
  );
  if (errors.length > 0) {
    const detail = errors.map(formatConfigIssueMessage).join("; ");
    throw new Error(
      `Production configuration invalid. Fix the following and restart: ${detail}`,
    );
  }
}
