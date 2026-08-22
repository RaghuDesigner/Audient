"use client";

import * as React from "react";

import { cn } from "@/utils/cn";

export type MenuItemProps = {
  children: React.ReactNode;
  onSelect?: () => void;
  className?: string;
  id?: string;
};

/**
 * Enabled profile menu item (guest: Login).
 * Receives keyboard focus; Enter / Space activate.
 */
export const MenuItem = React.forwardRef<HTMLButtonElement, MenuItemProps>(
  ({ children, onSelect, className, id }, ref) => {
    return (
      <button
        ref={ref}
        id={id}
        type="button"
        role="menuitem"
        tabIndex={-1}
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect?.();
          }
        }}
        className={cn(
          "flex w-full cursor-pointer items-center px-md py-sm text-left",
          "text-body-sm font-semibold text-foreground",
          "transition-colors duration-fast",
          "hover:bg-muted focus:bg-muted",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "focus-visible:ring-inset",
          className,
        )}
      >
        {children}
      </button>
    );
  },
);
MenuItem.displayName = "MenuItem";
