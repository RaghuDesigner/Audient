import "server-only";

/**
 * In-memory sliding-window rate limiter (per process).
 * Suitable as MVP hardening on serverless — not a distributed limiter.
 */

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
};

type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();

export function checkRateLimit(input: {
  key: string;
  limit: number;
  windowMs: number;
}): RateLimitResult {
  const now = Date.now();
  const windowStart = now - input.windowMs;
  let bucket = buckets.get(input.key);
  if (!bucket) {
    bucket = { timestamps: [] };
    buckets.set(input.key, bucket);
  }
  bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart);

  if (bucket.timestamps.length >= input.limit) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterSec = Math.max(
      1,
      Math.ceil((oldest + input.windowMs - now) / 1000),
    );
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  bucket.timestamps.push(now);
  return {
    allowed: true,
    remaining: Math.max(0, input.limit - bucket.timestamps.length),
    retryAfterSec: 0,
  };
}

/** Prevent unbounded Map growth in long-lived processes. */
export function pruneRateLimitBuckets(maxKeys = 5_000): void {
  if (buckets.size <= maxKeys) return;
  const keys = [...buckets.keys()].slice(0, buckets.size - maxKeys);
  for (const key of keys) buckets.delete(key);
}

export class RateLimitError extends Error {
  readonly code = "RATE_LIMITED";
  readonly status = 429;
  readonly retryAfterSec: number;

  constructor(retryAfterSec: number, message = "Too many requests. Try again shortly.") {
    super(message);
    this.name = "RateLimitError";
    this.retryAfterSec = retryAfterSec;
  }
}
