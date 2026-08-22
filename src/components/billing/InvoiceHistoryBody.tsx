"use client";

import { InvoiceHistoryTable } from "@/components/billing/InvoiceHistoryTable";
import { InvoiceHistoryToolbar } from "@/components/billing/InvoiceHistoryToolbar";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall } from "@/components/ui/typography";
import { INVOICE_HISTORY_COPY } from "@/config/invoice-history";
import type {
  InvoiceHistoryDatePreset,
  InvoiceHistoryPlanFilter,
  InvoiceHistoryStatusFilter,
} from "@/config/invoice-history";
import type { InvoiceHistoryFilters } from "@/utils/invoice-history";
import type { InvoiceHistoryRecord } from "@/utils/invoice-history";

export type InvoiceHistoryBodyProps = {
  loading: boolean;
  isError: boolean;
  catalogCount: number;
  totalItems: number;
  pageItems: readonly InvoiceHistoryRecord[];
  page: number;
  totalPages: number;
  pageSize: number;
  filters: InvoiceHistoryFilters;
  searchDraft: string;
  filtersActive: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: InvoiceHistoryStatusFilter) => void;
  onPlanChange: (value: InvoiceHistoryPlanFilter) => void;
  onDateChange: (value: InvoiceHistoryDatePreset) => void;
  onClear: () => void;
  onRetry?: () => void;
  onBackBilling: () => void;
  onView: (invoice: InvoiceHistoryRecord) => void;
  onDownload: (invoice: InvoiceHistoryRecord) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

/**
 * Invoice History list region — toolbar, states, table, pagination.
 */
export function InvoiceHistoryBody({
  loading,
  isError,
  catalogCount,
  totalItems,
  pageItems,
  page,
  totalPages,
  pageSize,
  filters,
  searchDraft,
  filtersActive,
  onSearchChange,
  onStatusChange,
  onPlanChange,
  onDateChange,
  onClear,
  onRetry,
  onBackBilling,
  onView,
  onDownload,
  onPageChange,
  onPageSizeChange,
}: InvoiceHistoryBodyProps) {
  return (
    <>
      {isError ? (
        <Alert variant="error" assertive>
          <BodySmall className="font-semibold">
            {INVOICE_HISTORY_COPY.errorTitle}
          </BodySmall>
          <div className="mt-md flex flex-wrap gap-sm">
            <Button type="button" variant="primary" size="sm" onClick={onRetry}>
              {INVOICE_HISTORY_COPY.errorRetry}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBackBilling}
            >
              {INVOICE_HISTORY_COPY.errorBackBilling}
            </Button>
          </div>
        </Alert>
      ) : null}

      {!isError ? (
        <InvoiceHistoryToolbar
          filters={filters}
          searchDraft={searchDraft}
          filtersActive={filtersActive}
          disabled={loading}
          onSearchChange={onSearchChange}
          onStatusChange={onStatusChange}
          onPlanChange={onPlanChange}
          onDateChange={onDateChange}
          onClear={onClear}
        />
      ) : null}

      {loading ? (
        <div
          className="flex flex-col gap-md"
          aria-label={INVOICE_HISTORY_COPY.loadingLabel}
        >
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : null}

      {!loading && !isError && catalogCount === 0 ? (
        <EmptyState
          variant="custom"
          headline={INVOICE_HISTORY_COPY.emptyTitle}
          description={INVOICE_HISTORY_COPY.emptyDescription}
          primaryLabel={INVOICE_HISTORY_COPY.emptyCta}
          onPrimary={onBackBilling}
        />
      ) : null}

      {!loading && !isError && catalogCount > 0 && totalItems === 0 ? (
        <EmptyState
          variant="custom"
          headline={INVOICE_HISTORY_COPY.noMatchTitle}
          description={INVOICE_HISTORY_COPY.noMatchDescription}
          primaryLabel={INVOICE_HISTORY_COPY.clearFilters}
          onPrimary={onClear}
        />
      ) : null}

      {!loading && !isError && pageItems.length > 0 ? (
        <>
          <InvoiceHistoryTable
            invoices={pageItems}
            onView={onView}
            onDownload={onDownload}
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            module="billing"
            ariaLabel={INVOICE_HISTORY_COPY.paginationNav}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </>
      ) : null}
    </>
  );
}
