"use client";

import * as React from "react";

import { Breadcrumb, type BreadcrumbItem } from "@/components/layout/breadcrumb";
import { Footer, type FooterLink } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Page } from "@/components/layout/page";
import { Sidebar, type SidebarNavItem } from "@/components/layout/sidebar";
import { SkipLink } from "@/components/layout/skip-link";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/utils/cn";

export interface AppShellProps {
  children: React.ReactNode;
  /** Navbar end slot (credits, avatar — injected by pages later). */
  headerEnd?: React.ReactNode;
  /** Show collapsible sidebar + toggle. */
  showSidebar?: boolean;
  sidebarItems?: SidebarNavItem[];
  sidebarFooter?: React.ReactNode;
  /** Default desktop collapsed state. */
  defaultSidebarCollapsed?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  /** Optional actions aligned with breadcrumb row. */
  pageActions?: React.ReactNode;
  showFooter?: boolean;
  footerLinks?: FooterLink[];
  footerVariant?: "marketing" | "minimal";
  /** Constrain main with Container (Page). */
  contained?: boolean;
  containerMaxWidth?: "narrow" | "default" | "wide" | "full";
  homeHref?: string;
  className?: string;
  mainClassName?: string;
}

/**
 * AppShell — authenticated / app chrome wrapper.
 * Desktop: sticky header + collapsible sidebar + scrollable main.
 * Tablet/Mobile: sticky header + drawer nav + scrollable main.
 * No business screens — slots only.
 */
export function AppShell({
  children,
  headerEnd,
  showSidebar = true,
  sidebarItems = [],
  sidebarFooter,
  defaultSidebarCollapsed = false,
  breadcrumbs,
  pageActions,
  showFooter = true,
  footerLinks,
  footerVariant = "minimal",
  contained = true,
  containerMaxWidth = "wide",
  homeHref = "/",
  className,
  mainClassName,
}: AppShellProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [collapsed, setCollapsed] = React.useState(defaultSidebarCollapsed);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Close mobile drawer when crossing to desktop
  React.useEffect(() => {
    if (isDesktop) setMobileOpen(false);
  }, [isDesktop]);

  const onSidebarToggle = React.useCallback(() => {
    if (isDesktop) {
      setCollapsed((value) => !value);
    } else {
      setMobileOpen((value) => !value);
    }
  }, [isDesktop]);

  return (
    <div
      className={cn(
        "flex min-h-dvh flex-col bg-background text-foreground",
        className,
      )}
    >
      <SkipLink />

      <Navbar
        homeHref={homeHref}
        end={headerEnd}
        sticky
        showSidebarToggle={showSidebar && sidebarItems.length > 0}
        sidebarCollapsed={collapsed}
        sidebarMobileOpen={mobileOpen}
        onSidebarToggle={onSidebarToggle}
      />

      <div className="relative flex min-h-0 flex-1">
        {showSidebar && sidebarItems.length > 0 ? (
          <Sidebar
            items={sidebarItems}
            collapsed={collapsed}
            mobileOpen={mobileOpen}
            onMobileOpenChange={setMobileOpen}
            footer={sidebarFooter}
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <Page
            contained={contained}
            containerMaxWidth={containerMaxWidth}
            className={cn(
              "min-h-0 flex-1 overflow-y-auto overscroll-y-contain",
              mainClassName,
            )}
          >
            {breadcrumbs && breadcrumbs.length > 0 ? (
              <div
                className={cn(
                  "mb-md flex flex-col gap-md sm:mb-lg",
                  "sm:flex-row sm:items-center sm:justify-between",
                )}
              >
                <Breadcrumb items={breadcrumbs} />
                {pageActions ? (
                  <div className="flex shrink-0 flex-wrap items-center gap-sm">
                    {pageActions}
                  </div>
                ) : null}
              </div>
            ) : pageActions ? (
              <div className="mb-md flex justify-end sm:mb-lg">{pageActions}</div>
            ) : null}

            {children}
          </Page>

          {showFooter ? (
            <Footer links={footerLinks} variant={footerVariant} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
