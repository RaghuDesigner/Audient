"use client";

import { DeleteConfirmationModal } from "@/components/common/DeleteConfirmationModal";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Pagination } from "@/components/common/Pagination";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AuditHistoryCard } from "@/components/history/AuditHistoryCard";
import { AuditHistoryList } from "@/components/history/AuditHistoryList";
import { AuditHistoryToolbar } from "@/components/history/AuditHistoryToolbar";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Footer } from "@/components/layout/footer";
import { SkipLink } from "@/components/layout/skip-link";
import { toast } from "@/components/ui/toast";
import { BodySmall, H1 } from "@/components/ui/typography";
import {
  AUDIT_HISTORY_BREADCRUMB,
  AUDIT_HISTORY_COPY,
  AUDIT_HISTORY_EMPTY,
  type AuditHistoryScreenState,
} from "@/config/audit-history";
import type { MockAuditHistoryCard } from "@/data/mock-audit-history-card";
import { useAuditHistoryScreen } from "@/hooks/use-audit-history-screen";
import { useAuth } from "@/hooks/use-auth";
import {
  useHeaderCredits,
  useHeaderPlanTier,
} from "@/hooks/use-app-state";
import { useUpgradePlansModalOptional } from "@/providers/upgrade-plans-modal-provider";
import { cn } from "@/utils/cn";

export type AuditHistoryScreenProps = {
  audits: MockAuditHistoryCard[];
  screenState: AuditHistoryScreenState;
  onRetry?: () => void;
};

/**
 * SCREEN-009 — Audit History.
 * Mock list: search, filter, sort, pagination, delete — no API.
 */
export function AuditHistoryScreen({
  audits: auditsProp,
  screenState,
  onRetry,
}: AuditHistoryScreenProps) {
  const { user } = useAuth();
  const upgradeModal = useUpgradePlansModalOptional();
  const loading = screenState === "loading";
  const isError = screenState === "error";
  const headerTier = useHeaderPlanTier();
  const headerCredits = useHeaderCredits();
  const history = useAuditHistoryScreen({
    auditsProp,
    loading,
    isError,
  });

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
              label: AUDIT_HISTORY_BREADCRUMB.home,
              href: AUDIT_HISTORY_BREADCRUMB.homeHref,
            },
            { label: AUDIT_HISTORY_BREADCRUMB.current, current: true },
          ]}
        />

        <header className="flex flex-col gap-sm">
          <H1 className="text-foreground">{AUDIT_HISTORY_COPY.pageTitle}</H1>
          <BodySmall className="max-w-2xl text-muted-foreground">
            {AUDIT_HISTORY_COPY.pageDescription}
          </BodySmall>
        </header>

        {isError ? (
          <ErrorState
            variant="generic_error"
            title={AUDIT_HISTORY_EMPTY.error.headline}
            description={AUDIT_HISTORY_EMPTY.error.description}
            primaryLabel={AUDIT_HISTORY_EMPTY.error.primaryLabel}
            onPrimary={onRetry}
            size="section"
          />
        ) : null}

        {!isError ? (
          <AuditHistoryToolbar
            key={history.searchKey}
            query=""
            filters={history.filters}
            sort={history.sort}
            resultCount={history.filteredCount}
            disabled={history.showNeverEmpty}
            loading={loading}
            onSearch={history.onSearch}
            onFiltersChange={history.setFilters}
            onFiltersClear={history.clearFilters}
            onSortChange={history.setSort}
          />
        ) : null}

        {loading ? (
          <ul className="m-0 flex list-none flex-col gap-md p-0">
            {Array.from({ length: 3 }, (_, index) => (
              <li key={`hist-skel-${index}`}>
                <AuditHistoryCard
                  auditId={`loading-${index}`}
                  websiteName=""
                  auditDate={new Date()}
                  status="loading"
                  auditType="website"
                  tier={headerTier}
                  onOpenReport={() => undefined}
                  onDuplicate={() => undefined}
                  onDelete={() => undefined}
                />
              </li>
            ))}
          </ul>
        ) : null}

        {history.showNeverEmpty ? (
          <EmptyState
            variant="no_history"
            headline={AUDIT_HISTORY_EMPTY.never.headline}
            description={AUDIT_HISTORY_EMPTY.never.description}
            primaryLabel={AUDIT_HISTORY_EMPTY.never.primaryLabel}
            onPrimary={history.startAudit}
            size="section"
          />
        ) : null}

        {history.showFilteredEmpty ? (
          <EmptyState
            variant="no_history"
            headline={AUDIT_HISTORY_EMPTY.noMatches.headline}
            description={AUDIT_HISTORY_EMPTY.noMatches.description}
            primaryLabel={AUDIT_HISTORY_EMPTY.noMatches.clearFiltersLabel}
            secondaryLabel={AUDIT_HISTORY_EMPTY.noMatches.primaryLabel}
            onPrimary={history.clearQueryAndFilters}
            onSecondary={history.startAudit}
            size="section"
          />
        ) : null}

        {!loading && !isError && history.pageItems.length > 0 ? (
          <AuditHistoryList
            audits={history.pageItems}
            tier={headerTier}
            onOpen={history.openAudit}
            onDuplicate={() => toast.info(AUDIT_HISTORY_COPY.duplicateSoon)}
            onDelete={history.setPendingDelete}
            onDownloadPdf={() => toast.info(AUDIT_HISTORY_COPY.pdfSoon)}
            onCompare={() => toast.info(AUDIT_HISTORY_COPY.compareSoon)}
            onUpgrade={(source) =>
              upgradeModal?.openPlanComparison({
                source,
                reason: source,
                currentPlan: headerTier,
                focusTier: source.includes("compare") ? "ENTERPRISE" : "PRO",
              })
            }
          />
        ) : null}

        {!loading && !isError && history.filteredCount > 0 ? (
          <Pagination
            currentPage={history.page}
            totalPages={history.pages}
            totalItems={history.filteredCount}
            pageSize={history.pageSize}
            module="history"
            onPageChange={history.setPage}
            onPageSizeChange={history.setPageSize}
          />
        ) : null}
      </main>

      <DeleteConfirmationModal
        open={history.pendingDelete != null}
        auditId={history.pendingDelete?.auditId ?? ""}
        auditLabel={history.pendingDelete?.websiteName}
        state={history.deleteState}
        onCancel={history.cancelDelete}
        onConfirm={history.confirmDelete}
      />

      <Footer variant="minimal" />
    </div>
  );
}
