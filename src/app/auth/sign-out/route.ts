import { NextResponse, type NextRequest } from "next/server";

import { AUTH_ROUTES, MOCK_AUTH_COOKIE } from "@/config/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { readSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * Sign out — clears Supabase session cookies (when configured) and mock cookie.
 * POST only — GET must not log the user out (cross-site GET logout).
 */
async function signOutAndRedirect(request: NextRequest) {
  const env = readSupabasePublicEnv();
  if (env.ok) {
    try {
      const supabase = await createSupabaseServerClient();
      await supabase.auth.signOut();
    } catch (error) {
      console.error("[auth/sign-out] Supabase signOut failed", error);
    }
  }

  const publicOrigin =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    new URL(request.url).origin;

  const response = NextResponse.redirect(
    new URL(AUTH_ROUTES.afterLogout, publicOrigin),
    { status: 303 },
  );

  response.cookies.set(MOCK_AUTH_COOKIE.name, "", {
    path: "/",
    maxAge: 0,
  });

  return response;
}

export async function POST(request: NextRequest) {
  return signOutAndRedirect(request);
}
