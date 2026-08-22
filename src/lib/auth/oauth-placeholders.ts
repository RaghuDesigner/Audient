import type { SsoProvider } from "@/config/auth";
import type { LoginModalError } from "@/types/auth";

/**
 * Placeholder OAuth adapters for MDL-001 (LOGIN_MODAL.md).
 * Simulate network latency and outcomes — no Supabase Auth calls yet.
 * Swap these for real `signInWithOAuth` when backend auth is wired.
 */

export type OAuthPlaceholderResult =
  | { ok: true; provider: SsoProvider }
  | { ok: false; error: LoginModalError };

export type OAuthPlaceholderOptions = {
  /** Artificial delay in ms (default 900). */
  delayMs?: number;
  /**
   * Force a failure for UI demos.
   * Omit for success path.
   */
  failWith?: LoginModalError["code"];
};

const DEFAULT_DELAY_MS = 900;

const FAIL_MESSAGES: Partial<Record<LoginModalError["code"], string>> = {
  "ERR-AUTH-001": "Google sign-in failed. Please try again.",
  "ERR-AUTH-002": "Apple sign-in failed. Please try again.",
  "ERR-AUTH-003": "Microsoft sign-in failed. Please try again.",
  "ERR-AUTH-004": "Sign-in was cancelled. You can try again when ready.",
  POPUP_BLOCKED: "Pop-up blocked. Allow pop-ups or try again.",
  OFFLINE: "You’re offline. Reconnect to sign in.",
  RATE_LIMITED: "Too many attempts. Please wait and try again.",
  UNKNOWN: "Something went wrong. Try again.",
};

async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/**
 * Simulated OAuth for a single provider.
 * Resolves with `{ ok: true }` on success, or a typed modal error.
 */
export async function placeholderSignInWithOAuth(
  provider: SsoProvider,
  options: OAuthPlaceholderOptions = {},
): Promise<OAuthPlaceholderResult> {
  const delayMs = options.delayMs ?? DEFAULT_DELAY_MS;
  await wait(delayMs);

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return {
      ok: false,
      error: {
        code: "OFFLINE",
        message: FAIL_MESSAGES.OFFLINE!,
        provider,
      },
    };
  }

  if (options.failWith) {
    return {
      ok: false,
      error: {
        code: options.failWith,
        message:
          FAIL_MESSAGES[options.failWith] ??
          FAIL_MESSAGES.UNKNOWN!,
        provider,
      },
    };
  }

  return { ok: true, provider };
}

/** Convenience stubs — same behaviour as `placeholderSignInWithOAuth`. */
export function signInWithGoogle(
  options?: OAuthPlaceholderOptions,
): Promise<OAuthPlaceholderResult> {
  return placeholderSignInWithOAuth("google", options);
}

export function signInWithApple(
  options?: OAuthPlaceholderOptions,
): Promise<OAuthPlaceholderResult> {
  return placeholderSignInWithOAuth("apple", options);
}

export function signInWithMicrosoft(
  options?: OAuthPlaceholderOptions,
): Promise<OAuthPlaceholderResult> {
  return placeholderSignInWithOAuth("microsoft", options);
}
