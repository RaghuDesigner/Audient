"use client";

import * as React from "react";

import { cn } from "@/utils/cn";

const LOGIN_REQUIRED = "Login required";

export type DisabledMenuItemProps = {
  children: React.ReactNode;
  className?: string;
  /** Accessible description; defaults to “Login required”. */
  reason?: string;
};

/**
 * Restricted guest menu item — grey, non-interactive, no keyboard focus.
 * Pointer hover shows “Login required” tooltip.
 */
export function DisabledMenuItem({
  children,
  className,
  reason = LOGIN_REQUIRED,
}: DisabledMenuItemProps) {
  const tooltipId = React.useId();

  return (
    <div
      role="menuitem"
      aria-disabled="true"
      aria-describedby={tooltipId}
      className={cn("group relative cursor-default", className)}
    >
      <span
        className={cn(
          "flex w-full select-none items-center px-md py-sm",
          "text-body-sm font-regular text-muted-foreground",
        )}
      >
        {children}
      </span>
      {/* Pointer-only tooltip — item is not focusable */}
      <span
        id={tooltipId}
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 top-full z-tooltip -translate-x-1/2",
          "mt-sm whitespace-nowrap rounded-sm bg-foreground px-sm py-sm",
          "text-info font-regular text-primary-foreground shadow-sm",
          "opacity-0 transition-opacity duration-fast",
          "group-hover:opacity-100",
        )}
      >
        {reason}
      </span>
    </div>
  );
}
