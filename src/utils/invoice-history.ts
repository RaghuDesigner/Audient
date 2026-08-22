/**
 * SCREEN-017 — Invoice History helpers.
 * Search, filters, sort, paginate — no React / no Stripe / no API.
 */

import {
  INVOICE_HISTORY_CYCLE_LABELS,
  INVOICE_HISTORY_CURRENCY,
  INVOICE_HISTORY_DATE_PRESETS,
  INVOICE_HISTORY_PAGE_SIZE,
  INVOICE_HISTORY_PLAN_FILTER,
  INVOICE_HISTORY_PLAN_LABELS,
  INVOICE_HISTORY_PLANS,
  INVOICE_HISTORY_ROUTE,
  INVOICE_HISTORY_SEARCH_MAX_LENGTH,
  INVOICE_HISTORY_STATUS_FILTER,
  INVOICE_STATUSES,
  INVOICE_STATUS_LABELS,
  type InvoiceHistoryCycle,
  type InvoiceHistoryDatePreset,
  type InvoiceHistoryPlan,
  type InvoiceHistoryPlanFilter,
  type InvoiceHistoryStatusFilter,
  type InvoiceStatus,
} from "@/config/invoice-history";
import { formatPrice } from "@/config/plans";
import { formatAuditDate } from "@/utils/recent-audit";

export type InvoiceHistoryRecord = {
  id: string;
  invoiceNumber: string;
  /** ISO date of invoice / charge. */
  dateIso: string;
  plan: InvoiceHistoryPlan;
  cycle: InvoiceHistoryCycle;
  status: InvoiceStatus;
  currency: typeof INVOICE_HISTORY_CURRENCY;
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  customerName: string;
  customerEmail: string;
  /** Owner mock user id — filter to current session only. */
  userId: string;
  /** Stripe hosted invoice URL when available (authorized user only). */
  invoiceUrl?: string | null;
};

export type InvoiceHistoryFilters = {
  query: string;
  status: InvoiceHistoryStatusFilter;
  plan: InvoiceHistoryPlanFilter;
  datePreset: InvoiceHistoryDatePreset;
};

export const DEFAULT_INVOICE_HISTORY_FILTERS: InvoiceHistoryFilters = {
  query: "",
  status: "all",
  plan: "all",
  datePreset: "all",
};

export function isInvoiceStatus(
  value: string | null | undefined,
): value is InvoiceStatus {
  return (
    value != null && (INVOICE_STATUSES as readonly string[]).includes(value)
  );
}

export function isInvoiceHistoryPlan(
  value: string | null | undefined,
): value is InvoiceHistoryPlan {
  return (
    value != null &&
    (INVOICE_HISTORY_PLANS as readonly string[]).includes(value)
  );
}

export function isInvoiceHistoryStatusFilter(
  value: string | null | undefined,
): value is InvoiceHistoryStatusFilter {
  return (
    value != null &&
    (INVOICE_HISTORY_STATUS_FILTER as readonly string[]).includes(value)
  );
}

export function isInvoiceHistoryPlanFilter(
  value: string | null | undefined,
): value is InvoiceHistoryPlanFilter {
  return (
    value != null &&
    (INVOICE_HISTORY_PLAN_FILTER as readonly string[]).includes(value)
  );
}

export function isInvoiceHistoryDatePreset(
  value: string | null | undefined,
): value is InvoiceHistoryDatePreset {
  return (
    value != null &&
    (INVOICE_HISTORY_DATE_PRESETS as readonly string[]).includes(value)
  );
}

export function invoiceStatusLabel(status: InvoiceStatus): string {
  return INVOICE_STATUS_LABELS[status];
}

export function invoicePlanLabel(plan: InvoiceHistoryPlan): string {
  return INVOICE_HISTORY_PLAN_LABELS[plan];
}

export function invoiceCycleLabel(cycle: InvoiceHistoryCycle): string {
  return INVOICE_HISTORY_CYCLE_LABELS[cycle];
}

export function formatInvoiceMoney(cents: number): string {
  return formatPrice(cents);
}

export function formatInvoiceDate(iso: string | Date): string {
  return formatAuditDate(iso);
}

/** Clamp and normalize search input. */
export function normalizeInvoiceSearchQuery(raw: string): string {
  return raw.trim().slice(0, INVOICE_HISTORY_SEARCH_MAX_LENGTH);
}

export function invoiceHistoryFiltersActive(
  filters: InvoiceHistoryFilters,
): boolean {
  return (
    normalizeInvoiceSearchQuery(filters.query).length > 0 ||
    filters.status !== "all" ||
    filters.plan !== "all" ||
    filters.datePreset !== "all"
  );
}

/** Date lower bound for preset relative to `now` (exclusive end = now). */
export function invoiceDatePresetRange(
  preset: InvoiceHistoryDatePreset,
  now: Date = new Date(),
): { from: Date | null; to: Date } {
  const to = now;
  if (preset === "all") return { from: null, to };

  if (preset === "this_year") {
    return { from: new Date(now.getFullYear(), 0, 1), to };
  }

  const from = new Date(now.getTime());
  const days = preset === "last_30" ? 30 : 90;
  from.setDate(from.getDate() - days);
  from.setHours(0, 0, 0, 0);
  return { from, to };
}

export function invoiceMatchesSearch(
  invoice: InvoiceHistoryRecord,
  query: string,
): boolean {
  const q = normalizeInvoiceSearchQuery(query).toLowerCase();
  if (!q) return true;

  const numberHit = invoice.invoiceNumber.toLowerCase().includes(q);
  const planHit = invoicePlanLabel(invoice.plan).toLowerCase().includes(q);
  const planKeyHit = invoice.plan.toLowerCase().includes(q);
  return numberHit || planHit || planKeyHit;
}

export function invoiceMatchesStatus(
  invoice: InvoiceHistoryRecord,
  status: InvoiceHistoryStatusFilter,
): boolean {
  if (status === "all") return true;
  return invoice.status === status;
}

export function invoiceMatchesPlan(
  invoice: InvoiceHistoryRecord,
  plan: InvoiceHistoryPlanFilter,
): boolean {
  if (plan === "all") return true;
  return invoice.plan === plan;
}

export function invoiceMatchesDatePreset(
  invoice: InvoiceHistoryRecord,
  preset: InvoiceHistoryDatePreset,
  now: Date = new Date(),
): boolean {
  if (preset === "all") return true;
  const { from, to } = invoiceDatePresetRange(preset, now);
  const t = new Date(invoice.dateIso).getTime();
  if (!Number.isFinite(t)) return false;
  if (t > to.getTime()) return false;
  if (from && t < from.getTime()) return false;
  return true;
}

export function filterInvoicesForUser(
  invoices: readonly InvoiceHistoryRecord[],
  userId: string | null | undefined,
): InvoiceHistoryRecord[] {
  if (!userId) return [];
  return invoices.filter((inv) => inv.userId === userId);
}

export function filterInvoiceHistory(
  invoices: readonly InvoiceHistoryRecord[],
  filters: InvoiceHistoryFilters,
  now: Date = new Date(),
): InvoiceHistoryRecord[] {
  return invoices.filter(
    (inv) =>
      invoiceMatchesSearch(inv, filters.query) &&
      invoiceMatchesStatus(inv, filters.status) &&
      invoiceMatchesPlan(inv, filters.plan) &&
      invoiceMatchesDatePreset(inv, filters.datePreset, now),
  );
}

/** Newest first by invoice date. */
export function sortInvoicesNewestFirst(
  invoices: readonly InvoiceHistoryRecord[],
): InvoiceHistoryRecord[] {
  return [...invoices].sort((a, b) => {
    const tb = new Date(b.dateIso).getTime();
    const ta = new Date(a.dateIso).getTime();
    return tb - ta;
  });
}

export function paginateInvoices(
  invoices: readonly InvoiceHistoryRecord[],
  page: number,
  pageSize: number = INVOICE_HISTORY_PAGE_SIZE,
): {
  items: InvoiceHistoryRecord[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
} {
  const totalItems = invoices.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: invoices.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
  };
}

/**
 * Full pipeline: user scope → filter → sort → page.
 * Empty catalog vs filtered empty is decided by the screen (all vs filtered length).
 */
export function queryInvoiceHistory(input: {
  invoices: readonly InvoiceHistoryRecord[];
  userId: string | null | undefined;
  filters: InvoiceHistoryFilters;
  page?: number;
  pageSize?: number;
  now?: Date;
}): {
  catalogCount: number;
  filtered: InvoiceHistoryRecord[];
  pageItems: InvoiceHistoryRecord[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  filtersActive: boolean;
} {
  const scoped = filterInvoicesForUser(input.invoices, input.userId);
  const catalogCount = scoped.length;
  const filtered = sortInvoicesNewestFirst(
    filterInvoiceHistory(scoped, input.filters, input.now),
  );
  const pageSize = input.pageSize ?? INVOICE_HISTORY_PAGE_SIZE;
  const pageResult = paginateInvoices(filtered, input.page ?? 1, pageSize);

  return {
    catalogCount,
    filtered,
    pageItems: pageResult.items,
    page: pageResult.page,
    pageSize: pageResult.pageSize,
    totalItems: pageResult.totalItems,
    totalPages: pageResult.totalPages,
    filtersActive: invoiceHistoryFiltersActive(input.filters),
  };
}

export function findInvoiceById(
  invoices: readonly InvoiceHistoryRecord[],
  id: string | null | undefined,
): InvoiceHistoryRecord | null {
  if (!id) return null;
  return invoices.find((inv) => inv.id === id || inv.invoiceNumber === id) ?? null;
}

export function buildInvoiceHistoryHref(input?: {
  invoiceId?: string;
  status?: InvoiceHistoryStatusFilter;
  plan?: InvoiceHistoryPlanFilter;
  q?: string;
}): string {
  const params = new URLSearchParams();
  if (input?.invoiceId) params.set("invoice", input.invoiceId);
  if (input?.status && input.status !== "all") {
    params.set("status", input.status);
  }
  if (input?.plan && input.plan !== "all") params.set("plan", input.plan);
  if (input?.q) params.set("q", normalizeInvoiceSearchQuery(input.q));
  const qs = params.toString();
  return qs ? `${INVOICE_HISTORY_ROUTE}?${qs}` : INVOICE_HISTORY_ROUTE;
}

export function invoiceActionAriaLabel(
  action: "view" | "download",
  invoiceNumber: string,
): string {
  if (action === "view") return `View invoice ${invoiceNumber}`;
  return `Download PDF for invoice ${invoiceNumber}`;
}
