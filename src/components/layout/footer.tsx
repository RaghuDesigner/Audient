import * as React from "react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { cn } from "@/utils/cn";

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  links?: FooterLink[];
  /** marketing | minimal */
  variant?: "marketing" | "minimal";
  copyright?: string;
}

const DEFAULT_LINKS: FooterLink[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

/**
 * Footer — contentinfo landmark (legal / secondary links).
 * Marketing pages use full links; app shell may use minimal.
 */
export function Footer({
  links = DEFAULT_LINKS,
  variant = "marketing",
  copyright = `© ${new Date().getFullYear()} Audient`,
  className,
  ...props
}: FooterProps) {
  return (
    <footer
      className={cn(
        "mt-auto border-t border-border bg-surface pb-safe",
        className,
      )}
      {...props}
    >
      <Container
        maxWidth={variant === "minimal" ? "wide" : "default"}
        className={cn(
          "flex flex-col gap-md py-lg",
          "sm:flex-row sm:items-center sm:justify-between",
        )}
      >
        <p className="text-info text-muted-foreground">{copyright}</p>
        {links.length > 0 ? (
          <nav aria-label="Legal">
            <ul className="flex flex-wrap gap-md">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-info font-semibold text-foreground underline-offset-4",
                      "hover:underline",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      "rounded-sm",
                    )}
                    {...(link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </Container>
    </footer>
  );
}
