/** Shared text safety helpers for audit AI output (client + server safe). */

const SECRET_PATTERNS = [
  /sk-[a-zA-Z0-9._-]{10,}/g,
  /Bearer\s+[a-zA-Z0-9._-]+/gi,
  /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g,
];

/** Redact common secret/token patterns from persisted audit text. */
export function redactSensitiveText(
  text: string | null | undefined,
  maxLen = 2000,
): string | null {
  if (text == null || text.trim() === "") return null;
  let out = text;
  for (const pattern of SECRET_PATTERNS) {
    out = out.replace(pattern, "[redacted]");
  }
  return out.trim().slice(0, maxLen);
}
