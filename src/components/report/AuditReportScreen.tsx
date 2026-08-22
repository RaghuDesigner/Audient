"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { EmptyState } from "@/components/common/EmptyState";
import { ShareReportModal } from "@/components/common/ShareReportModal";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/layout/footer";
import { SkipLink } from "@/components/layout/skip-link";
import { AuditReportContent } from "@/components/report/AuditReportContent";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import {
  AUDIT_REPORT_EMPTY,
  AUDIT_REPORT_ERROR,
  AUDIT_REPORT_UPGRADE_SOURCES,
  type AuditReportState,
  type AuditReportTier,
} from "@/config/audit-report";
import type { ShareReportModalTier } from "@/config/share-report-modal";
import { MOCK_AUDIT_REPORT_EMPTY_ID } from "@/data/mock-audit-report";
import { MOCK_USER_DISPLAY_NAME } from "@/data/mock-app-state";
import { useAuth } from "@/hooks/use-auth";
import { useAppState } from "@/hooks/use-app-state";
import {
  useAuthenticatedHeaderCredits,
  useAuthenticatedHeaderTier,
} from "@/hooks/use-mock-membership-state";
import { auditReportAnalytics } from "@/lib/analytics/audit-report-events";
import { fetchAuditReportFoundation } from "@/lib/audits/client";
import { useUpgradePlansModalOptional } from "@/providers/upgrade-plans-modal-provider";
import { overlayAuditReportFromFoundation } from "@/utils/ai-report-map";
import {
  getMockAuditReportForTier,
  resolveAuditReportTier,
} from "@/utils/audit-report";
import { isRealAuditId } from "@/utils/audit-id";
import { cn } from "@/utils/cn";
import type { MockAuditReportFull } from "@/data/mock-audit-report";
import type { AuditReportFoundation } from "@/types/audit";

export type AuditReportScreenProps = {
  auditId: string;
  tier?: AuditReportTier;
  state?: AuditReportState;
  onRetry?: () => void;
};

/**
 * SCREEN-010 / M02 — Audit Report shell.
 * Real UUID audits overlay API overall_score / ai_summary onto existing layout.
 */
export function AuditReportScreen({
  auditId,
  tier: tierProp,
  state = "completed",
  onRetry,
}: AuditReportScreenProps) {
  const router = useRouter();
  const { user, isGuest } = useAuth();
  const { effectiveUser } = useAppState();
  const headerCredits = useAuthenticatedHeaderCredits();
  const headerTier = useAuthenticatedHeaderTier();
  const upgradeModal = useUpgradePlansModalOptional();
  const viewed = React.useRef(false);
  const [shareOpen, setShareOpen] = React.useState(false);
  const [apiReport, setApiReport] =
    React.useState<AuditReportFoundation | null>(null);

  const tier =
    tierProp ??
    resolveAuditReportTier(isGuest, effectiveUser?.planTier ?? user?.planTier);
  const shareTier: ShareReportModalTier | null =
    tier === "guest" ? null : tier;
  const isEmpty =
    state === "empty" || auditId === MOCK_AUDIT_REPORT_EMPTY_ID;
  const view =
    state === "completed" && !isEmpty
      ? getMockAuditReportForTier(tier, auditId)
      : null;
  const baseData = view?.data ?? null;
  const data: MockAuditReportFull | null = React.useMemo(() => {
    if (!baseData) return null;
    if (!apiReport) return baseData;
    return overlayAuditReportFromFoundation(baseData, apiReport) ?? baseData;
  }, [apiReport, baseData]);
  const locked =
    view?.kind === "preview"
      ? view.data.locked
      : { findings: 0, recommendations: 0, strengths: 0 };
  const preview = view?.kind === "preview";

  React.useEffect(() => {
    if (!isRealAuditId(auditId) || state !== "completed" || isEmpty) {
      setApiReport(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const report = await fetchAuditReportFoundation(auditId);
        if (!cancelled) setApiReport(report);
      } catch {
        if (!cancelled) setApiReport(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auditId, isEmpty, state]);

  React.useEffect(() => {
    if (state !== "completed" || !data || viewed.current) return;
    viewed.current = true;
    auditReportAnalytics.viewed({
      auditId: data.auditId,
      tier,
      preview,
    });
  }, [state, data, tier, preview]);

  const openUpgrade = (source: string) => {
    if (!data) return;
    auditReportAnalytics.upgradeClicked({
      auditId: data.auditId,
      tier,
      source,
    });
    const focusBusiness =
      source === "compare_report" ||
      source === AUDIT_REPORT_UPGRADE_SOURCES.compare;
    upgradeModal?.openPlanComparison({
      source,
      reason: source,
      currentPlan: tier === "guest" ? "guest" : tier,
      focusTier: focusBusiness ? "ENTERPRISE" : "PRO",
    });
  };

  const header =
    tier === "guest" ? (
      <Header />
    ) : (
      <DashboardHeader
        credits={headerCredits ?? 0}
        displayName={user?.fullName ?? MOCK_USER_DISPLAY_NAME}
        tier={headerTier}
        onCreditsClick={() => openUpgrade(AUDIT_REPORT_UPGRADE_SOURCES.banner)}
      />
    );

  if (state === "loading") {
    return (
      <Shell header={header}>
        <Skeleton className="h-40 w-full rounded-md" />
        <Skeleton className="h-48 w-full rounded-md" />
        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-28 rounded-md" />
          <Skeleton className="h-28 rounded-md" />
          <Skeleton className="h-28 rounded-md" />
        </div>
      </Shell>
    );
  }

  if (state === "error") {
    return (
      <Shell header={header} center>
        <EmptyState
          variant="custom"
          tier={tier === "guest" ? "guest" : tier}
          headline={AUDIT_REPORT_ERROR.headline}
          description={AUDIT_REPORT_ERROR.description}
          primaryLabel={AUDIT_REPORT_ERROR.primaryLabel}
          onPrimary={onRetry}
          size="page"
        />
      </Shell>
    );
  }

  if (isEmpty || !data) {
    return (
      <Shell header={header} center>
        <EmptyState
          variant="no_reports"
          tier={tier === "guest" ? "guest" : tier}
          headline={AUDIT_REPORT_EMPTY.headline}
          description={AUDIT_REPORT_EMPTY.description}
          primaryLabel={AUDIT_REPORT_EMPTY.primaryLabel}
          secondaryLabel={AUDIT_REPORT_EMPTY.secondaryLabel}
          onPrimary={() => router.push("/history")}
          onSecondary={() => router.push("/")}
          size="page"
        />
      </Shell>
    );
  }

  return (
    <Shell header={header}>
      <AuditReportContent
        data={data}
        tier={tier}
        locked={locked}
        onBack={() => router.push(tier === "guest" ? "/" : "/history")}
        onExportPdf={() => {
          /* Mock progress/success live in ExportPdfButton (COMPONENT-030). */
        }}
        onShare={() => {
          auditReportAnalytics.shareReport({
            auditId: data.auditId,
            tier,
          });
          if (!shareTier) {
            openUpgrade(AUDIT_REPORT_UPGRADE_SOURCES.share);
            return;
          }
          setShareOpen(true);
        }}
        onCompare={() => {
          /* Selector + analytics live in CompareReportButton (COMPONENT-032). */
        }}
        onContinueCompare={(peerAuditId) => {
          toast.info(
            `Compare with ${peerAuditId} coming soon (placeholder).`,
          );
        }}
        onUpgrade={openUpgrade}
      />

      {shareTier ? (
        <ShareReportModal
          open={shareOpen}
          auditId={data.auditId}
          reportLabel={data.summary.websiteName}
          auditedAt={data.summary.auditDate}
          score={data.overall.score}
          tier={shareTier}
          onClose={() => setShareOpen(false)}
        />
      ) : null}
    </Shell>
  );
}

function Shell({
  header,
  children,
  center = false,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SkipLink />
      {header}
      <main
        id="main-content"
        className={cn(
          "mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-lg px-md py-lg lg:px-lg",
          center && "justify-center",
        )}
      >
        {children}
      </main>
      <Footer variant="minimal" />
    </div>
  );
}
