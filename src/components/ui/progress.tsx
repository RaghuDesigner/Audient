import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/cn";

/**
 * Audient Progress — determinate progress bar (`role="progressbar"`).
 * Use for known % (uploads, audit stages). Tokens only.
 */
const progressTrackVariants = cva(
  "relative w-full overflow-hidden rounded-full bg-muted",
  {
    variants: {
      size: {
        sm: "h-1.5",
        md: "h-2.5",
        lg: "h-3.5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface ProgressProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressTrackVariants> {
  /** 0–100 */
  value: number;
  max?: number;
  label?: string;
  /** Optional visible percentage (not color-only). */
  showValue?: boolean;
  /** Token fill override (e.g. `bg-warning` / `bg-error`). */
  indicatorClassName?: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function Progress({
  className,
  value,
  max = 100,
  size,
  label = "Progress",
  showValue = false,
  indicatorClassName,
  ...props
}: ProgressProps) {
  const safeMax = max > 0 ? max : 100;
  const safeValue = clamp(value, 0, safeMax);
  const percent = Math.round((safeValue / safeMax) * 100);

  return (
    <div className={cn("flex w-full flex-col gap-sm", className)} {...props}>
      {showValue ? (
        <div className="flex items-center justify-between gap-sm text-info text-muted-foreground sm:text-body-sm">
          <span>{label}</span>
          <span className="tabular-nums text-foreground">{percent}%</span>
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={safeValue}
        aria-valuetext={`${percent} percent`}
        className={cn(progressTrackVariants({ size }))}
      >
        <div
          className={cn(
            "h-full rounded-full bg-primary transition-[width] duration-slow ease-in-out-smooth motion-reduce:transition-none",
            indicatorClassName,
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

Progress.displayName = "Progress";

/**
 * Linear Loader — indeterminate bar (unknown duration).
 */
export interface LinearLoaderProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressTrackVariants> {
  label?: string;
}

function LinearLoader({
  className,
  size,
  label = "Loading",
  ...props
}: LinearLoaderProps) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuetext={label}
      className={cn(progressTrackVariants({ size }), className)}
      {...props}
    >
      <div
        className={cn(
          "absolute inset-y-0 w-1/3 rounded-full bg-primary",
          "animate-progress-indeterminate motion-reduce:animate-none",
          "motion-reduce:left-0 motion-reduce:w-full motion-reduce:opacity-60",
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

LinearLoader.displayName = "LinearLoader";

export { Progress, LinearLoader, progressTrackVariants };
