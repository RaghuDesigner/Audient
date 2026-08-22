"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { BillingSummary } from "@/components/billing/BillingSummary";
import { InvoiceDetailsModal } from "@/components/billing/InvoiceDetailsModal";
import { InvoiceHistoryBody } from "@/components/billing/InvoiceHistoryBody";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Footer } from "@/components/layout/footer";
import { SkipLink } from "@/components/layout/skip-link";
import { toast } from "@/components/ui/toast";
import { H1 } from "@/components/ui/typography";
import {
  INVOICE_HISTORY_BILLING_ROUTE,
  INVOICE_HISTORY_COPY,
  INVOICE_HISTORY_DASHBOARD_ROUTE,
  INVOICE_HISTORY_PAGE_SIZE,
  INVOICE_HISTORY_SEARCH_DEBOUNCE_MS,
} from "@/config/invoice-history";
import {
  MOCK_INVOICE_HISTORY_PRO,
  type MockInvoiceHistory,
} from "@/data/mock-invoice-history";
import { useAuth } from "@/hooks/use-auth";
import { invoiceHistoryAnalytics } from "@/lib/analytics/invoice-history-events";
import {
  useHeaderCredits,
  useHeaderPlanTier,
} from "@/hooks/use-app-state";
import {
  DEFAULT_INVOICE_HISTORY_FILTERS,
  findInvoiceById,
  queryInvoiceHistory,
  type InvoiceHistoryFilters,
  type InvoiceHistoryRecord,
} from "@/utils/invoice-history";
import { cn } from "@/utils/cn";

export type InvoiceHistoryScreenProps = {
  data?: MockInvoiceHistory;
  onRetry?: () => void;
};

/**
 * SCREEN-017 — Invoice History.
 * Mock list + filters + details modal — no Stripe / no PDF / no API.
 */
export function InvoiceHistoryScreen({
  data = MOCK_INVOICE_HISTORY_PRO,
  onRetry,
}: InvoiceHistoryScreenProps) {
  const router = useRouter();
  const { user } = useAuth();
  const headerTier = useHeaderPlanTier();
  const headerCredits = useHeaderCredits();
  const viewed = React.useRef(false);
  const lastSearch = React.useRef("");
  const [filters, setFilters] = React.useState<InvoiceHistoryFilters>(
    DEFAULT_INVOICE_HISTORY_FILTERS,
  );
  const [searchDraft, setSearchDraft] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(INVOICE_HISTORY_PAGE_SIZE);
  const [detailId, setDetailId] = React.useState<string | null>(
    data.initialInvoiceId ?? null,
  );

  const loading = data.state === "loading";
  const isError = data.state === "error";

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      setFilters((prev) =>
        prev.query === searchDraft ? prev : { ...prev, query: searchDraft },
      );
      setPage(1);
    }, INVOICE_HISTORY_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [searchDraft]);

  const query = queryInvoiceHistory({
    invoices: data.invoices,
    userId: user?.id,
    filters,
    page,
    pageSize,
  });

  React.useEffect(() => {
    if (viewed.current || loading || isError) return;
    viewed.current = true;
    invoiceHistoryAnalytics.viewed({ catalogCount: query.catalogCount });
  }, [isError, loading, query.catalogCount]);

  React.useEffect(() => {
    if (!filters.query || filters.query === lastSearch.current) return;
    lastSearch.current = filters.query;
    invoiceHistoryAnalytics.search({
      queryLength: filters.query.length,
      resultCount: query.totalItems,
    });
  }, [filters.query, query.totalItems]);

  const detailInvoice =
    findInvoiceById(data.invoices, detailId) ??
    findInvoiceById(query.filtered, detailId);

  const openDetail = (invoice: InvoiceHistoryRecord) => {
    setDetailId(invoice.id);
    invoiceHistoryAnalytics.invoiceViewed({
      invoiceId: invoice.invoiceNumber,
      plan: invoice.plan,
      status: invoice.status,
    });
  };

  const download = (invoice: InvoiceHistoryRecord) => {
    invoiceHistoryAnalytics.downloadClicked({
      invoiceId: invoice.invoiceNumber,
      plan: invoice.plan,
      status: invoice.status,
    });
    if (invoice.invoiceUrl) {
      window.open(invoice.invoiceUrl, "_blank", "noopener,noreferrer");
      return;
    }
    toast.info(INVOICE_HISTORY_COPY.downloadSoon);
  };

  const goBilling = () => router.push(INVOICE_HISTORY_BILLING_ROUTE);
  const clearFilters = () => {
    setFilters(DEFAULT_INVOICE_HISTORY_FILTERS);
    setSearchDraft("");
    setPage(1);
    invoiceHistoryAnalytics.filterUsed({ filterType: "clear" });
  };


  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SkipLink />
      <DashboardHeader
        credits={headerCredits}
        displayName={user?.fullName ?? null}
        tier={headerTier}
      />
      <main
        id="main-content"
        className={cn(
          "mx-auto flex w-full max-w-6xl flex-1 flex-col gap-lg",
          "px-md py-lg lg:px-lg",
        )}
        aria-busy={loading || undefined}
      >
        <Breadcrumb
          items={[
            {
              label: INVOICE_HISTORY_COPY.breadcrumbDashboard,
              href: INVOICE_HISTORY_DASHBOARD_ROUTE,
            },
            {
              label: INVOICE_HISTORY_COPY.breadcrumbMembership,
              href: INVOICE_HISTORY_BILLING_ROUTE,
            },
            { label: INVOICE_HISTORY_COPY.breadcrumbInvoices, current: true },
          ]}
        />
        <H1 className="text-foreground">{INVOICE_HISTORY_COPY.title}</H1>
        <BillingSummary
          state={loading ? "loading" : data.billing.state}
          plan={data.billing.plan}
          billingCycle={data.billing.billingCycle}
          renewalDate={data.billing.renewalDate}
          currentPrice={data.billing.currentPrice}
          paymentMethodLabel={data.billing.paymentMethodLabel}
          hasInvoices={data.billing.hasInvoices}
          statusDetail={data.billing.statusDetail}
          onManageBilling={goBilling}
        />
        <InvoiceHistoryBody
          loading={loading}
          isError={isError}
          catalogCount={query.catalogCount}
          totalItems={query.totalItems}
          pageItems={query.pageItems}
          page={query.page}
          totalPages={query.totalPages}
          pageSize={pageSize}
          filters={filters}
          searchDraft={searchDraft}
          filtersActive={query.filtersActive}
          onSearchChange={setSearchDraft}
          onStatusChange={(status) => {
            setFilters((f) => ({ ...f, status }));
            setPage(1);
            invoiceHistoryAnalytics.filterUsed({
              filterType: "status",
              value: status,
            });
          }}
          onPlanChange={(plan) => {
            setFilters((f) => ({ ...f, plan }));
            setPage(1);
            invoiceHistoryAnalytics.filterUsed({
              filterType: "plan",
              value: plan,
            });
          }}
          onDateChange={(datePreset) => {
            setFilters((f) => ({ ...f, datePreset }));
            setPage(1);
            invoiceHistoryAnalytics.filterUsed({
              filterType: "date",
              value: datePreset,
            });
          }}
          onClear={clearFilters}
          onRetry={onRetry}
          onBackBilling={goBilling}
          onView={openDetail}
          onDownload={download}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </main>
      <InvoiceDetailsModal
        invoice={detailInvoice}
        open={detailInvoice != null}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
        onDownload={download}
      />
      <Footer />
    </div>
  );
}
