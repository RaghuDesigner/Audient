import { NextResponse, type NextRequest } from "next/server";

import { AUTH_ROUTES } from "@/config/auth";
import {
  AUTH_CALLBACK_ERROR,
} from "@/lib/auth/callback-errors";
import { verifyAppUserProvisioned } from "@/lib/auth/ensure-app-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sanitizeAuthRedirect } from "@/utils/auth-redirect";

/**
 * OAuth PKCE callback (Google first for BACKEND-003).
 * 1. Exchange code → session cookies
 * 2. Validate session
 * 3. Verify app user sync (FREE membership + credits via DB trigger)
 * 4. Redirect to sanitized `next`
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = sanitizeAuthRedirect(
    searchParams.get("next"),
    AUTH_ROUTES.afterLogin,
  );
  const oauthError = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (oauthError || errorDescription) {
    const cancelled =
      oauthError === "access_denied" ||
      (errorDescription ?? "").toLowerCase().includes("cancel");
    return redirectSignIn(
      origin,
      cancelled
        ? AUTH_CALLBACK_ERROR.cancelled
        : AUTH_CALLBACK_ERROR.failed,
    );
  }

  if (!code) {
    return redirectSignIn(origin, AUTH_CALLBACK_ERROR.missingCode);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error(
        "[auth/callback] exchangeCodeForSession failed:",
        exchangeError.message,
      );
      return redirectSignIn(origin, AUTH_CALLBACK_ERROR.exchangeFailed);
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return redirectSignIn(origin, AUTH_CALLBACK_ERROR.invalidSession);
    }

    const provision = await verifyAppUserProvisioned(supabase, user.id);
    if (!provision.ok) {
      console.error(
        "[auth/callback] app user provision incomplete for auth user",
        user.id,
      );
      // Session exists but app rows missing — sign out to avoid half-auth state.
      await supabase.auth.signOut();
      return redirectSignIn(origin, AUTH_CALLBACK_ERROR.syncFailed);
    }

    // Membership must stay FREE unless server billing changes it later.
    if (provision.membershipTier && provision.membershipTier !== "FREE") {
      // Existing returning users may already be PRO/ENTERPRISE — allow.
    }
    const publicOrigin =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    origin;
  
  return NextResponse.redirect(new URL(next, publicOrigin));
  } catch (error) {
    console.error("[auth/callback] unexpected failure", error);
    return redirectSignIn(origin, AUTH_CALLBACK_ERROR.failed);
  }
}

function redirectSignIn(origin: string, errorCode: string): NextResponse {
  const signIn = new URL(AUTH_ROUTES.signIn, origin);
  signIn.searchParams.set("error", errorCode);
  return NextResponse.redirect(signIn);
}
