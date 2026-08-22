/**
 * Auth configuration — SSO providers, routes, guest cookie, middleware paths.
 * LOGIN_SCREEN / BR-AUTH-001: Google, Apple, Microsoft only (no email UI).
 */

/**
 * TEMP — default frontend mock login (no IdP redirect) in local development.
 * Production builds (`NODE_ENV=production`) always disable mock auth (BACKEND-012).
 * Override locally with `USE_MOCK_AUTH=false` in `.env.local` when testing real OAuth.
 */
export const USE_MOCK_AUTH =
  process.env.NODE_ENV === "production"
    ? false
    : process.env.USE_MOCK_AUTH !== "false";

/**
 * Controlled BACKEND-003 path: when `true`, Google SSO uses Supabase OAuth
 * while mock auth remains available for Apple/Microsoft and default UX.
 * Set in `.env.local` — do not flip `USE_MOCK_AUTH` for verification.
 */
export function isRealOAuthDevPathEnabled(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return process.env.NEXT_PUBLIC_REAL_OAUTH_DEV_PATH === "true";
}

/** Browser/server should create a Supabase Auth client. */
export function isSupabaseAuthClientEnabled(): boolean {
  return !USE_MOCK_AUTH || isRealOAuthDevPathEnabled();
}

/** Supabase OAuth provider ids (Microsoft → Azure AD). */
export const OAUTH_PROVIDERS = ["google", "apple", "azure"] as const;

export type AuthOAuthProvider = (typeof OAUTH_PROVIDERS)[number];

/** Product-facing SSO providers (SCREEN-003 order). */
export const SSO_PROVIDERS = ["google", "apple", "microsoft"] as const;

export type SsoProvider = (typeof SSO_PROVIDERS)[number];

/** First production provider for BACKEND-003. */
export const PRIMARY_OAUTH_PROVIDER = "google" as const satisfies SsoProvider;

/**
 * Whether this SSO click stays on the local mock path.
 * Google uses real OAuth when the controlled dev path is enabled.
 */
export function shouldUseMockOAuth(provider: SsoProvider): boolean {
  if (!USE_MOCK_AUTH) return false;
  if (isRealOAuthDevPathEnabled() && provider === "google") return false;
  return true;
}

/** Accessible button labels (BTN-003–005). */
export const SSO_PROVIDER_LABELS: Record<SsoProvider, string> = {
  google: "Login with Google",
  apple: "Login with Apple",
  microsoft: "Login with Microsoft",
};

/** Brand mark assets under `public/brand/`. */
export const SSO_PROVIDER_ICONS: Record<SsoProvider, string> = {
  google: "/brand/Google.svg",
  apple: "/brand/Apple.svg",
  microsoft: "/brand/Microsoft.svg",
};

export function toSupabaseOAuthProvider(
  provider: SsoProvider,
): AuthOAuthProvider {
  if (provider === "microsoft") return "azure";
  return provider;
}

/** @deprecated Prefer `SsoProvider` — kept for email auth helpers elsewhere. */
export type AuthProviderId = SsoProvider | "email";

export const AUTH_ROUTES = {
  /** SSO entry for middleware / deep-link resume. */
  signIn: "/sign-in",
  /** OAuth PKCE exchange. */
  callback: "/auth/callback",
  /** Server sign-out (clears cookies). */
  signOut: "/auth/sign-out",
  /** Mock auth lands on Authenticated Dashboard; real OAuth may resume intent. */
  afterLogin: USE_MOCK_AUTH ? "/dashboard" : "/",
  afterLogout: "/",
} as const;

/** Cookie that identifies an anonymous guest browser for teaser audits. */
export const GUEST_COOKIE = {
  name: "audient_guest_id",
  maxAgeSeconds: 60 * 60 * 24 * 30,
} as const;

/**
 * Client-readable cookie so middleware can allow protected routes
 * while `USE_MOCK_AUTH` is on (sessionStorage alone is not visible to Edge).
 */
export const MOCK_AUTH_COOKIE = {
  name: "audient_mock_auth",
  value: "1",
  maxAgeSeconds: 60 * 60 * 24 * 7,
} as const;

/** sessionStorage key for post-OAuth resume intent (LOGIN_SCREEN §33.6). */
export const LOGIN_INTENT_STORAGE_KEY = "audient_login_intent";

/**
 * Path prefixes that require an authenticated Supabase session.
 * Guests may browse public surfaces; these redirect to sign-in.
 */
export const PROTECTED_PATH_PREFIXES = [
  "/dashboard",
  "/history",
  "/notifications",
  "/billing",
  "/checkout",
  "/payment",
  "/payment-success",
  "/payment-failure",
  "/invoice-history",
  "/settings",
  "/profile",
  "/account",
  "/workspace",
  // `/help` and `/legal` stay public (guest + auth).
  // `/audit/[id]` stays public for guest screenshot teaser → Processing (M01).
] as const;

export const AUTH_ONLY_PATH_PREFIXES = [AUTH_ROUTES.signIn] as const;

/** Show “Taking longer…” after this many ms of provider redirect wait. */
export const OAUTH_SLOW_THRESHOLD_MS = 8_000;

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isAuthOnlyPath(pathname: string): boolean {
  return AUTH_ONLY_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
