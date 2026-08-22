import "server-only";

import { NextResponse } from "next/server";

import { AuthRequiredError } from "@/lib/auth/session";
import { RateLimitError } from "@/lib/rate-limit";
import { AuditPermissionError } from "@/services/audit-permissions";
import { CreditMutationError } from "@/services/credits/mutate";
import { AuthorizationError } from "@/services/authorization";
import { SupabaseEnvError } from "@/lib/supabase/env";
import { logError } from "@/lib/log";

export function auditErrorResponse(error: unknown): NextResponse {
  if (error instanceof AuthRequiredError) {
    return NextResponse.json({ error: error.message, code: "UNAUTHORIZED" }, { status: 401 });
  }
  if (error instanceof RateLimitError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      {
        status: 429,
        headers: { "Retry-After": String(error.retryAfterSec) },
      },
    );
  }
  if (error instanceof AuthorizationError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status },
    );
  }
  if (error instanceof AuditPermissionError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status },
    );
  }
  if (error instanceof CreditMutationError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status },
    );
  }
  if (error instanceof SupabaseEnvError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: 503 },
    );
  }
  logError("api.audits_error", {
    detail:
      error instanceof Error
        ? error.message.replace(/sk-[a-zA-Z0-9._-]+/g, "[redacted]").slice(0, 200)
        : "unknown",
  });
  return NextResponse.json(
    { error: "Unable to process audit request", code: "INTERNAL_ERROR" },
    { status: 500 },
  );
}
