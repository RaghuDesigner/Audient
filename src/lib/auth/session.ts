import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapSupabaseUser } from "@/lib/auth/map-user";
import type { AuthSession, AuthUser } from "@/types/auth";

/**
 * Server session helpers — SECURITY.md §1.
 * Always derive identity from a verified JWT (`getUser`), never from
 * client-supplied ids or unverified cookie claims alone.
 */

export { mapSupabaseUser };

/** Current user from verified session cookies, or null if guest/expired. */
export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return mapSupabaseUser(data.user);
}

/**
 * Session snapshot for server consumers that need the access token
 * (e.g. forwarding to workers). Prefer `getAuthUser` when token unused.
 */
export async function getAuthSession(): Promise<AuthSession | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  return {
    user: mapSupabaseUser(user),
    accessToken: session.access_token,
    expiresAt: session.expires_at ?? null,
  };
}

/**
 * Throws if unauthenticated — use in protected Server Components /
 * Route Handlers. Prefer middleware redirects for page navigations.
 */
export async function requireAuthUser(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new AuthRequiredError();
  }
  return user;
}

export class AuthRequiredError extends Error {
  readonly status = 401;

  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthRequiredError";
  }
}
