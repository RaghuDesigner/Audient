"use client";

import {
  clampScore,
  gradeFromScore,
  SCORE_BAND_BADGE,
  scoreBandFromScore,
  type LetterGrade,
} from "@/utils/score-grade";
import { cn } from "@/utils/cn";

export type GradeBadgeProps = {
  /** Explicit grade; if omitted, derived from `score`. */
  grade?: LetterGrade | null;
  score?: number | null;
  className?: string;
  size?: "default" | "compact";
};

/**
 * Reusable letter-grade badge (COMPONENT-008).
 * Always paired with numeric score elsewhere — not color-only meaning.
 */
export function GradeBadge({
  grade,
  score,
  className,
  size = "default",
}: GradeBadgeProps) {
  const resolved =
    grade ??
    (score != null ? gradeFromScore(clampScore(score)) : null);

  if (!resolved) return null;

  const band =
    score != null
      ? scoreBandFromScore(score)
      : scoreBandFromScore(gradeMidpoint(resolved));

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md font-semibold",
        size === "compact"
          ? "min-h-7 px-sm text-info"
          : "min-h-9 px-md text-body-sm",
        SCORE_BAND_BADGE[band],
        className,
      )}
    >
      Grade {resolved}
    </span>
  );
}

function gradeMidpoint(grade: LetterGrade): number {
  switch (grade) {
    case "A+":
      return 98;
    case "A":
      return 93;
    case "B":
      return 84;
    case "C":
      return 74;
    case "D":
      return 64;
    case "F":
      return 40;
  }
}
