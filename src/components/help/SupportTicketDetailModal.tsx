"use client";

import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BodySmall } from "@/components/ui/typography";
import {
  HELP_SUPPORT_COPY,
  HELP_SUPPORT_TICKET_STATUS_LABELS,
  HELP_SUPPORT_TICKET_STATUS_VARIANTS,
} from "@/config/help-support-screen";
import type { HelpSupportTicket } from "@/data/mock-help-support";
import { formatHelpTicketDate } from "@/utils/help-support-screen";

export type SupportTicketDetailModalProps = {
  ticket: HelpSupportTicket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * SCREEN-023 — read-only support ticket detail.
 */
export function SupportTicketDetailModal({
  ticket,
  open,
  onOpenChange,
}: SupportTicketDetailModalProps) {
  if (!ticket) return null;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      scrollable
      title={HELP_SUPPORT_COPY.ticketDetailTitle}
      description={ticket.ticketId}
      footer={
        <div className="flex w-full justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {HELP_SUPPORT_COPY.ticketDetailClose}
          </Button>
        </div>
      }
    >
      <dl className="flex flex-col gap-md">
        <div className="flex flex-col gap-xs">
          <BodySmall as="dt" className="font-semibold text-foreground">
            {HELP_SUPPORT_COPY.ticketDetailSubject}
          </BodySmall>
          <dd className="text-body-sm text-foreground">{ticket.subject}</dd>
        </div>
        <div className="flex flex-col gap-xs">
          <BodySmall as="dt" className="font-semibold text-foreground">
            {HELP_SUPPORT_COPY.ticketDetailStatus}
          </BodySmall>
          <dd>
            <Badge variant={HELP_SUPPORT_TICKET_STATUS_VARIANTS[ticket.status]}>
              {HELP_SUPPORT_TICKET_STATUS_LABELS[ticket.status]}
            </Badge>
          </dd>
        </div>
        <div className="flex flex-col gap-xs">
          <BodySmall as="dt" className="font-semibold text-foreground">
            {HELP_SUPPORT_COPY.ticketDetailSubmitted}
          </BodySmall>
          <dd className="text-body-sm text-muted-foreground">
            {formatHelpTicketDate(ticket.submittedAt)}
          </dd>
        </div>
        <div className="flex flex-col gap-xs">
          <BodySmall as="dt" className="font-semibold text-foreground">
            {HELP_SUPPORT_COPY.ticketDetailMessage}
          </BodySmall>
          <dd className="whitespace-pre-wrap text-body-sm text-foreground">
            {ticket.message}
          </dd>
        </div>
      </dl>
    </Modal>
  );
}
