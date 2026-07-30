import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/cn";

/**
 * Audient Circular Loader — ring progress (determinate or indeterminate).
 */
const circularSizeVariants = cva("relative inline-flex shrink-0", {
  variants: {
    size: {
      sm: "size-8",
      md: "size-11",
      lg: "size-16",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const RADIUS = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export interface CircularLoaderProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof circularSizeVariants> {
  /** 0–100; omit for indeterminate spin. */
  value?: number;
  label?: string;
  showValue?: boolean;
}

function CircularLoader({
  className,
  size = "md",
  value,
  label = "Loading",
  showValue = false,
  ...props
}: CircularLoaderProps) {
  const isDeterminate = typeof value === "number";
  const percent = isDeterminate
    ? Math.round(Math.min(100, Math.max(0, value)))
    : undefined;
  const offset =
    percent == null ? CIRCUMFERENCE * 0.25 : CIRCUMFERENCE * (1 - percent / 100);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={isDeterminate ? 0 : undefined}
      aria-valuemax={isDeterminate ? 100 : undefined}
      aria-valuenow={isDeterminate ? percent : undefined}
      aria-valuetext={
        isDeterminate ? `${percent} percent` : label
      }
      className={cn(circularSizeVariants({ size }), className)}
      {...props}
    >
      <svg
        viewBox="0 0 40 40"
        className={cn(
          "size-full -rotate-90 text-primary",
          !isDeterminate &&
            "animate-spin motion-reduce:animate-none motion-reduce:opacity-60",
        )}
        aria-hidden="true"
      >
        <circle
          cx="20"
          cy="20"
          r={RADIUS}
          fill="none"
          strokeWidth="4"
          className="stroke-muted"
        />
        <circle
          cx="20"
          cy="20"
          r={RADIUS}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          className="stroke-current transition-[stroke-dashoffset] duration-slow ease-in-out-smooth motion-reduce:transition-none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      {showValue && percent != null ? (
        <span className="absolute inset-0 flex items-center justify-center text-info font-semibold text-foreground">
          {percent}%
        </span>
      ) : null}
      <span className="sr-only">
        {isDeterminate ? `${label}: ${percent}%` : label}
      </span>
    </div>
  );
}

CircularLoader.displayName = "CircularLoader";

export { CircularLoader, circularSizeVariants };
