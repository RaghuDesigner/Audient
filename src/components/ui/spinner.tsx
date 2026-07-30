import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/utils/cn";

/**
 * Audient Spinner — compact activity indicator.
 * Pair with visible text or `label` for screen readers (not animation-only).
 */
const spinnerVariants = cva(
  "animate-spin text-primary motion-reduce:animate-none",
  {
    variants: {
      size: {
        sm: "size-4",
        md: "size-5",
        lg: "size-8",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface SpinnerProps
  extends
    Omit<React.SVGAttributes<SVGSVGElement>, "children">,
    VariantProps<typeof spinnerVariants> {
  /** Accessible name — required when no adjacent visible loading text. */
  label?: string;
}

function Spinner({
  className,
  size,
  label = "Loading",
  ...props
}: SpinnerProps) {
  return (
    <Loader2
      role="status"
      aria-label={label}
      className={cn(spinnerVariants({ size }), className)}
      {...props}
    />
  );
}

Spinner.displayName = "Spinner";

export { Spinner, spinnerVariants };
