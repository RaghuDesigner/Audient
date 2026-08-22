/**
 * Overall UX score → letter grade (COMPONENT-008).
 * Single source of truth — do not invent grades in the UI or LLM layer.
 */

export const LETTER_GRADES = ["A+", "A", "B", "C", "D", "F"] as const;

export type LetterGrade = (typeof LETTER_GRADES)[number];

/** Score band for tokenized ring / badge color. */
export type ScoreBand = "excellent" | "good" | "fair" | "poor" | "critical";

/**
 * Map overall score (0–100) to letter grade.
 * 97–100 A+ · 90–96 A · 80–89 B · 70–79 C · 60–69 D · 0–59 F
 */
export function gradeFromScore(score: number): LetterGrade {
  const clamped = Math.min(100, Math.max(0, Math.round(score)));
  if (clamped >= 97) return "A+";
  if (clamped >= 90) return "A";
  if (clamped >= 80) return "B";
  if (clamped >= 70) return "C";
  if (clamped >= 60) return "D";
  return "F";
}

export function scoreBandFromScore(score: number): ScoreBand {
  const clamped = Math.min(100, Math.max(0, Math.round(score)));
  if (clamped >= 90) return "excellent";
  if (clamped >= 80) return "good";
  if (clamped >= 70) return "fair";
  if (clamped >= 60) return "poor";
  return "critical";
}

/** Tailwind token classes for score-band accents (no hardcoded hex). */
export const SCORE_BAND_TEXT: Record<ScoreBand, string> = {
  excellent: "text-success",
  good: "text-success",
  fair: "text-secondary",
  poor: "text-warning",
  critical: "text-error",
};

export const SCORE_BAND_RING: Record<ScoreBand, string> = {
  excellent: "stroke-success",
  good: "stroke-success",
  fair: "stroke-secondary",
  poor: "stroke-warning",
  critical: "stroke-error",
};

export const SCORE_BAND_BADGE: Record<ScoreBand, string> = {
  excellent: "bg-success/15 text-success",
  good: "bg-success/15 text-success",
  fair: "bg-secondary/15 text-secondary",
  poor: "bg-warning/25 text-foreground",
  critical: "bg-error/15 text-error",
};

export function clampScore(score: number): number {
  return Math.min(100, Math.max(0, Math.round(score)));
}
