/**
 * Safe post-auth redirect helpers.
 * Prevents open redirects when consuming `?next=` from middleware or OAuth.
 */

const DEFAULT_NEXT = "/";

/**
 * Returns a same-origin relative path, or the default if the candidate is
 * absolute, protocol-relative, or otherwise unsafe.
 */
export function sanitizeAuthRedirect(
  candidate: string | null | undefined,
  fallback: string = DEFAULT_NEXT,
): string {
  if (!candidate) {
    return fallback;
  }

  const trimmed = candidate.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  // Reject scheme-smuggling (e.g. "/\\evil.com", "/http://…")
  if (trimmed.includes("://") || trimmed.includes("\\")) {
    return fallback;
  }

  return trimmed;
}

/** Build `/sign-in?next=…` for middleware / route guards. */
export function buildSignInUrl(
  signInPath: string,
  nextPath: string,
): string {
  const safeNext = sanitizeAuthRedirect(nextPath);
  const params = new URLSearchParams();
  if (safeNext !== DEFAULT_NEXT) {
    params.set("next", safeNext);
  }
  const query = params.toString();
  return query ? `${signInPath}?${query}` : signInPath;
}
