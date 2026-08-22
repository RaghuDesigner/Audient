/**
 * Client-side HTTPS URL validation for Guest Home.
 * Messages come from `upload-errors.ts`.
 */

import type { UrlFailureReason } from "@/utils/upload-errors";

export type UrlValidationResult =
  | { ok: true; href: string }
  | { ok: false; reason: UrlFailureReason };

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\.\d+\.\d+\.\d+$/,
  /^0\.0\.0\.0$/,
  /^10\.\d+\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,
  /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/,
  /^\[::1\]$/,
  /^::1$/,
];

function isPrivateHostname(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "");
  if (PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(host))) {
    return true;
  }
  // .local / .internal / .lan and link-local
  if (/\.(local|internal|lan|home)$/i.test(host)) return true;
  if (/^169\.254\.\d+\.\d+$/.test(host)) return true;
  return false;
}

/**
 * Accepts only public https URLs.
 * Normalizes bare domains (example.com → https://example.com).
 */
export function validateHttpsUrl(raw: string): UrlValidationResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, reason: "empty" };
  }

  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return { ok: false, reason: "invalid" };
  }

  if (parsed.protocol !== "https:") {
    return { ok: false, reason: "invalid" };
  }

  if (!parsed.hostname.includes(".")) {
    // localhost is private; other single-label hosts are invalid
    if (isPrivateHostname(parsed.hostname)) {
      return { ok: false, reason: "private" };
    }
    return { ok: false, reason: "invalid" };
  }

  if (isPrivateHostname(parsed.hostname)) {
    return { ok: false, reason: "private" };
  }

  return { ok: true, href: parsed.href };
}
