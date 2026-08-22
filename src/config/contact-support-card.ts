/**
 * COMPONENT-065 — Contact Support Card constants.
 * Reuses Help & Support copy — mock flow only; no helpdesk.
 */

import { HELP_SUPPORT_COPY } from "@/config/help-support-screen";

export const CONTACT_SUPPORT_CARD_COPY = {
  heading: HELP_SUPPORT_COPY.contactHeading,
  description: HELP_SUPPORT_COPY.contactDescription,
  cta: HELP_SUPPORT_COPY.contactCta,
} as const;

export const CONTACT_SUPPORT_CARD_ANALYTICS_SOURCE =
  "contact_support_card" as const;
