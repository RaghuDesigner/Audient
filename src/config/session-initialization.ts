/**
 * Session Initialization (SCREEN-008) — mocked bootstrap config.
 * Phase 1: paced steps only. Phase 2: bind to Supabase + GET /me.
 */

export const SESSION_INIT_HEADLINE = "Preparing your workspace...";

export const SESSION_INIT_SUBTITLE =
  "We're securely loading your account and latest audit data.";

export const SESSION_INIT_ERROR_HEADING = "We couldn’t load your account";

export const SESSION_INIT_ERROR_BODY =
  "Something went wrong while preparing your workspace. You can retry or return home.";

/** Forward-only progress copy (SCREEN-008 §4). */
export const SESSION_INIT_STEPS = [
  "Authentication successful",
  "Creating secure session",
  "Loading user profile",
  "Loading membership",
  "Loading available credits",
  "Loading recent audits",
  "Preparing dashboard",
  "Redirecting",
] as const;

export type SessionInitStepIndex = number;

/** Mock delay per step (ms) — QA pacing only; not used in production APIs. */
export const SESSION_INIT_STEP_DELAY_MS = 650;

/**
 * Bound total wait before Failure (SCREEN-008 developer notes).
 * Slightly above 8 × step delay so the happy path can finish.
 */
export const SESSION_INIT_TIMEOUT_MS = 12_000;

/** Authenticated Dashboard destination after successful hydrate. */
export const SESSION_INIT_SUCCESS_PATH = "/dashboard";

/** Public Landing (Guest Home) on Back to Home. */
export const SESSION_INIT_HOME_PATH = "/";

/**
 * Simulate bootstrap failure when the URL includes this search param
 * (e.g. `/session?fail=1`). No backend involved.
 */
export const SESSION_INIT_FAIL_PARAM = "fail";
