import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";

import { AuthRequiredError } from "@/lib/auth/session";
import { loadAccountSnapshot } from "@/services/account";
import type { AccountSnapshot } from "@/types/account";
import {
  buildAuthorizationContext,
  type AuthorizationContext,
  type PlatformRole,
} from "@/services/authorization/types";

export class AccountMissingError extends Error {
  readonly status = 404;
  readonly code = "ACCOUNT_MISSING";

  constructor(message = "Account not provisioned") {
    super(message);
    this.name = "AccountMissingError";
  }
}

export class AuthorizationError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(message: string, code: string, status = 403) {
    super(message);
    this.name = "AuthorizationError";
    this.code = code;
    this.status = status;
  }
}

/**
 * Authenticated account + authorization context.
 * Identity always from verified session user — never from client body/URL.
 */
export async function requireAuthorizationContext(
  supabase: SupabaseClient,
  authUser: User,
): Promise<{
  account: AccountSnapshot;
  authz: AuthorizationContext;
}> {
  const account = await loadAccountSnapshot(supabase, authUser);
  if (!account) {
    throw new AccountMissingError();
  }

  const platformRole = await loadPlatformRole(supabase, account.appUserId);
  return {
    account,
    authz: buildAuthorizationContext(account, platformRole),
  };
}

export async function requireAuthenticatedUser(
  supabase: SupabaseClient,
): Promise<User> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw new AuthRequiredError();
  }
  return user;
}

async function loadPlatformRole(
  supabase: SupabaseClient,
  appUserId: string,
): Promise<PlatformRole> {
  const { data } = await supabase
    .from("users")
    .select("role")
    .eq("id", appUserId)
    .is("deleted_at", null)
    .maybeSingle();

  const role = (data as { role?: string } | null)?.role;
  return role === "ADMIN" ? "ADMIN" : "USER";
}

/**
 * Reject client attempts to forge identity / workspace / role on mutations.
 */
export function assertNoClientIdentityForge(body: unknown): void {
  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    return;
  }
  const record = body as Record<string, unknown>;
  const forbidden = [
    "userId",
    "user_id",
    "appUserId",
    "accountId",
    "account_id",
    "role",
    "platformRole",
    "accountRole",
    "permissions",
    "membershipStatus",
    "memberRole",
  ] as const;

  for (const key of forbidden) {
    if (key in record && record[key] !== undefined) {
      throw new AuthorizationError(
        "Client-supplied identity or role fields are not allowed",
        "IDENTITY_FORGE_REJECTED",
        400,
      );
    }
  }
}

/** Resource must belong to the authenticated account. */
export function assertAccountOwnsResource(
  accountAppUserId: string,
  resourceOwnerId: string | null | undefined,
  code = "FORBIDDEN",
): void {
  if (!resourceOwnerId || resourceOwnerId !== accountAppUserId) {
    throw new AuthorizationError("Not authorized for this resource", code, 403);
  }
}
