"use client";

import { AuditEntry } from "@/components/home/audit-entry";
import { BodyMedium, H1 } from "@/components/ui/typography";
import { cn } from "@/utils/cn";

export type HeroSectionProps = {
  className?: string;
};

/**
 * SCREEN-001 hero — H1, subcopy, audit entry (upload / URL / success).
 * Success state (SCREEN-002) replaces only the entry controls below.
 */
export function HeroSection({ className }: HeroSectionProps) {
  return (
    <section
      className={cn(
        "mx-auto flex w-full max-w-3xl flex-col items-center",
        "px-md py-xl lg:px-lg",
        className,
      )}
      aria-labelledby="home-hero-heading"
    >
      <H1 id="home-hero-heading" className="text-center text-primary">
        Turn Your Website Into a Better User Experience
      </H1>

      <BodyMedium className="mt-md max-w-2xl text-center text-muted-foreground">
        Our AI analyzes your website like an experienced{" "}
        <span className="font-semibold text-secondary">UX consultant</span> and
        provides prioritized recommendations to improve usability,
        accessibility, trust, and conversions.
      </BodyMedium>

      <div className="mt-xl w-full">
        <AuditEntry />
      </div>
    </section>
  );
}
