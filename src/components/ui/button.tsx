import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/utils/cn";

/**
 * Audient Button — `components/ui/button`
 *
 * Maps to Figma `Button` (COMPONENT_MAPPING) and shared BTN-* rules
 * (COMPONENT_BEHAVIOR): native control, focus ring, ≥44px target,
 * `aria-busy` while loading, decorative icons `aria-hidden`.
 *
 * Colors resolve from CSS variables → dark-mode ready when `.dark`
 * token overrides are added (light theme only for now).
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-sm",
    "whitespace-nowrap rounded-md font-sans font-semibold",
    "transition-colors duration-fast ease-in-out-smooth",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary/80",
        outline:
          "border border-primary bg-background text-primary hover:bg-primary/5 active:bg-primary/10",
        ghost:
          "bg-transparent text-primary hover:bg-primary/5 active:bg-primary/10",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80",
      },
      size: {
        /** Small — min 44px touch target */
        sm: "min-h-11 px-md py-sm text-info [&_svg]:size-4",
        /** Medium (default) */
        md: "min-h-11 px-md py-sm text-body-sm [&_svg]:size-5",
        /** Large */
        lg: "min-h-12 px-lg py-md text-body-sm [&_svg]:size-5 sm:text-body",
      },
      fullWidth: {
        true: "w-full",
        false: null,
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled">,
    VariantProps<typeof buttonVariants> {
  /** Render as child (e.g. Next.js `Link`) via Radix Slot. */
  asChild?: boolean;
  /** Shows spinner, sets `aria-busy`, and disables interaction. */
  isLoading?: boolean;
  /** Native disabled; also applied while `isLoading`. */
  disabled?: boolean;
  /** Stretch to 100% of parent width. */
  fullWidth?: boolean;
  /** Leading icon (decorative — wrapped with `aria-hidden`). */
  iconLeft?: React.ReactNode;
  /** Trailing icon (decorative — wrapped with `aria-hidden`). */
  iconRight?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth = false,
      asChild = false,
      isLoading = false,
      disabled = false,
      iconLeft,
      iconRight,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const isDisabled = Boolean(disabled || isLoading);
    const Comp = asChild ? Slot : "button";

    // Slot expects a single child — loading chrome only on native <button>.
    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, fullWidth, className }))}
          ref={ref}
          aria-disabled={isDisabled || undefined}
          aria-busy={isLoading || undefined}
          data-disabled={isDisabled || undefined}
          data-loading={isLoading || undefined}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={isLoading || undefined}
        data-loading={isLoading || undefined}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : iconLeft ? (
          <span className="inline-flex shrink-0" aria-hidden="true">
            {iconLeft}
          </span>
        ) : null}

        {children}

        {!isLoading && iconRight ? (
          <span className="inline-flex shrink-0" aria-hidden="true">
            {iconRight}
          </span>
        ) : null}

        {isLoading ? <span className="sr-only">Loading</span> : null}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
