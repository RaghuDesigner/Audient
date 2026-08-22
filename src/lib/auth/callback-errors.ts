/**
 * Opaque auth callback / sign-in error codes → user-facing copy.
 * Never surface raw Postgres or provider secret material.
 */

import type { LoginModalError } from "@/types/auth";

export const AUTH_CALLBACK_ERROR = {
  cancelled: "oauth_cancelled",
  failed: "oauth_failed",
  missingCode: "missing_code",
  exchangeFailed: "session_exchange_failed",
  syncFailed: "sync_failed",
  invalidSession: "invalid_session",
} as const;

export type AuthCallbackErrorCode =
  (typeof AUTH_CALLBACK_ERROR)[keyof typeof AUTH_CALLBACK_ERROR];

const MESSAGES: Record<AuthCallbackErrorCode, string> = {
  oauth_cancelled: "Sign-in was cancelled. You can try again when ready.",
  oauth_failed: "Sign-in failed. Please try again.",
  missing_code: "Sign-in could not be completed. Please try again.",
  session_exchange_failed:
    "We could not complete sign-in. Please try again.",
  sync_failed:
    "Your account could not be set up. Please try again in a moment.",
  invalid_session: "Your session is invalid. Please sign in again.",
};

export function mapAuthCallbackErrorParam(
  raw: string | null | undefined,
): LoginModalError | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();

  if (
    lower.includes("access_denied") ||
    lower.includes("cancel") ||
    trimmed === AUTH_CALLBACK_ERROR.cancelled
  ) {
    return {
      code: "ERR-AUTH-004",
      message: MESSAGES.oauth_cancelled,
      provider: "google",
    };
  }

  const known = Object.values(AUTH_CALLBACK_ERROR).find((code) => code === trimmed);
  if (known) {
    return {
      code: "ERR-AUTH-001",
      message: MESSAGES[known],
      provider: "google",
    };
  }

  // Legacy / provider descriptions — keep generic
  return {
    code: "ERR-AUTH-001",
    message: MESSAGES.oauth_failed,
    provider: "google",
  };
}

export function authCallbackErrorMessage(
  code: AuthCallbackErrorCode,
): string {
  return MESSAGES[code];
}
