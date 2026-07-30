import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { Badge } from "@/components/ui/badge";
import {
  CardEmptyBody,
  CardErrorBody,
  CardLoadingBody,
  CardSkeleton,
} from "@/components/ui/card-states";
import {
  cardVariants,
  type CardPadding,
  type CardVariant,
} from "@/components/ui/card-variants";
import { cn } from "@/utils/cn";

/**
 * Audient Card — Figma `Card` + CARD-* rules: Large radius, Surface fills,
 * Shadow SM/MD, interactive keyboard activation. Token CSS vars → dark-ready.
 */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  /** Hover elevation (same chrome as `interactive` when not clickable). */
  interactive?: boolean;
  /** Full-card activation (Enter/Space) — requires `onClick` or `asChild`. */
  clickable?: boolean;
  /** Show loading skeleton body (sets `aria-busy`). */
  isLoading?: boolean;
  /** Compose as child (e.g. `Link`) via Radix Slot. */
  asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "default",
      padding = "md",
      interactive = false,
      clickable = false,
      isLoading = false,
      asChild = false,
      onClick,
      onKeyDown,
      children,
      role,
      tabIndex,
      ...props
    },
    ref,
  ) => {
    const resolvedVariant: CardVariant = isLoading
      ? "loading"
      : clickable
        ? "clickable"
        : interactive && variant === "default"
          ? "interactive"
          : variant;

    const isActivable =
      !isLoading &&
      (clickable || resolvedVariant === "clickable") &&
      Boolean(onClick) &&
      !asChild;

    const Comp = asChild ? Slot : "div";

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (!isActivable || event.defaultPrevented) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick?.(
          event as unknown as React.MouseEvent<HTMLDivElement>,
        );
      }
    };

    return (
      <Comp
        ref={ref}
        className={cn(
          cardVariants({ variant: resolvedVariant, padding }),
          className,
        )}
        role={isActivable ? "button" : role}
        tabIndex={isActivable ? (tabIndex ?? 0) : tabIndex}
        aria-busy={isLoading || undefined}
        aria-disabled={isLoading || undefined}
        onClick={isLoading ? undefined : onClick}
        onKeyDown={isActivable ? handleKeyDown : onKeyDown}
        {...props}
      >
        {isLoading ? <CardLoadingBody /> : children}
      </Comp>
    );
  },
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col gap-sm sm:flex-row sm:items-start sm:justify-between",
      className,
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { as?: "h2" | "h3" | "h4" }
>(({ className, as: Comp = "h3", ...props }, ref) => (
  <Comp
    ref={ref}
    className={cn(
      "text-body-sm font-semibold leading-tight text-foreground sm:text-body",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardSubtitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-info text-muted-foreground sm:text-body-sm",
      className,
    )}
    {...props}
  />
));
CardSubtitle.displayName = "CardSubtitle";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-sm", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mt-auto flex flex-col gap-sm pt-sm sm:flex-row sm:items-center sm:justify-between",
      className,
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

const CardActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-wrap items-center gap-sm sm:justify-end",
      className,
    )}
    {...props}
  />
));
CardActions.displayName = "CardActions";

const CardIcon = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, children, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "inline-flex size-11 shrink-0 items-center justify-center rounded-md",
      "bg-muted text-foreground [&_svg]:size-5",
      className,
    )}
    aria-hidden="true"
    {...props}
  >
    {children}
  </span>
));
CardIcon.displayName = "CardIcon";

type CardBadgeProps = React.ComponentProps<typeof Badge>;

/** Thin alias — prefer `Badge` directly for new code. */
const CardBadge = React.forwardRef<HTMLElement, CardBadgeProps>(
  ({ shape = "pill", size = "sm", ...props }, ref) => (
    <Badge ref={ref} shape={shape} size={size} {...props} />
  ),
);
CardBadge.displayName = "CardBadge";

export {
  Card,
  CardActions,
  CardBadge,
  CardContent,
  CardEmptyBody,
  CardErrorBody,
  CardFooter,
  CardHeader,
  CardIcon,
  CardLoadingBody,
  CardSkeleton,
  CardSubtitle,
  CardTitle,
  cardVariants,
};
