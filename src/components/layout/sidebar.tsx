"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export interface SidebarNavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
  /** Soft-disable (guest gated) — still visible, not activatable. */
  disabled?: boolean;
  disabledReason?: string;
}

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  items: SidebarNavItem[];
  /** Controlled collapsed (desktop icon rail). */
  collapsed?: boolean;
  /** Mobile/tablet drawer open. */
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
  /** Optional footer slot inside sidebar (e.g. plan badge later). */
  footer?: React.ReactNode;
  label?: string;
}

/**
 * Sidebar — primary section navigation.
 * Desktop (lg+): collapsible rail. Below lg: off-canvas drawer + overlay.
 * Keyboard: Esc closes mobile drawer; focus returns to toggle (caller).
 */
export function Sidebar({
  items,
  collapsed = false,
  mobileOpen = false,
  onMobileOpenChange,
  footer,
  label = "Primary",
  className,
  ...props
}: SidebarProps) {
  const pathname = usePathname();
  const navRef = React.useRef<HTMLElement>(null);
  const previouslyFocused = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!mobileOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const firstLink = navRef.current?.querySelector<HTMLElement>(
      "a[href]:not([aria-disabled='true']), button:not([disabled])",
    );
    firstLink?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onMobileOpenChange?.(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [mobileOpen, onMobileOpenChange]);

  // Lock body scroll when mobile drawer open
  React.useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const renderItems = (iconOnly: boolean) =>
    items.map((item) => {
      const active =
        !item.disabled &&
        (pathname === item.href || pathname.startsWith(`${item.href}/`));

      const classNameItem = cn(
        "group flex min-h-11 items-center gap-md rounded-md px-md text-body-sm font-semibold transition-colors duration-fast",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        iconOnly && "justify-center px-sm",
        item.disabled && "cursor-not-allowed opacity-50",
        !item.disabled &&
          active &&
          "bg-primary/10 text-primary aria-[current=page]:bg-primary/10",
        !item.disabled &&
          !active &&
          "text-foreground hover:bg-muted hover:text-foreground",
      );

      if (item.disabled) {
        return (
          <span
            key={item.href}
            className={classNameItem}
            aria-disabled="true"
            title={item.disabledReason}
          >
            {item.icon ? (
              <span className="shrink-0 [&_svg]:size-5" aria-hidden>
                {item.icon}
              </span>
            ) : null}
            {!iconOnly ? <span className="truncate">{item.label}</span> : null}
            {iconOnly ? <span className="sr-only">{item.label}</span> : null}
          </span>
        );
      }

      return (
        <Link
          key={item.href}
          href={item.href}
          className={classNameItem}
          aria-current={active ? "page" : undefined}
          title={iconOnly ? item.label : undefined}
          onClick={() => onMobileOpenChange?.(false)}
        >
          {item.icon ? (
            <span className="shrink-0 [&_svg]:size-5" aria-hidden>
              {item.icon}
            </span>
          ) : null}
          {!iconOnly ? <span className="truncate">{item.label}</span> : null}
          {iconOnly ? <span className="sr-only">{item.label}</span> : null}
        </Link>
      );
    });

  const asideClasses = cn(
    "flex h-full flex-col border-border bg-surface",
    "transition-[width,transform] duration-DEFAULT ease-in-out-smooth",
    "motion-reduce:transition-none",
  );

  return (
    <>
      {/* Mobile / tablet overlay */}
      <div
        role="presentation"
        className={cn(
          "fixed inset-0 z-overlay bg-foreground/40 lg:hidden",
          "transition-opacity duration-DEFAULT",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => onMobileOpenChange?.(false)}
        aria-hidden={!mobileOpen}
      />

      {/* Mobile / tablet drawer */}
      <aside
        id="app-sidebar"
        ref={navRef}
        className={cn(
          asideClasses,
          "fixed inset-y-0 left-0 z-overlay w-72 max-w-[85vw] border-r pt-safe pb-safe shadow-lg lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          className,
        )}
        aria-label={label}
        aria-hidden={!mobileOpen}
        {...props}
      >
        <div className="flex items-center justify-between border-b border-border px-md py-sm">
          <p className="text-body-sm font-semibold text-foreground">Menu</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Close navigation"
            onClick={() => onMobileOpenChange?.(false)}
          >
            <X className="size-5" aria-hidden />
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto p-sm" aria-label={label}>
          <ul className="flex flex-col gap-sm">
            {renderItems(false).map((node, i) => (
              <li key={items[i]?.href ?? i}>{node}</li>
            ))}
          </ul>
        </nav>
        {footer ? (
          <div className="border-t border-border p-md">{footer}</div>
        ) : null}
      </aside>

      {/* Desktop rail */}
      <aside
        className={cn(
          asideClasses,
          "hidden h-[calc(100dvh-3.5rem)] max-h-[calc(100dvh-3.5rem)] shrink-0 border-r lg:flex",
          "self-start pb-safe sticky top-14",
          collapsed ? "w-16" : "w-60",
          className,
        )}
        aria-label={label}
      >
        <nav className="flex flex-1 flex-col overflow-y-auto p-sm" aria-label={label}>
          <ul className="flex flex-col gap-sm">
            {renderItems(collapsed).map((node, i) => (
              <li key={items[i]?.href ?? i}>{node}</li>
            ))}
          </ul>
        </nav>
        {footer && !collapsed ? (
          <div className="border-t border-border p-md">{footer}</div>
        ) : null}
      </aside>
    </>
  );
}
