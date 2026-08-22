"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BodySmall } from "@/components/ui/typography";
import { SUPPORT_TICKET_CARD_COPY } from "@/config/support-ticket-card";
import {
  HELP_SUPPORT_TICKET_STATUS_LABELS,
  HELP_SUPPORT_TICKET_STATUS_VARIANTS,
} from "@/config/help-support-screen";
import type { HelpSupportTicket } from "@/data/mock-help-support";
import { formatHelpTicketDate } from "@/utils/help-support-screen";
import { cn } from "@/utils/cn";

export type SupportTicketCardProps = {
  ticket: HelpSupportTicket;
  onView: (ticket: HelpSupportTicket) => void;
  viewLabel?: string;
  disabled?: boolean;
  className?: string;
};

/**
 * COMPONENT-066 — Support Ticket Card.
 * Mock support request summary — read-only; no ticketing backend.
 */
export function SupportTicketCard({
  ticket,
  onView,
  viewLabel = SUPPORT_TICKET_CARD_COPY.view,
  disabled = false,
  className,
}: SupportTicketCardProps) {
  const statusLabel = HELP_SUPPORT_TICKET_STATUS_LABELS[ticket.status];
  const statusVariant = HELP_SUPPORT_TICKET_STATUS_VARIANTS[ticket.status];

  return (
    <Card
      padding="md"
      variant="default"
      className={cn(className)}
      aria-disabled={disabled || undefined}
    >
      <CardContent className="gap-md sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-xs">
          <div className="flex flex-wrap items-center gap-sm">
            <BodySmall className="font-mono font-semibold text-foreground">
              {ticket.ticketId}
            </BodySmall>
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          </div>
          <p className="truncate text-body-sm font-medium text-foreground">
            {ticket.subject}
          </p>
          <BodySmall className="text-muted-foreground">
            <time dateTime={ticket.submittedAt}>
              {formatHelpTicketDate(ticket.submittedAt)}
            </time>
          </BodySmall>
        </div>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-full shrink-0 sm:w-auto"
          disabled={disabled}
          aria-label={SUPPORT_TICKET_CARD_COPY.viewLabel(ticket.ticketId)}
          onClick={() => onView(ticket)}
        >
          {viewLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
