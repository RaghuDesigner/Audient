/**
 * Help & Support screen analytics — SCREEN-023.
 * Dev stub — counts and opaque ids only; no PII.
 */

import { HELP_SUPPORT_ANALYTICS_SOURCE } from "@/config/help-support-screen";
import type { HelpSupportTicketStatus } from "@/config/help-support-screen";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function base(extra?: Props): Props {
  return {
    source: HELP_SUPPORT_ANALYTICS_SOURCE,
    mock: true,
    ...extra,
  };
}

export const helpSupportAnalytics = {
  viewed: (props: { tier: string; isGuest: boolean }) => {
    track("help_viewed", base(props));
  },

  search: (props: { queryLength: number; resultCount: number }) => {
    track("help_search", base(props));
  },

  faqOpened: (props: { faqId: string }) => {
    track("faq_opened", base({ ...props, module: "help" }));
  },

  contactClicked: (props: { isGuest: boolean }) => {
    track("support_contact_clicked", base(props));
  },

  ticketViewed: (props: {
    ticketId: string;
    status: HelpSupportTicketStatus;
  }) => {
    track("support_ticket_viewed", base(props));
  },
};
