"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { SupportTicketCard } from "@/components/help/SupportTicketCard";
import { HELP_SUPPORT_COPY } from "@/config/help-support-screen";
import type { HelpSupportTicket } from "@/data/mock-help-support";
import { cn } from "@/utils/cn";

export type HelpSupportRequestsSectionProps = {
  tickets: HelpSupportTicket[];
  onContactSupport: () => void;
  onViewTicket: (ticket: HelpSupportTicket) => void;
  disabled?: boolean;
  className?: string;
};

/**
 * SCREEN-023 — recent support requests list or empty state.
 * Composes SupportTicketCard (COMPONENT-066) per ticket.
 */
export function HelpSupportRequestsSection({
  tickets,
  onContactSupport,
  onViewTicket,
  disabled = false,
  className,
}: HelpSupportRequestsSectionProps) {
  return (
    <section
      className={cn("flex flex-col gap-md", className)}
      aria-labelledby="help-requests-heading"
    >
      <h2
        id="help-requests-heading"
        className="text-body font-semibold text-foreground"
      >
        {HELP_SUPPORT_COPY.requestsHeading}
      </h2>

      {tickets.length === 0 ? (
        <EmptyState
          variant="custom"
          headline={HELP_SUPPORT_COPY.requestsEmptyHeadline}
          description={HELP_SUPPORT_COPY.requestsEmptyDescription}
          primaryLabel={HELP_SUPPORT_COPY.contactCta}
          onPrimary={onContactSupport}
          size="section"
        />
      ) : (
        <ul className="flex flex-col gap-sm">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <SupportTicketCard
                ticket={ticket}
                onView={onViewTicket}
                disabled={disabled}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
