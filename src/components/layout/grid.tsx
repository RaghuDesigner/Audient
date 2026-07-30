import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { spacingClassName, type SpacingToken } from "@/components/layout/spacing";
import { cn } from "@/utils/cn";

const gridVariants = cva("grid w-full", {
  variants: {
    columns: {
      1: "grid-cols-1",
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
      6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
      12: "grid-cols-4 sm:grid-cols-6 lg:grid-cols-12",
    },
  },
  defaultVariants: {
    columns: 1,
  },
});

export interface GridProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {
  gap?: SpacingToken;
  /** Finer control — CSS grid template (advanced). */
  as?: React.ElementType;
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    { className, columns = 1, gap = "md", as: Comp = "div", ...props },
    ref,
  ) => (
    <Comp
      ref={ref}
      className={cn(
        gridVariants({ columns }),
        spacingClassName[gap],
        className,
      )}
      {...props}
    />
  ),
);
Grid.displayName = "Grid";

export { Grid, gridVariants };
