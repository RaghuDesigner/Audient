/**
 * Audit Completed transition — SCREEN-004 (before SCREEN-M02 Results).
 * Phase-1 mock config only; no backend.
 */

/** Dwell before auto-navigate to Results (spec: 2–3 seconds). */
export const COMPLETION_DWELL_MS = 3_000;

/** Sample overall UX score for Phase-1 mock preview (0–100). */
export const MOCK_COMPLETION_SCORE = 78;

export const COMPLETION_COPY = {
  heading: "Audit complete",
  status: "Completed",
  subheading: "Your UX analysis is ready to view.",
} as const;

export type AuditCompletionViewModel = {
  auditId: string;
  /** Overall UX score 0–100. */
  score: number;
  /** Guest/Free: PDF gated; Pro/Business: allowed when ready. */
  pdfAllowed: boolean;
  pdfStatus: "ready" | "preparing" | "gated";
};

/**
 * Phase-1 mock completion payload for the success interstitial.
 */
export function createMockAuditCompletion(options: {
  auditId: string;
  score?: number;
  /** Default false for guest Home flow. */
  pdfAllowed?: boolean;
}): AuditCompletionViewModel {
  const pdfAllowed = options.pdfAllowed ?? false;
  return {
    auditId: options.auditId,
    score: options.score ?? MOCK_COMPLETION_SCORE,
    pdfAllowed,
    pdfStatus: pdfAllowed ? "ready" : "gated",
  };
}

export function formatScoreAnnouncement(score: number): string {
  return `Audit complete. UX score ${score} out of 100.`;
}

export function formatScoreLabel(score: number): string {
  return `${score} / 100`;
}
