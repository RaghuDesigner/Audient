import * as React from "react";

import {
  paddingYClassName,
  type SpacingToken,
} from "@/components/layout/spacing";
import { cn } from "@/utils/cn";

/**
 * Section — thematic grouping with optional accessible name.
 */
export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Vertical padding from spacing tokens. */
  spacing?: SpacingToken;
  /** Associates section with a heading id (`aria-labelledby`). */
  labelledBy?: string;
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    {
      className,
      spacing = "lg",
      labelledBy,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => (
    <section
      ref={ref}
      aria-labelledby={labelledBy}
      aria-label={ariaLabel}
      className={cn("w-full", paddingYClassName[spacing], className)}
      {...props}
    />
  ),
);
Section.displayName = "Section";

export { Section };
