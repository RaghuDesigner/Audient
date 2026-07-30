import { cva, type VariantProps } from "class-variance-authority";

/**
 * Audient Card shell — COMPONENT_MAPPING / CARD-* tokens:
 * Surface/white fills · Radius Large (16px) · Shadow SM/MD · spacing 8/16/24.
 */
export const cardVariants = cva(
  [
    "relative flex w-full flex-col rounded-lg border font-sans",
    "text-card-foreground transition-colors duration-fast ease-in-out-smooth",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "border-border bg-card shadow-sm",
        elevated: "border-border bg-card shadow-md",
        flat: "border-transparent bg-surface shadow-none",
        interactive: [
          "border-border bg-card shadow-sm",
          "hover:border-primary hover:shadow-md",
        ].join(" "),
        clickable: [
          "cursor-pointer border-border bg-card shadow-sm",
          "hover:border-primary hover:shadow-md",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        ].join(" "),
        loading: "border-border bg-card shadow-sm",
        empty: "border-dashed border-border bg-card shadow-none",
        error: "border-error bg-card shadow-sm",
      },
      padding: {
        none: "p-0",
        sm: "p-sm gap-sm",
        md: "p-md gap-md sm:p-lg",
        lg: "p-lg gap-md sm:gap-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  },
);

export type CardVariant = NonNullable<
  VariantProps<typeof cardVariants>["variant"]
>;
export type CardPadding = NonNullable<
  VariantProps<typeof cardVariants>["padding"]
>;
