/**
 * Audit processing route — SCREEN-M01 mock config.
 * Phase-1 only; no backend polling.
 */

/** Mock dwell before success navigation or failure UI (ms). */
export const AUDIT_PROCESSING_MOCK_DELAY_MS = 2_000;

/**
 * `mockFail` prop for ProcessingScreen.
 * `false` = happy path; `true` = generic failure; string = taxonomy code.
 */
export type AuditProcessingMockFail = false | true | string;

/**
 * Parse `?fail=` from `/audit/[auditId]`.
 * Absent param → success. Explicit values → failure (QA / dashboard / retry).
 */
export function resolveAuditProcessingMockFail(
  failParam?: string,
): AuditProcessingMockFail {
  if (failParam === undefined) return false;

  const normalized = failParam.trim();
  if (!normalized) return false;
  if (normalized === "false" || normalized === "0") return false;
  if (normalized === "true" || normalized === "1") return true;
  return normalized;
}
