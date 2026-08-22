/**
 * SCREEN-023 — Help & Support mock content.
 * Articles, FAQs, tickets — no API / no Supabase.
 */

import type { FaqAccordionItem } from "@/config/faq-accordion";
import type {
  HelpSupportCategory,
  HelpSupportScreenState,
  HelpSupportTicketStatus,
} from "@/config/help-support-screen";
import {
  HELP_SUPPORT_ROLES_ROUTE,
  HELP_SUPPORT_WORKSPACE_ROUTE,
} from "@/config/help-support-screen";

export type HelpSupportArticle = {
  id: string;
  title: string;
  summary: string;
  category: HelpSupportCategory;
  tags: string[];
  /** Included in guest search corpus when true. */
  guestVisible: boolean;
};

export type HelpSupportTicket = {
  id: string;
  ticketId: string;
  subject: string;
  message: string;
  submittedAt: string;
  status: HelpSupportTicketStatus;
};

export type MockHelpSupportBundle = {
  state: HelpSupportScreenState;
  articles: HelpSupportArticle[];
  faqs: FaqAccordionItem[];
  faqCategories: Record<string, HelpSupportCategory>;
  tickets: HelpSupportTicket[];
};

export const MOCK_HELP_ARTICLES: HelpSupportArticle[] = [
  {
    id: "article-first-audit",
    title: "Run your first audit",
    summary:
      "Upload a screenshot or enter a URL to start an AI UX audit from Home or Dashboard.",
    category: "getting_started",
    tags: ["audit", "screenshot", "url", "credits"],
    guestVisible: true,
  },
  {
    id: "article-credits-overview",
    title: "Understanding credits",
    summary:
      "Credits are spent per audit type. Free, Pro, and Business tiers have different costs and monthly grants.",
    category: "getting_started",
    tags: ["credits", "pricing", "plans"],
    guestVisible: true,
  },
  {
    id: "article-screenshot-vs-url",
    title: "Screenshot vs URL audits",
    summary:
      "Screenshot audits analyze an uploaded image. URL audits crawl a live site — available on Pro and Business.",
    category: "audits",
    tags: ["screenshot", "url", "processing"],
    guestVisible: true,
  },
  {
    id: "article-audit-failed",
    title: "When an audit fails",
    summary:
      "Failed audits refund credits. Retry with a supported image or check your URL, then contact support if the issue continues.",
    category: "audits",
    tags: ["failure", "retry", "refund"],
    guestVisible: true,
  },
  {
    id: "article-read-report",
    title: "Reading your audit report",
    summary:
      "Reports include overall score, category scores, findings, strengths, and recommendations.",
    category: "reports",
    tags: ["report", "scores", "findings"],
    guestVisible: true,
  },
  {
    id: "article-export-pdf",
    title: "Export a report to PDF",
    summary:
      "Open a completed audit report and use Export PDF. PDF download is included on Pro and Business plans.",
    category: "reports",
    tags: ["pdf", "export", "download"],
    guestVisible: true,
  },
  {
    id: "article-pro-included",
    title: "What is included in Pro",
    summary:
      "Pro includes 1,000 monthly credits, URL audits, full reports, PDF export, history, and credit top-ups.",
    category: "membership",
    tags: ["pro", "upgrade", "features"],
    guestVisible: true,
  },
  {
    id: "article-business-membership",
    title: "How Business membership works",
    summary:
      "Business adds a team workspace, higher credit pool, role management, and Business billing surfaces.",
    category: "membership",
    tags: ["business", "enterprise", "team"],
    guestVisible: true,
  },
  {
    id: "article-invoices",
    title: "Invoices and payment history",
    summary:
      "View invoices and payment details from Billing & Payments in your account.",
    category: "billing_payments",
    tags: ["invoice", "billing", "payment"],
    guestVisible: false,
  },
  {
    id: "article-team-members",
    title: "Manage team members",
    summary:
      "Invite teammates from Business Workspace and assign roles on Roles & Permissions.",
    category: "team_business",
    tags: ["team", "invite", "roles", "workspace"],
    guestVisible: false,
  },
  {
    id: "article-sso",
    title: "Sign in with SSO",
    summary:
      "Audient supports Google, Apple, and Microsoft sign-in. Manage profile details in Account Settings.",
    category: "account_security",
    tags: ["sso", "login", "security", "profile"],
    guestVisible: true,
  },
];

export const MOCK_HELP_FAQS: FaqAccordionItem[] = [
  {
    id: "faq-run-audit",
    question: "How do I run an audit?",
    answer:
      "From Home or Dashboard, upload a supported screenshot (PNG, JPG, JPEG, or WebP) or enter a website URL on Pro and Business. Each audit spends credits based on your plan. You will see a processing screen while the audit runs.",
  },
  {
    id: "faq-pro-included",
    question: "What is included in Pro?",
    answer:
      "Pro is $29 per month and includes 1,000 monthly credits, URL audits, full on-screen reports, PDF export, audit history, and the ability to buy credit top-ups. Monthly plan credits reset each billing period; purchased top-ups roll over.",
  },
  {
    id: "faq-business-membership",
    question: "How does Business membership work?",
    answer:
      "Business ($99 per month) includes 10,000 monthly credits, lower per-audit costs, a Business Workspace for your team, member invites, and role management. Visit Business Workspace and Roles & Permissions after upgrading.",
  },
  {
    id: "faq-credits-calculated",
    question: "How are credits calculated?",
    answer:
      "Credits depend on your plan and audit type. Free screenshot audits cost 150 credits; Pro screenshot audits cost 100; Business screenshot audits cost 50. URL audits cost 400 on Pro and 100 on Business. Failed audits refund the spent credits.",
  },
  {
    id: "faq-export-pdf",
    question: "How do I export an audit report?",
    answer:
      "Open a completed audit report and select Export PDF. PDF export is available on Pro and Business. Free accounts can review a brief on-screen summary.",
  },
  {
    id: "faq-manage-team",
    question: "How do I manage team members?",
    answer:
      "On Business, open Business Workspace to invite members and review activity. Assign roles from Roles & Permissions. Owners and Admins can change member roles; changes are saved when you confirm and save.",
  },
];

export const MOCK_HELP_FAQ_CATEGORIES: Record<string, HelpSupportCategory> = {
  "faq-run-audit": "getting_started",
  "faq-pro-included": "membership",
  "faq-business-membership": "membership",
  "faq-credits-calculated": "getting_started",
  "faq-export-pdf": "reports",
  "faq-manage-team": "team_business",
};

export const MOCK_HELP_TICKETS: HelpSupportTicket[] = [
  {
    id: "ticket-1042",
    ticketId: "AUD-1042",
    subject: "Export PDF not downloading",
    message:
      "The Export PDF button completes but no file downloads in Chrome on macOS.",
    submittedAt: "2026-08-10T14:22:00.000Z",
    status: "pending",
  },
  {
    id: "ticket-1038",
    ticketId: "AUD-1038",
    subject: "Question about Business credits",
    message:
      "How do monthly Business credits reset compared to purchased top-ups?",
    submittedAt: "2026-08-02T09:15:00.000Z",
    status: "resolved",
  },
  {
    id: "ticket-1021",
    ticketId: "AUD-1021",
    subject: "Unable to invite teammate",
    message:
      "Invite sent from Business Workspace shows pending but colleague did not receive email.",
    submittedAt: "2026-07-28T16:40:00.000Z",
    status: "open",
  },
];

/** Deep-link hints embedded in FAQ answers — plain text only this phase. */
export const MOCK_HELP_DEEP_LINKS = {
  workspace: HELP_SUPPORT_WORKSPACE_ROUTE,
  roles: HELP_SUPPORT_ROLES_ROUTE,
} as const;

export function getMockHelpSupportBundle(input?: {
  state?: HelpSupportScreenState;
  emptyRequests?: boolean;
  userId?: string;
}): MockHelpSupportBundle {
  const state = input?.state ?? "success";

  if (state === "loading") {
    return {
      state: "loading",
      articles: [],
      faqs: [],
      faqCategories: {},
      tickets: [],
    };
  }

  if (state === "error") {
    return {
      state: "error",
      articles: [],
      faqs: [],
      faqCategories: {},
      tickets: [],
    };
  }

  const emptyRequests =
    input?.emptyRequests === true || state === "empty-requests";

  return {
    state: "success",
    articles: MOCK_HELP_ARTICLES,
    faqs: MOCK_HELP_FAQS,
    faqCategories: MOCK_HELP_FAQ_CATEGORIES,
    tickets: emptyRequests ? [] : MOCK_HELP_TICKETS,
  };
}
