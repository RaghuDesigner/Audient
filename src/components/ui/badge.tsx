import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/utils/cn";

/**
 * Audient Badge — `components/ui/badge`
 *
 * Figma `Badge` / `Tag` (COMPONENT_MAPPING): compact status/label.
 * Never color-only — always pair with text (and optional icon).
 * Token CSS variables → dark-mode ready when `.dark` overrides exist.
 */
const badgeVariants = cva(
  [
    "inline-flex max-w-full items-center justify-center gap-1",
    "font-sans font-semibold whitespace-nowrap",
    "transition-colors duration-fast ease-in-out-smooth",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: "bg-primary/15 text-primary",
        secondary: "bg-secondary/15 text-secondary",
        success: "bg-success/15 text-success",
        /** Darker text on tint — warning hex alone fails small-text contrast */
        warning: "bg-warning/25 text-foreground",
        error: "bg-error/15 text-error",
        info: "bg-surface text-secondary ring-1 ring-inset ring-secondary/30",
        neutral: "bg-muted text-muted-foreground",
      },
      size: {
        sm: "min-h-6 px-sm py-0.5 text-info [&_svg]:size-3",
        md: "min-h-7 px-sm py-1 text-info sm:text-body-sm [&_svg]:size-3.5",
        lg: "min-h-9 px-md py-1 text-body-sm sm:text-body [&_svg]:size-4",
      },
      shape: {
        rounded: "rounded-md",
        pill: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
      shape: "pill",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof badgeVariants> {
  /** Leading decorative icon (`aria-hidden`). */
  icon?: React.ReactNode;
  /** Render as child (e.g. `Link`) via Radix Slot. */
  asChild?: boolean;
}

const Badge = React.forwardRef<HTMLElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      shape,
      icon,
      asChild = false,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = cn(badgeVariants({ variant, size, shape }), className);

    if (asChild) {
      return (
        <Slot
          ref={ref as React.Ref<HTMLElement>}
          className={classes}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <span
        ref={ref as React.Ref<HTMLSpanElement>}
        className={classes}
        {...props}
      >
        {icon ? (
          <span className="inline-flex shrink-0" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        {children ? <span className="truncate">{children}</span> : null}
      </span>
    );
  },
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };
