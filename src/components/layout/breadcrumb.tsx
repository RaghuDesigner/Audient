import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/utils/cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  /** Current page — rendered as text, not a link. */
  current?: boolean;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  /** Accessible name for the nav landmark. */
  label?: string;
}

/**
 * BreadcrumbArea — Home / History style trails (SCREEN-010, 012, M01, M02).
 * Landmark: navigation. Current page is not a link.
 */
export function Breadcrumb({
  items,
  label = "Breadcrumb",
  className,
  ...props
}: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label={label} className={cn("w-full", className)} {...props}>
      <ol className="flex flex-wrap items-center gap-sm text-body-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isCurrent = item.current ?? isLast;

          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-sm">
              {index > 0 ? (
                <ChevronRight
                  className="size-4 shrink-0 opacity-60"
                  aria-hidden
                />
              ) : null}
              {isCurrent || !item.href ? (
                <span
                  className={cn(
                    isCurrent && "font-semibold text-foreground",
                  )}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "rounded-sm underline-offset-4 transition-colors duration-fast",
                    "hover:text-foreground hover:underline",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  )}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
