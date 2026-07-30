import { cva, type VariantProps } from "class-variance-authority";

/**
 * Typography CVA — Figma sizes (DESIGN_TOKENS) + derived H3–H6 / display /
 * caption / overline / code. Responsive steps use only token sizes.
 */
export const typographyVariants = cva("font-sans text-foreground", {
  variants: {
    variant: {
      display:
        "text-body-lg font-bold tracking-tighter sm:text-h2 md:text-display",
      h1: "text-h2 font-bold tracking-tighter sm:text-h1",
      h2: "text-body-lg font-semibold tracking-tight sm:text-h2",
      h3: "text-body font-semibold tracking-tight sm:text-h3",
      h4: "text-body-sm font-semibold sm:text-h4",
      h5: "text-info font-semibold sm:text-h5",
      h6: "text-info font-semibold tracking-wide sm:text-h6",
      "body-lg": "text-body-sm sm:text-body-lg",
      "body-md": "text-body-sm sm:text-body",
      "body-sm": "text-info sm:text-body-sm",
      caption: "text-caption text-muted-foreground",
      overline: "text-overline uppercase text-muted-foreground",
      code: "font-mono text-code text-foreground",
      link: [
        "text-primary underline-offset-4",
        "hover:underline focus-visible:underline",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "rounded-sm",
      ].join(" "),
    },
  },
  defaultVariants: {
    variant: "body-md",
  },
});

export type TypographyVariant = NonNullable<
  VariantProps<typeof typographyVariants>["variant"]
>;
