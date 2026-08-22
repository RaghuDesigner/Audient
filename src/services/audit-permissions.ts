import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";

import {
  accountAllowsUrlAudit,
  accountHasCredits,
  loadAccountSnapshot,
} from "@/services/account";

export class AuditPermissionError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(code: string, message: string, status = 403) {
    super(message);
    this.name = "AuditPermissionError";
    this.code = code;
    this.status = status;
  }
}

/**
 * Server-side URL audit gate — uses DB membership/plan, never client tier.
 */
export async function assertUrlAuditAllowed(
  supabase: SupabaseClient,
  authUser: User,
): Promise<void> {
  const account = await loadAccountSnapshot(supabase, authUser);
  if (!account) {
    throw new AuditPermissionError(
      "ACCOUNT_MISSING",
      "Account is not ready.",
      404,
    );
  }
  if (!accountAllowsUrlAudit(account)) {
    throw new AuditPermissionError(
      "URL_AUDIT_FORBIDDEN",
      "URL audits require Pro or Business.",
      403,
    );
  }
}

/**
 * Server-side credit gate for a planned charge (no mutation).
 */
export async function assertCreditsAvailable(
  supabase: SupabaseClient,
  authUser: User,
  cost: number,
): Promise<void> {
  const account = await loadAccountSnapshot(supabase, authUser);
  if (!account) {
    throw new AuditPermissionError(
      "ACCOUNT_MISSING",
      "Account is not ready.",
      404,
    );
  }
  if (!accountHasCredits(account, cost)) {
    throw new AuditPermissionError(
      "INSUFFICIENT_CREDITS",
      "Not enough credits for this audit.",
      402,
    );
  }
}
