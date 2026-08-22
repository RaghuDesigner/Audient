"use client";

import * as React from "react";

import {
  clampScore,
  SCORE_BAND_RING,
  SCORE_BAND_TEXT,
  scoreBandFromScore,
} from "@/utils/score-grade";
import { cn } from "@/utils/cn";

export type ScoreRingProps = {
  /** Overall score 0–100. */
  score: number;
  size?: "default" | "compact";
  className?: string;
  /** When true, snap to final value (also honors prefers-reduced-motion). */
  reduceMotion?: boolean;
};

const SIZE = {
  default: { box: "size-32", center: "text-h2", radius: 56, stroke: 8 },
  compact: { box: "size-24", center: "text-body", radius: 40, stroke: 6 },
} as const;

/**
 * Reusable circular score gauge (COMPONENT-008).
 * Decorative when paired with accessible numeric text elsewhere.
 */
export function ScoreRing({
  score,
  size = "default",
  className,
  reduceMotion,
}: ScoreRingProps) {
  const value = clampScore(score);
  const band = scoreBandFromScore(value);
  const { box, center, radius, stroke } = SIZE[size];
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (value / 100) * circumference;

  const [prefersReduced, setPrefersReduced] = React.useState(false);
  const [offset, setOffset] = React.useState(circumference);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPrefersReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  React.useEffect(() => {
    if (reduceMotion || prefersReduced) {
      setOffset(targetOffset);
      return;
    }
    setOffset(circumference);
    const id = window.requestAnimationFrame(() => {
      setOffset(targetOffset);
    });
    return () => window.cancelAnimationFrame(id);
  }, [circumference, prefersReduced, reduceMotion, targetOffset]);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        box,
        className,
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 128 128"
        className="size-full -rotate-90"
        role="presentation"
      >
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth={stroke}
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          className={cn(
            SCORE_BAND_RING[band],
            "transition-[stroke-dashoffset] duration-slow ease-out motion-reduce:transition-none",
          )}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center font-bold tabular-nums",
          center,
          SCORE_BAND_TEXT[band],
        )}
      >
        {value}
      </span>
    </div>
  );
}
