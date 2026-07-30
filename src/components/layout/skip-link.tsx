import * as React from "react";

import { cn } from "@/utils/cn";

/**
 * SkipLink — first focusable control on authenticated / app shells.
 * ACCESSIBILITY.md §21: visually hidden until focus → `#main`.
 */
export interface SkipLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Target element id (default `main`). */
  targetId?: string;
  label?: string;
}

export function SkipLink({
  targetId = "main",
  label = "Skip to main content",
  className,
  ...props
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        "sr-only",
        "focus:fixed focus:left-md focus:top-md focus:z-toast",
        "focus:m-0 focus:h-auto focus:w-auto focus:overflow-visible",
        "focus:whitespace-normal focus:rounded-md focus:bg-primary",
        "focus:px-md focus:py-sm focus:text-body-sm focus:font-semibold",
        "focus:text-primary-foreground focus:outline-none",
        "focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
        className,
      )}
      {...props}
    >
      {label}
    </a>
  );
}
