import type { AuthMethod, LoginModalError } from "@/types/auth";

/**
 * Map Supabase Auth / network failures to typed login errors (ERR-AUTH-*).
 */
export function mapAuthError(
  error: unknown,
  provider?: AuthMethod,
): LoginModalError {
  if (!error) {
    return {
      code: "UNKNOWN",
      message: "Something went wrong. Please try again.",
      provider,
    };
  }

  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Something went wrong. Please try again.";

  const lower = message.toLowerCase();

  if (
    lower.includes("cancel") ||
    lower.includes("denied") ||
    lower.includes("access_denied")
  ) {
    return {
      code: "ERR-AUTH-004",
      message: "Sign-in was cancelled. You can try again when ready.",
      provider,
    };
  }

  if (lower.includes("popup") || lower.includes("blocked")) {
    return {
      code: "POPUP_BLOCKED",
      message: "Pop-up blocked. Allow pop-ups or try again.",
      provider,
    };
  }

  if (lower.includes("rate") || lower.includes("too many") || lower.includes("429")) {
    return {
      code: "RATE_LIMITED",
      message: "Too many attempts. Please wait and try again.",
      provider,
    };
  }

  if (lower.includes("network") || lower.includes("fetch") || lower.includes("offline")) {
    return {
      code: "OFFLINE",
      message: "You’re offline. Reconnect to sign in.",
      provider,
    };
  }

  if (provider === "google") {
    return {
      code: "ERR-AUTH-001",
      message: "Google sign-in failed. Please try again.",
      provider,
    };
  }

  if (provider === "apple") {
    return {
      code: "ERR-AUTH-002",
      message: "Apple sign-in failed. Please try again.",
      provider,
    };
  }

  if (provider === "microsoft") {
    return {
      code: "ERR-AUTH-003",
      message: "Microsoft sign-in failed. Please try again.",
      provider,
    };
  }

  return {
    code: "ERR-AUTH-001",
    message: message || "Sign-in failed. Please try again.",
    provider,
  };
}
