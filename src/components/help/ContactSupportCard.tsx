"use client";

import { Button } from "@/components/ui/button";
import { BodySmall } from "@/components/ui/typography";
import { CONTACT_SUPPORT_CARD_COPY } from "@/config/contact-support-card";
import { cn } from "@/utils/cn";

export type ContactSupportCardProps = {
  /** Opens Contact Support modal (auth) or login (guest) — parent wired. */
  onContactSupport: () => void;
  heading?: string;
  description?: string;
  ctaLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  id?: string;
};

/**
 * COMPONENT-065 — Contact Support Card.
 * Still need help? band — mock contact flow only; no external helpdesk.
 */
export function ContactSupportCard({
  onContactSupport,
  heading = CONTACT_SUPPORT_CARD_COPY.heading,
  description = CONTACT_SUPPORT_CARD_COPY.description,
  ctaLabel = CONTACT_SUPPORT_CARD_COPY.cta,
  disabled = false,
  loading = false,
  className,
  id,
}: ContactSupportCardProps) {
  const headingId = id ?? "contact-support-card-heading";

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "rounded-lg border border-border bg-surface p-lg",
        "flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-col gap-xs">
        <h2
          id={headingId}
          className="text-body font-semibold text-foreground"
        >
          {heading}
        </h2>
        <BodySmall className="text-muted-foreground">{description}</BodySmall>
      </div>
      <Button
        type="button"
        variant="primary"
        className="min-h-11 w-full text-primary-foreground sm:w-auto"
        disabled={disabled}
        isLoading={loading}
        onClick={onContactSupport}
      >
        {ctaLabel}
      </Button>
    </section>
  );
}
