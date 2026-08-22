/**
 * COMPONENT-021 — Search Bar helpers.
 * Debounce and query normalization — no React / no API.
 */

export function normalizeSearchQuery(value: string): string {
  return value.trim();
}

export function shouldEmitSearchQuery(
  query: string,
  minLength = 0,
): boolean {
  if (minLength <= 0) return true;
  return query.length === 0 || query.length >= minLength;
}
