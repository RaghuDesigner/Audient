/**
 * SCREEN-023 — Help & Support screen constants.
 * Mock help center — no backend / no Supabase / no helpdesk integration.
 */

import { BUSINESS_WORKSPACE_ROUTE } from "@/config/business-workspace-screen";
import { ROLES_PERMISSIONS_ROUTE } from "@/config/roles-permissions-screen";

export const HELP_SUPPORT_ROUTE = "/help";

export const HELP_SUPPORT_DASHBOARD_ROUTE = "/dashboard";

export const HELP_SUPPORT_WORKSPACE_ROUTE = BUSINESS_WORKSPACE_ROUTE;

export const HELP_SUPPORT_ROLES_ROUTE = ROLES_PERMISSIONS_ROUTE;

export const HELP_SUPPORT_STATES = [
  "loading",
  "success",
  "error",
  "empty-requests",
] as const;

export type HelpSupportScreenState = (typeof HELP_SUPPORT_STATES)[number];

/** Support category keys — fixed set for SCREEN-023. */
export const HELP_SUPPORT_CATEGORIES = [
  "getting_started",
  "audits",
  "reports",
  "membership",
  "billing_payments",
  "team_business",
  "account_security",
] as const;

export type HelpSupportCategory = (typeof HELP_SUPPORT_CATEGORIES)[number];

export const HELP_SUPPORT_CATEGORY_LABELS: Record<HelpSupportCategory, string> =
  {
    getting_started: "Getting Started",
    audits: "Audits",
    reports: "Reports",
    membership: "Membership",
    billing_payments: "Billing & Payments",
    team_business: "Team & Business",
    account_security: "Account & Security",
  };

export const HELP_SUPPORT_TICKET_STATUSES = [
  "open",
  "pending",
  "resolved",
] as const;

export type HelpSupportTicketStatus =
  (typeof HELP_SUPPORT_TICKET_STATUSES)[number];

export const HELP_SUPPORT_TICKET_STATUS_LABELS: Record<
  HelpSupportTicketStatus,
  string
> = {
  open: "Open",
  pending: "Pending",
  resolved: "Resolved",
};

/** Badge variant map — token-based; text label always shown. */
export const HELP_SUPPORT_TICKET_STATUS_VARIANTS: Record<
  HelpSupportTicketStatus,
  "info" | "warning" | "success"
> = {
  open: "info",
  pending: "warning",
  resolved: "success",
};

export const HELP_SUPPORT_COPY = {
  pageTitle: "Help & Support",
  pageDescription:
    "Find answers, browse guides, or contact our team.",
  breadcrumbDashboard: "Dashboard",
  breadcrumbCurrent: "Help & Support",
  searchLabel: "Search help articles",
  searchPlaceholder: "Search help articles",
  searchNoResults: "No articles match your search.",
  searchNoResultsHint: "Try different keywords or contact support.",
  categoriesHeading: "Support categories",
  faqHeading: "Frequently asked questions",
  contactHeading: "Still need help?",
  contactDescription:
    "Our team typically responds within one business day.",
  contactCta: "Contact Support",
  requestsHeading: "Recent support requests",
  requestsEmptyHeadline: "No support requests yet.",
  requestsEmptyDescription:
    "When you contact support, your requests will appear here.",
  viewTicket: "View",
  viewTicketLabel: (ticketId: string) => `View support request ${ticketId}`,
  loadError: "Unable to load help content.",
  retry: "Retry",
  guestRedirect: "Redirecting to sign in…",
  loading: "Loading help and support…",
  contactModalTitle: "Contact Support",
  contactModalDescription:
    "Describe your issue and we will follow up by email. Mock submit only — no ticket is created on a live system.",
  contactSubjectLabel: "Subject",
  contactSubjectPlaceholder: "Brief summary of your issue",
  contactMessageLabel: "Message",
  contactMessagePlaceholder: "Tell us what happened and how we can help",
  contactSubmit: "Send request",
  contactSubmitting: "Sending…",
  contactCancel: "Cancel",
  contactSuccess: "Request received. We will respond within one business day.",
  contactValidationSubject: "Enter a subject.",
  contactValidationMessage: "Enter a message.",
  ticketDetailTitle: "Support request",
  ticketDetailClose: "Close",
  ticketDetailStatus: "Status",
  ticketDetailSubmitted: "Submitted",
  ticketDetailSubject: "Subject",
  ticketDetailMessage: "Message",
} as const;

export const HELP_SUPPORT_SEARCH_DEBOUNCE_MS = 300 as const;

export const HELP_SUPPORT_MOCK_SUBMIT_DELAY_MS = 500 as const;

export const HELP_SUPPORT_ANALYTICS_SOURCE = "help_support_screen" as const;

/** QA: `?state=loading|success|error|empty-requests` on `/help`. */
export const HELP_SUPPORT_QA_STATE_PARAM = "state" as const;
