/**
 * Audit Processing stages — SCREEN-002 / SCREEN-M01.
 * On-screen labels are authoritative; order is forward-only.
 */

export const PROCESSING_STAGES = [
  "Upload complete",
  "Validating image",
  "Website detection",
  "Accessibility analysis",
  "UX heuristic evaluation",
  "Visual Design evaluation",
  "Performance analysis",
  "SEO analysis",
  "AI recommendation generation",
  "Preparing PDF",
  "Finalizing Report",
] as const;

export type ProcessingStageLabel = (typeof PROCESSING_STAGES)[number];

export type ProcessingStageIndex = number;

/** Target mock duration for screenshot audits (~90s product expectation). */
export const MOCK_SCREENSHOT_DURATION_MS = 12_000;

/** Target mock duration for URL audits (shortened for UI demos). */
export const MOCK_URL_DURATION_MS = 20_000;

/** Tips shown while waiting (supplementary — not the only status channel). */
export const PROCESSING_TIPS = [
  "Good contrast helps every user read content comfortably.",
  "Clear primary actions reduce hesitation and drop-off.",
  "Accessible labels make forms usable with assistive tech.",
  "Consistent spacing creates visual hierarchy and calm.",
  "Meaningful alt text turns images into usable content.",
  "Fast first paint builds trust before users explore.",
] as const;

/**
 * Map a 0–100 percentage to a stage index (never used to go backwards —
 * callers must clamp with `Math.max(previous, next)`).
 */
export function stageIndexForProgress(progress: number): ProcessingStageIndex {
  const clamped = Math.min(100, Math.max(0, progress));
  if (clamped >= 100) return PROCESSING_STAGES.length - 1;
  const index = Math.floor(
    (clamped / 100) * (PROCESSING_STAGES.length - 1),
  );
  return Math.min(index, PROCESSING_STAGES.length - 1);
}

export function formatEstimatedSeconds(seconds: number): string {
  const safe = Math.max(0, Math.ceil(seconds));
  if (safe <= 1) return "About 1 second left";
  if (safe < 60) return `About ${safe} seconds left`;
  const minutes = Math.ceil(safe / 60);
  if (minutes === 1) return "About 1 minute left";
  return `About ${minutes} minutes left`;
}
