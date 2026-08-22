/**
 * SCREEN-017 — Invoice History constants.
 * Mock invoices only — no Stripe / no PDF generation / no API.
 */

import { MANAGE_MEMBERSHIP_ROUTE } from "@/config/manage-membership";

export const INVOICE_HISTORY_ROUTE = "/invoice-history";

export const INVOICE_HISTORY_DASHBOARD_ROUTE = "/dashboard";

export const INVOICE_HISTORY_BILLING_ROUTE = MANAGE_MEMBERSHIP_ROUTE;

export const INVOICE_HISTORY_PAGE_SIZE = 10;

export const INVOICE_HISTORY_STATES = [
  "loading",
  "success",
  "empty",
  "error",
] as const;

export type InvoiceHistoryState = (typeof INVOICE_HISTORY_STATES)[number];

export const INVOICE_STATUSES = [
  "paid",
  "pending",
  "failed",
  "refunded",
] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  failed: "Failed",
  refunded: "Refunded",
};

export const INVOICE_HISTORY_PLANS = ["pro", "business", "credits"] as const;

export type InvoiceHistoryPlan = (typeof INVOICE_HISTORY_PLANS)[number];

export const INVOICE_HISTORY_PLAN_LABELS: Record<InvoiceHistoryPlan, string> = {
  pro: "Pro",
  business: "Business",
  credits: "Credits pack",
};

export const INVOICE_HISTORY_CYCLES = [
  "monthly",
  "yearly",
  "one_time",
] as const;

export type InvoiceHistoryCycle = (typeof INVOICE_HISTORY_CYCLES)[number];

export const INVOICE_HISTORY_CYCLE_LABELS: Record<InvoiceHistoryCycle, string> =
  {
    monthly: "Monthly",
    yearly: "Yearly",
    one_time: "One-time",
  };

/** Mock date period filters (client-side). */
export const INVOICE_HISTORY_DATE_PRESETS = [
  "all",
  "last_30",
  "last_90",
  "this_year",
] as const;

export type InvoiceHistoryDatePreset =
  (typeof INVOICE_HISTORY_DATE_PRESETS)[number];

export const INVOICE_HISTORY_DATE_PRESET_LABELS: Record<
  InvoiceHistoryDatePreset,
  string
> = {
  all: "All dates",
  last_30: "Last 30 days",
  last_90: "Last 90 days",
  this_year: "This year",
};

export const INVOICE_HISTORY_STATUS_FILTER = [
  "all",
  ...INVOICE_STATUSES,
] as const;

export type InvoiceHistoryStatusFilter =
  (typeof INVOICE_HISTORY_STATUS_FILTER)[number];

export const INVOICE_HISTORY_PLAN_FILTER = [
  "all",
  ...INVOICE_HISTORY_PLANS,
] as const;

export type InvoiceHistoryPlanFilter =
  (typeof INVOICE_HISTORY_PLAN_FILTER)[number];

/** Search query max length (VALIDATION_RULES tone). */
export const INVOICE_HISTORY_SEARCH_MAX_LENGTH = 64;

export const INVOICE_HISTORY_SEARCH_DEBOUNCE_MS = 300;

export const INVOICE_HISTORY_CURRENCY = "USD";

export const INVOICE_HISTORY_COPY = {
  title: "Invoice History",
  breadcrumbDashboard: "Dashboard",
  breadcrumbMembership: "Manage Membership",
  breadcrumbInvoices: "Invoice History",
  searchLabel: "Search invoices",
  searchPlaceholder: "Search by invoice number or plan",
  filterStatus: "Status",
  filterPlan: "Plan",
  filterDate: "Date",
  clearFilters: "Clear filters",
  columnNumber: "Invoice number",
  columnDate: "Date",
  columnPlan: "Plan",
  columnCycle: "Billing cycle",
  columnAmount: "Amount",
  columnStatus: "Status",
  columnActions: "Actions",
  viewInvoice: "View Invoice",
  downloadPdf: "Download PDF",
  downloadSoon: "PDF download coming soon.",
  emptyTitle: "No invoices yet",
  emptyDescription:
    "Your invoices will appear here after your first payment.",
  emptyCta: "Manage Membership",
  noMatchTitle: "No invoices match your filters.",
  noMatchDescription: "Try a different search or clear filters.",
  errorTitle: "Unable to load invoices.",
  errorRetry: "Retry",
  errorBackBilling: "Back to Billing",
  loadingLabel: "Loading invoices",
  listRegion: "Invoice list",
  detailsTitle: "Invoice details",
  detailsClose: "Close invoice details",
  customer: "Customer",
  subtotal: "Subtotal",
  discount: "Discount",
  tax: "Tax",
  total: "Total",
  paymentStatus: "Payment status",
  guestRedirect: "Sign in to view invoice history.",
  allStatuses: "All statuses",
  allPlans: "All plans",
  paginationNav: "Invoice pagination",
} as const;

export const INVOICE_HISTORY_ANALYTICS_SOURCES = {
  page: "invoice_history",
  paymentSuccess: "invoice_history_from_payment_success",
  manageMembership: "invoice_history_from_membership",
} as const;
