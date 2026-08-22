import Link from "next/link";

import { cn } from "@/utils/cn";

export type LogoProps = {
  href?: string;
  className?: string;
};

/**
 * Audient brand mark + wordmark + tagline (Screen1 header).
 */
export function Logo({ href = "/", className }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 rounded-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- brand SVG */}
      <img
        src="/brand/Logo_2.svg"
        alt="Audient — Audit, Analyze, Elevate UX"
        width={182}
        height={45}
        className="h-9 w-auto sm:h-11"
      />
    </Link>
  );
}
