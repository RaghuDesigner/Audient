import "server-only";

/**
 * Safe structured server logging — never logs secrets.
 */

const SECRET_PATTERNS = [
  /sk-[a-zA-Z0-9._-]{10,}/g,
  /sk_live_[a-zA-Z0-9]+/gi,
  /sk_test_[a-zA-Z0-9]+/gi,
  /whsec_[a-zA-Z0-9]+/gi,
  /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, // JWT-like
  /Bearer\s+[a-zA-Z0-9._-]+/gi,
];

export type LogFields = Record<
  string,
  string | number | boolean | null | undefined
>;

function redact(value: string): string {
  let out = value;
  for (const pattern of SECRET_PATTERNS) {
    out = out.replace(pattern, "[redacted]");
  }
  return out;
}

function sanitizeFields(fields?: LogFields): Record<string, unknown> {
  if (!fields) return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    const lower = key.toLowerCase();
    if (
      lower.includes("secret") ||
      lower.includes("password") ||
      lower.includes("apikey") ||
      lower.includes("api_key") ||
      lower.includes("token") ||
      lower.includes("authorization")
    ) {
      out[key] = "[redacted]";
      continue;
    }
    if (typeof value === "string") {
      out[key] = redact(value).slice(0, 500);
    } else {
      out[key] = value;
    }
  }
  return out;
}

export function logInfo(event: string, fields?: LogFields): void {
  console.info(
    JSON.stringify({
      level: "info",
      event,
      ts: new Date().toISOString(),
      ...sanitizeFields(fields),
    }),
  );
}

export function logWarn(event: string, fields?: LogFields): void {
  console.warn(
    JSON.stringify({
      level: "warn",
      event,
      ts: new Date().toISOString(),
      ...sanitizeFields(fields),
    }),
  );
}

export function logError(event: string, fields?: LogFields): void {
  console.error(
    JSON.stringify({
      level: "error",
      event,
      ts: new Date().toISOString(),
      ...sanitizeFields(fields),
    }),
  );
}
