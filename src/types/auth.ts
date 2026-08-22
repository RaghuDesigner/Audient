/**
 * Auth / session types — SCREEN-003, SECURITY.md §1, TECHNICAL_ARCHITECTURE §7.
 * No provider SDK types here; UI and hooks stay decoupled from supabase-js.
 */

/** Product-facing OAuth providers (Microsoft maps to Supabase `azure`). */
export type OAuthProvider = "google" | "apple" | "microsoft";

/** All sign-in methods supported by the app. */
export type AuthMethod = OAuthProvider | "email";

/** Why the login modal / sign-in page opened (`login_modal_opened.source`). */
export type LoginModalSource =
  | "guest_menu"
  | "url_gate"
  | "screenshot_gate"
  | "subscribe_gate"
  | "session_expired"
  | "route_guard"
  | "unauthorized_api"
  | "marketing_cta"
  | "sign_in_page"
  | "unknown";

/** Structured resume intent after successful auth (LOGIN_SCREEN §30). */
export type LoginIntentType =
  | "home"
  | "url_audit"
  | "screenshot_audit"
  | "subscribe"
  | "deep_link"
  | "session_resume"
  | "none";

export type LoginIntent = {
  type: LoginIntentType;
  /** Internal path — validated against allow-list before redirect. */
  payload?: string;
};

/** Modal / form UI phase. */
export type LoginModalPhase =
  | "idle"
  | "provider_loading"
  | "email_loading"
  | "hydrating"
  | "success"
  | "error";

export type LoginModalErrorCode =
  | "ERR-AUTH-001"
  | "ERR-AUTH-002"
  | "ERR-AUTH-003"
  | "ERR-AUTH-004"
  | "ERR-AUTH-005"
  | "ERR-AUTH-006"
  | "ERR-AUTH-007"
  | "ERR-AUTH-008"
  | "ERR-AUTH-010"
  | "OFFLINE"
  | "RATE_LIMITED"
  | "POPUP_BLOCKED"
  | "INVALID_CREDENTIALS"
  | "EMAIL_NOT_CONFIRMED"
  | "UNKNOWN";

export type LoginModalError = {
  code: LoginModalErrorCode;
  message: string;
  provider?: AuthMethod;
};

/** Email form mode on the sign-in surface. */
export type EmailAuthMode = "sign_in" | "sign_up";

/**
 * Authenticated identity derived from a verified Supabase JWT.
 * `id` is `auth.users.id` (auth_provider_id in app `users`); never trust
 * a client-supplied user id.
 */
/** Membership tier for feature gates (URL audits, PDF). */
export type AuthPlanTier = "FREE" | "PRO" | "ENTERPRISE";

export type AuthUser = {
  id: string;
  email: string | null;
  emailVerified: boolean;
  fullName: string | null;
  avatarUrl: string | null;
  /**
   * From user_metadata when present. Defaults to FREE until billing API
   * hydrates tier from `memberships` (DB remains source of truth).
   */
  planTier: AuthPlanTier;
};

/** Client-visible session snapshot (no refresh token). */
export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  expiresAt: number | null;
};

/** Guest = no Supabase session; may hold a durable anonymous id cookie. */
export type AuthState =
  | { status: "loading"; user: null; guestId: string | null }
  | { status: "authenticated"; user: AuthUser; guestId: string | null }
  | { status: "guest"; user: null; guestId: string | null };
