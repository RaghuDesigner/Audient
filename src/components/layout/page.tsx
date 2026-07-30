import * as React from "react";

import { Container, type ContainerProps } from "@/components/layout/container";
import { cn } from "@/utils/cn";

/**
 * Page — primary content landmark for skip-to-content (`#main`).
 * ACCESSIBILITY.md: unique `<main>` per view.
 */
export interface PageProps extends React.HTMLAttributes<HTMLElement> {
  /** Constrain content with Container (default true). */
  contained?: boolean;
  containerMaxWidth?: ContainerProps["maxWidth"];
  /** Optional class on the inner Container. */
  containerClassName?: string;
}

const Page = React.forwardRef<HTMLElement, PageProps>(
  (
    {
      className,
      contained = true,
      containerMaxWidth = "default",
      containerClassName,
      children,
      id = "main",
      ...props
    },
    ref,
  ) => {
    const content = contained ? (
      <Container maxWidth={containerMaxWidth} className={containerClassName}>
        {children}
      </Container>
    ) : (
      children
    );

    return (
      <main
        ref={ref}
        id={id}
        tabIndex={-1}
        className={cn(
          "flex w-full flex-1 flex-col py-md outline-none sm:py-lg",
          className,
        )}
        {...props}
      >
        {content}
      </main>
    );
  },
);
Page.displayName = "Page";

export { Page };
