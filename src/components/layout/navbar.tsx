import * as React from "react";
import Link from "next/link";
import { Menu, PanelLeftClose, PanelLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/constants/site";
import { cn } from "@/utils/cn";

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  /** Brand / home link href. */
  homeHref?: string;
  /** Optional override for logo mark (defaults to wordmark text). */
  logo?: React.ReactNode;
  /** Slot: credits, crown, notifications, avatar — no business widgets hardcoded. */
  end?: React.ReactNode;
  /** Show sidebar toggle (app shell with sidebar). */
  showSidebarToggle?: boolean;
  sidebarCollapsed?: boolean;
  sidebarMobileOpen?: boolean;
  onSidebarToggle?: () => void;
  /** Accessible label for sidebar toggle. */
  sidebarToggleLabel?: string;
  /** Sticky header (default true). */
  sticky?: boolean;
}

/**
 * Navbar / TopBar — sticky banner landmark.
 * SCREEN_MAPPING header chrome: logo left · end slot right (credits/avatar later).
 * Layout-only: no CreditMeter / auth menu wired here.
 */
export const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  (
    {
      className,
      homeHref = "/",
      logo,
      end,
      showSidebarToggle = false,
      sidebarCollapsed = false,
      sidebarMobileOpen = false,
      onSidebarToggle,
      sidebarToggleLabel,
      sticky = true,
      ...props
    },
    ref,
  ) => {
    const toggleLabel =
      sidebarToggleLabel ??
      (sidebarMobileOpen || !sidebarCollapsed
        ? "Collapse navigation"
        : "Expand navigation");

    return (
      <header
        ref={ref}
        className={cn(
          "border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
          "pt-safe",
          sticky && "sticky top-0 z-sticky",
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            "mx-auto flex min-h-14 w-full max-w-[1400px] items-center gap-md",
            "px-md lg:px-lg",
          )}
        >
          {showSidebarToggle ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 lg:inline-flex"
              onClick={onSidebarToggle}
              aria-expanded={sidebarMobileOpen || !sidebarCollapsed}
              aria-controls="app-sidebar"
              aria-label={toggleLabel}
            >
              {/* Mobile / tablet: menu; desktop: collapse icon */}
              <Menu className="size-5 lg:hidden" aria-hidden />
              <span className="hidden lg:contents">
                {sidebarCollapsed ? (
                  <PanelLeft className="size-5" aria-hidden />
                ) : (
                  <PanelLeftClose className="size-5" aria-hidden />
                )}
              </span>
            </Button>
          ) : null}

          <div className="flex min-w-0 flex-1 items-center gap-sm">
            <Link
              href={homeHref}
              className={cn(
                "truncate rounded-sm text-body-sm font-bold text-primary sm:text-body",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
            >
              {logo ?? (
                <span className="inline-flex flex-col leading-tight sm:flex-row sm:items-baseline sm:gap-sm">
                  <span>{siteConfig.name}</span>
                  <span className="hidden text-info font-regular tracking-wide text-muted-foreground sm:inline">
                    AUDIT · ANALYZE · ELEVATE UX
                  </span>
                </span>
              )}
            </Link>
          </div>

          {end ? (
            <div className="flex shrink-0 items-center gap-sm">{end}</div>
          ) : null}
        </div>
      </header>
    );
  },
);
Navbar.displayName = "Navbar";
