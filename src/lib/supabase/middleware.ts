import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  AUTH_ROUTES,
  GUEST_COOKIE,
  MOCK_AUTH_COOKIE,
  USE_MOCK_AUTH,
  isAuthOnlyPath,
  isProtectedPath,
  isRealOAuthDevPathEnabled,
  isSupabaseAuthClientEnabled,
} from "@/config/auth";
import { readSupabasePublicEnv } from "@/lib/supabase/env";
import { buildSignInUrl, sanitizeAuthRedirect } from "@/utils/auth-redirect";

/**
 * Session + route guard middleware.
 *
 * - Mock-only: mock cookie guards; no Supabase.
 * - Hybrid (`USE_MOCK_AUTH` + real OAuth dev path): mock cookie OR Supabase session.
 * - Real auth: Supabase session only.
 */
export async function updateSession(request: NextRequest) {
  if (USE_MOCK_AUTH && !isRealOAuthDevPathEnabled()) {
    return handleMockAuthSession(request);
  }

  if (isSupabaseAuthClientEnabled()) {
    return handleSupabaseAuthSession(request, {
      alsoAcceptMockCookie: USE_MOCK_AUTH && isRealOAuthDevPathEnabled(),
    });
  }

  return handleMockAuthSession(request);
}

function handleMockAuthSession(request: NextRequest): NextResponse {
  const response = NextResponse.next({ request });
  ensureGuestCookie(request, response);

  const { pathname, search } = request.nextUrl;
  const hasMockAuth =
    request.cookies.get(MOCK_AUTH_COOKIE.name)?.value ===
    MOCK_AUTH_COOKIE.value;

  if (!hasMockAuth && isProtectedPath(pathname)) {
    const next = sanitizeAuthRedirect(`${pathname}${search}`);
    const signInPath = buildSignInUrl(AUTH_ROUTES.signIn, next);
    return redirectWithCookies(new URL(signInPath, request.url), response);
  }

  if (hasMockAuth && isAuthOnlyPath(pathname)) {
    return redirectWithCookies(
      new URL(AUTH_ROUTES.afterLogin, request.url),
      response,
    );
  }

  return response;
}

async function handleSupabaseAuthSession(
  request: NextRequest,
  options: { alsoAcceptMockCookie: boolean },
): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request });

  const envResult = readSupabasePublicEnv();
  if (!envResult.ok) {
    if (options.alsoAcceptMockCookie) {
      // Controlled path without valid public env — fall back to mock guards.
      return handleMockAuthSession(request);
    }
    console.error(`[supabase/middleware] ${envResult.message}`);
    return new NextResponse(
      `Supabase is not configured.\n\n${envResult.message}\n`,
      { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }

  const { url, anonKey } = envResult.env;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options: cookieOptions }) => {
          supabaseResponse.cookies.set(name, value, cookieOptions);
        });
      },
    },
  });

  // Do not run code between createServerClient and getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  ensureGuestCookie(request, supabaseResponse);

  const hasMockAuth =
    options.alsoAcceptMockCookie &&
    request.cookies.get(MOCK_AUTH_COOKIE.name)?.value ===
      MOCK_AUTH_COOKIE.value;

  const isAuthenticated = Boolean(user) || hasMockAuth;
  const { pathname, search } = request.nextUrl;

  if (!isAuthenticated && isProtectedPath(pathname)) {
    const next = sanitizeAuthRedirect(`${pathname}${search}`);
    const signInPath = buildSignInUrl(AUTH_ROUTES.signIn, next);
    return redirectWithCookies(
      new URL(signInPath, request.url),
      supabaseResponse,
    );
  }

  if (isAuthenticated && isAuthOnlyPath(pathname)) {
    return redirectWithCookies(
      new URL(AUTH_ROUTES.afterLogin, request.url),
      supabaseResponse,
    );
  }

  return supabaseResponse;
}

function ensureGuestCookie(
  request: NextRequest,
  response: NextResponse,
): void {
  const existing = request.cookies.get(GUEST_COOKIE.name)?.value;
  if (existing && isValidGuestId(existing)) {
    return;
  }

  const guestId = crypto.randomUUID();
  response.cookies.set(GUEST_COOKIE.name, guestId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GUEST_COOKIE.maxAgeSeconds,
  });
}

function redirectWithCookies(
  url: URL,
  source: NextResponse,
): NextResponse {
  const redirect = NextResponse.redirect(url);
  source.cookies.getAll().forEach(({ name, value, ...options }) => {
    redirect.cookies.set(name, value, options);
  });
  return redirect;
}

function isValidGuestId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
