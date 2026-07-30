import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/cn";

/**
 * Audient Skeleton — `components/ui/skeleton`
 * Decorative placeholders (`aria-hidden`). Pair with one polite “Loading…”
 * live region on the parent (ACCESSIBILITY.md).
 */
const skeletonVariants = cva("bg-muted", {
  variants: {
    variant: {
      text: "h-4 w-full rounded-md",
      rect: "h-24 w-full rounded-md",
      circle: "size-11 shrink-0 rounded-full",
    },
    animation: {
      pulse: "animate-pulse motion-reduce:animate-none motion-reduce:opacity-60",
      shimmer: [
        "bg-[length:200%_100%]",
        "bg-[linear-gradient(110deg,rgb(var(--muted))_35%,rgb(var(--surface))_50%,rgb(var(--muted))_65%)]",
        "animate-shimmer motion-reduce:animate-none motion-reduce:opacity-60",
      ].join(" "),
      none: "",
    },
  },
  defaultVariants: {
    variant: "rect",
    animation: "pulse",
  },
});

export interface SkeletonProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  /** Repeat the block N times (stacked with gap). */
  count?: number;
}

function Skeleton({
  className,
  variant,
  animation,
  count = 1,
  style,
  ...props
}: SkeletonProps) {
  const items = Math.max(1, count);

  if (items === 1) {
    return (
      <div
        className={cn(skeletonVariants({ variant, animation }), className)}
        style={style}
        aria-hidden="true"
        {...props}
      />
    );
  }

  return (
    <div className="flex w-full flex-col gap-sm" aria-hidden="true">
      {Array.from({ length: items }, (_, index) => (
        <div
          key={index}
          className={cn(skeletonVariants({ variant, animation }), className)}
          style={style}
          {...props}
        />
      ))}
    </div>
  );
}

Skeleton.displayName = "Skeleton";

/**
 * Shimmer block — Skeleton with gradient sweep (same a11y rules).
 */
function Shimmer({
  className,
  variant = "rect",
  ...props
}: Omit<SkeletonProps, "animation">) {
  return (
    <Skeleton
      variant={variant}
      animation="shimmer"
      className={className}
      {...props}
    />
  );
}

Shimmer.displayName = "Shimmer";

/** Parent wrapper: one polite status for a group of decorative skeletons. */
function LoadingStatus({
  label = "Loading",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(className)}
      {...props}
    >
      {children}
      <span className="sr-only">{label}</span>
    </div>
  );
}

LoadingStatus.displayName = "LoadingStatus";

export { Skeleton, Shimmer, LoadingStatus, skeletonVariants };
