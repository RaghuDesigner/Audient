import * as React from "react";

import { sizeClassName, type SpacingToken } from "@/components/layout/spacing";
import { cn } from "@/utils/cn";

/**
 * Spacer — empty space using spacing tokens, or flex grow.
 * Decorative; hidden from the accessibility tree.
 */
export interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Fixed token size (ignored when `grow`). */
  size?: Exclude<SpacingToken, "none">;
  /** Axis for fixed size (default both via `size-*`). */
  axis?: "x" | "y" | "both";
  /** Flex-grow spacer inside Stack/Row. */
  grow?: boolean;
}

const Spacer = React.forwardRef<HTMLDivElement, SpacerProps>(
  (
    { className, size = "md", axis = "both", grow = false, ...props },
    ref,
  ) => {
    if (grow) {
      return (
        <div
          ref={ref}
          className={cn("min-h-0 min-w-0 flex-1", className)}
          aria-hidden="true"
          {...props}
        />
      );
    }

    const fixed =
      axis === "x"
        ? cn(size === "sm" && "w-sm", size === "md" && "w-md", size === "lg" && "w-lg", "h-0")
        : axis === "y"
          ? cn(size === "sm" && "h-sm", size === "md" && "h-md", size === "lg" && "h-lg", "w-0")
          : sizeClassName[size];

    return (
      <div
        ref={ref}
        className={cn("shrink-0", fixed, className)}
        aria-hidden="true"
        {...props}
      />
    );
  },
);
Spacer.displayName = "Spacer";

export { Spacer };
