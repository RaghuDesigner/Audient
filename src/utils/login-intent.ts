import type { LoginIntent } from "@/types/auth";
import { LOGIN_INTENT_STORAGE_KEY } from "@/config/auth";
import { sanitizeAuthRedirect } from "@/utils/auth-redirect";

/**
 * Persist resume intent across full-page OAuth redirects (LOGIN_SCREEN §33.6).
 * Cleared after successful resume. Never store tokens here.
 */

export function saveLoginIntent(intent: LoginIntent): void {
  if (typeof window === "undefined") return;
  try {
    const safe: LoginIntent = {
      type: intent.type,
      payload: intent.payload
        ? sanitizeAuthRedirect(intent.payload)
        : undefined,
    };
    window.sessionStorage.setItem(
      LOGIN_INTENT_STORAGE_KEY,
      JSON.stringify(safe),
    );
  } catch {
    // sessionStorage may be unavailable (private mode / quota).
  }
}

export function readLoginIntent(): LoginIntent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(LOGIN_INTENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LoginIntent;
    if (!parsed || typeof parsed.type !== "string") return null;
    return {
      type: parsed.type,
      payload: parsed.payload
        ? sanitizeAuthRedirect(parsed.payload)
        : undefined,
    };
  } catch {
    return null;
  }
}

export function clearLoginIntent(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(LOGIN_INTENT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Resolve post-login path from intent + optional `next` query. */
export function resolveLoginDestination(
  intent: LoginIntent | null,
  fallbackNext?: string | null,
): string {
  if (intent?.payload) {
    return sanitizeAuthRedirect(intent.payload);
  }
  if (intent?.type === "subscribe") {
    return sanitizeAuthRedirect("/billing");
  }
  if (intent?.type === "deep_link" || intent?.type === "session_resume") {
    return sanitizeAuthRedirect(fallbackNext ?? "/");
  }
  return sanitizeAuthRedirect(fallbackNext ?? "/");
}
