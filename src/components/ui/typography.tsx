import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import {
  typographyVariants,
  type TypographyVariant,
} from "@/components/ui/typography-variants";
import { cn } from "@/utils/cn";

export type TypographyProps = {
  variant?: TypographyVariant;
  /** Override the default HTML element. */
  as?: React.ElementType;
  /** Compose with a child (e.g. Next.js `Link`). */
  asChild?: boolean;
  className?: string;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>;

function createTypography(
  defaultTag: React.ElementType,
  defaultVariant: TypographyVariant,
  displayName: string,
) {
  const Component = React.forwardRef<HTMLElement, TypographyProps>(
    (
      {
        as,
        asChild = false,
        variant = defaultVariant,
        className,
        children,
        ...props
      },
      ref,
    ) => {
      const Comp = asChild ? Slot : (as ?? defaultTag);

      return (
        <Comp
          ref={ref}
          className={cn(typographyVariants({ variant }), className)}
          {...props}
        >
          {children}
        </Comp>
      );
    },
  );

  Component.displayName = displayName;
  return Component;
}

/** Hero / marketing display — use `as="h1"` when it is the page title. */
const Display = createTypography("p", "display", "Display");

const H1 = createTypography("h1", "h1", "H1");
const H2 = createTypography("h2", "h2", "H2");
const H3 = createTypography("h3", "h3", "H3");
const H4 = createTypography("h4", "h4", "H4");
const H5 = createTypography("h5", "h5", "H5");
const H6 = createTypography("h6", "h6", "H6");

const BodyLarge = createTypography("p", "body-lg", "BodyLarge");
const BodyMedium = createTypography("p", "body-md", "BodyMedium");
const BodySmall = createTypography("p", "body-sm", "BodySmall");

const Caption = createTypography("p", "caption", "Caption");
const Overline = createTypography("span", "overline", "Overline");
const Code = createTypography("code", "code", "Code");

/**
 * Text link — native `<a>` or `asChild` with Next.js `Link`.
 * Include discernible text (not icon-only without `aria-label`).
 */
const TextLink = React.forwardRef<
  HTMLAnchorElement,
  TypographyProps &
    React.AnchorHTMLAttributes<HTMLAnchorElement> & { external?: boolean }
>(({ asChild = false, className, children, external = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";
  const externalProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Comp
      ref={ref}
      className={cn(typographyVariants({ variant: "link" }), className)}
      {...externalProps}
      {...props}
    >
      {children}
    </Comp>
  );
});
TextLink.displayName = "TextLink";

/** Generic text when you need an arbitrary variant. */
const Text = createTypography("p", "body-md", "Text");

export {
  BodyLarge,
  BodyMedium,
  BodySmall,
  Caption,
  Code,
  Display,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Overline,
  Text,
  TextLink,
  typographyVariants,
};

export type { TypographyVariant };
