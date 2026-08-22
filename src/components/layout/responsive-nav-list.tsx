"use client";

import * as React from "react";
import Link from "next/link";

import { Caption } from "@/components/ui/typography";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/utils/cn";

/** Shared native select styling — Settings / Notifications / Legal nav. */
export const formSelectClassName = cn(
  "min-h-11 w-full rounded-md border border-border bg-background px-md",
  "text-body-sm text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

const navLinkBaseClass = cn(
  "block min-h-11 rounded-md border border-transparent px-md py-sm",
  "text-body-sm font-medium text-foreground",
  "transition-colors",
  "hover:border-border hover:bg-muted/40",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
);

const navLinkActiveClass = cn(
  "border-border bg-muted/60 font-semibold underline underline-offset-4",
);

export type ResponsiveNavItem = {
  id: string;
  label: string;
  href: string;
  disabled?: boolean;
};

export type ResponsiveNavListProps = {
  items: readonly ResponsiveNavItem[];
  activeId: string;
  /** Visible label + `aria-labelledby` target for desktop nav. */
  navLabel: string;
  /** Visible label + `aria-labelledby` target for mobile select. */
  mobileSelectLabel: string;
  disabled?: boolean;
  onItemActivate?: (id: string) => void;
  className?: string;
  id?: string;
};

/**
 * Responsive section nav — vertical link list (md+) and labeled select (mobile).
 * Reused by Legal Navigation, Settings section nav pattern, Notification Filter mobile fallback.
 */
export function ResponsiveNavList({
  items,
  activeId,
  navLabel,
  mobileSelectLabel,
  disabled = false,
  onItemActivate,
  className,
  id,
}: ResponsiveNavListProps) {
  const isMdUp = useMediaQuery("(min-width: 768px)");
  const navLabelId = React.useId();
  const mobileLabelId = React.useId();
  const rootId = id ?? "responsive-nav-list";

  const handleActivate = (itemId: string, event?: React.MouseEvent) => {
    if (disabled) {
      event?.preventDefault();
      return;
    }
    onItemActivate?.(itemId);
  };

  if (!isMdUp) {
    return (
      <div id={rootId} className={cn("w-full", className)}>
        <Caption id={mobileLabelId} className="mb-sm font-semibold text-foreground">
          {mobileSelectLabel}
        </Caption>
        <select
          className={formSelectClassName}
          value={activeId}
          disabled={disabled}
          aria-labelledby={mobileLabelId}
          onChange={(event) => {
            const next = event.target.value;
            const item = items.find((entry) => entry.id === next);
            if (!item || item.disabled) return;
            onItemActivate?.(next);
          }}
        >
          {items.map((item) => (
            <option key={item.id} value={item.id} disabled={item.disabled}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <nav
      id={rootId}
      className={cn("w-full", className)}
      aria-labelledby={navLabelId}
    >
      <Caption id={navLabelId} className="mb-sm font-semibold text-foreground">
        {navLabel}
      </Caption>
      <ul className="m-0 flex list-none flex-col gap-sm p-0">
        {items.map((item) => {
          const isActive = item.id === activeId;
          const itemDisabled = disabled || item.disabled;

          return (
            <li key={item.id}>
              {itemDisabled ? (
                <span
                  className={cn(
                    navLinkBaseClass,
                    isActive && navLinkActiveClass,
                    "pointer-events-none opacity-50",
                  )}
                  aria-current={isActive ? "page" : undefined}
                  aria-disabled="true"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    navLinkBaseClass,
                    isActive && navLinkActiveClass,
                  )}
                  aria-current={isActive ? "page" : undefined}
                  onClick={(event) => handleActivate(item.id, event)}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
