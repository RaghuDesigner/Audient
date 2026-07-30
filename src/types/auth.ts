/**
 * Auth / login modal types — SCREEN-003 / MDL-001 (LOGIN_SCREEN.md).
 * No provider SDK types here; placeholders until Supabase OAuth is wired.
 */

/** Supported SSO providers (BR-AUTH-001). */
export type OAuthProvider = "google" | "apple" | "microsoft";

/** Why the login modal opened (`login_modal_opened.source`). */
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

/** Structured resume intent after successful SSO (LOGIN_SCREEN §30). */
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
  /** Internal path or URL string — validated against allow-list at wire-up. */
  payload?: string;
};

/** Modal UI phase (AUTH-STATE-* subset for the dialog). */
export type LoginModalPhase =
  | "idle"
  | "provider_loading"
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
  | "UNKNOWN";

export type LoginModalError = {
  code: LoginModalErrorCode;
  message: string;
  provider?: OAuthProvider;
};
