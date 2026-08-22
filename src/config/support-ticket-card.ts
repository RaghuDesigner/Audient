/**
 * COMPONENT-066 — Support Ticket Card constants.
 * Mock ticket row copy — no backend / no helpdesk.
 */

import { HELP_SUPPORT_COPY } from "@/config/help-support-screen";

export const SUPPORT_TICKET_CARD_COPY = {
  view: HELP_SUPPORT_COPY.viewTicket,
  viewLabel: HELP_SUPPORT_COPY.viewTicketLabel,
} as const;

export const SUPPORT_TICKET_CARD_ANALYTICS_SOURCE =
  "support_ticket_card" as const;
