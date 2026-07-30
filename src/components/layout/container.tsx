import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/cn";

/**
 * Container — `components/layout/container`
 * Responsive width + gutters (16 mobile / 24 desktop per FM-01).
 */
const containerVariants = cva("mx-auto w-full px-md lg:px-lg", {
  variants: {
    maxWidth: {
      narrow: "max-w-3xl",
      default: "max-w-5xl",
      wide: "max-w-7xl",
      full: "max-w-none",
    },
  },
  defaultVariants: {
    maxWidth: "default",
  },
});

export interface ContainerProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, maxWidth, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(containerVariants({ maxWidth }), className)}
      {...props}
    />
  ),
);
Container.displayName = "Container";

export { Container, containerVariants };
