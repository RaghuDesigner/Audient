import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { spacingClassName, type SpacingToken } from "@/components/layout/spacing";
import { cn } from "@/utils/cn";

const stackVariants = cva("flex", {
  variants: {
    direction: {
      vertical: "flex-col",
      horizontal: "flex-row",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
      baseline: "items-baseline",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
    },
    wrap: {
      true: "flex-wrap",
      false: "flex-nowrap",
    },
  },
  defaultVariants: {
    direction: "vertical",
    align: "stretch",
    justify: "start",
    wrap: false,
  },
});

const gapSmClassName: Record<SpacingToken, string> = {
  none: "sm:gap-0",
  sm: "sm:gap-sm",
  md: "sm:gap-md",
  lg: "sm:gap-lg",
};

const gapMdClassName: Record<SpacingToken, string> = {
  none: "md:gap-0",
  sm: "md:gap-sm",
  md: "md:gap-md",
  lg: "md:gap-lg",
};

const gapLgClassName: Record<SpacingToken, string> = {
  none: "lg:gap-0",
  sm: "lg:gap-sm",
  md: "lg:gap-md",
  lg: "lg:gap-lg",
};

type StackAlign = NonNullable<VariantProps<typeof stackVariants>["align"]>;
type StackJustify = NonNullable<VariantProps<typeof stackVariants>["justify"]>;

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: SpacingToken;
  /** Override gap from `sm:` breakpoint. */
  gapSm?: SpacingToken;
  /** Override gap from `md:` breakpoint. */
  gapMd?: SpacingToken;
  /** Override gap from `lg:` breakpoint. */
  gapLg?: SpacingToken;
  direction?: "vertical" | "horizontal";
  /** Horizontal stack becomes column below `md`. */
  responsive?: boolean;
  align?: StackAlign;
  justify?: StackJustify;
  wrap?: boolean;
  as?: React.ElementType;
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      className,
      gap = "md",
      gapSm,
      gapMd,
      gapLg,
      direction = "vertical",
      responsive = false,
      align,
      justify,
      wrap = false,
      as: Comp = "div",
      ...props
    },
    ref,
  ) => (
    <Comp
      ref={ref}
      className={cn(
        stackVariants({
          direction:
            responsive && direction === "horizontal" ? "vertical" : direction,
          align,
          justify,
          wrap,
        }),
        responsive && direction === "horizontal" && "md:flex-row",
        spacingClassName[gap],
        gapSm && gapSmClassName[gapSm],
        gapMd && gapMdClassName[gapMd],
        gapLg && gapLgClassName[gapLg],
        className,
      )}
      {...props}
    />
  ),
);
Stack.displayName = "Stack";

const Row = React.forwardRef<HTMLDivElement, Omit<StackProps, "direction">>(
  ({ responsive = true, ...props }, ref) => (
    <Stack ref={ref} direction="horizontal" responsive={responsive} {...props} />
  ),
);
Row.displayName = "Row";

export interface ColumnProps extends Omit<StackProps, "direction"> {
  /** Grow within a Row (`flex-1`). */
  flex?: boolean;
}

const Column = React.forwardRef<HTMLDivElement, ColumnProps>(
  ({ className, flex = false, ...props }, ref) => (
    <Stack
      ref={ref}
      direction="vertical"
      className={cn(flex && "min-w-0 flex-1", className)}
      {...props}
    />
  ),
);
Column.displayName = "Column";

export { Stack, Row, Column, stackVariants };
