"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { EmptyState } from "@/components/common/EmptyState";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Header } from "@/components/home/header";
import { AuditReportCompletedView } from "@/components/report/AuditReportCompletedView";
import {
  AuditReportLoadingSkeleton,
  AuditReportShell,
  AuditReportStatusEmpty,
} from "@/components/report/AuditReportShell";
import { RealAuditReportGate } from "@/components/report/RealAuditReportGate";
import { toast } from "@/components/ui/toast";
import {
  AUDIT_REPORT_ERROR,
  AUDIT_REPORT_UPGRADE_SOURCES,
  type AuditReportState,
  type AuditReportTier,
} from "@/config/audit-report";
import type { ShareReportModalTier } from "@/config/share-report-modal";
import {
  MOCK_AUDIT_REPORT_EMPTY_ID,
  type MockAuditReportFull,
} from "@/data/mock-audit-report";
import { MOCK_USER_DISPLAY_NAME } from "@/data/mock-app-state";
import { useAuth } from "@/hooks/use-auth";
import { useAppState } from "@/hooks/use-app-state";
import {
  useAuthenticatedHeaderCredits,
  useAuthenticatedHeaderTier,
} from "@/hooks/use-mock-membership-state";
import { useRealAuditReport } from "@/hooks/use-real-audit-report";
import { auditReportAnalytics } from "@/lib/analytics/audit-report-events";
import { useUpgradePlansModalOptional } from "@/providers/upgrade-plans-modal-provider";
import { buildAuditReportFromFoundation } from "@/utils/ai-report-map";
import {
  applyAuditReportTierLimits,
  getMockAuditReportForTier,
  lockedCountsForAuditReportTier,
  resolveAuditReportTier,
} from "@/utils/audit-report";
import { isRealAuditId } from "@/utils/audit-id";
import { auditProcessingRoute } from "@/utils/audit-processing-route";

export type AuditReportScreenProps = {
  auditId: string;
  tier?: AuditReportTier;
  state?: AuditReportState;
  onRetry?: () => void;
};

/**
 * SCREEN-010 / M02 — Audit Report shell.
 * Real UUID audits load only from the report API (fail-closed).
 * mock-* ids keep the Phase-1 mock payload path.
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
  const [retryToken, setRetryToken] = React.useState(0);
  const real = isRealAuditId(auditId);

  const tier =
    tierProp ??
    resolveAuditReportTier(isGuest, effectiveUser?.planTier ?? user?.planTier);
  const shareTier: ShareReportModalTier | null =
    tier === "guest" ? null : tier;
  const isEmpty =
    state === "empty" || auditId === MOCK_AUDIT_REPORT_EMPTY_ID;
  const emptyTier = tier === "guest" ? "guest" : tier;

  const { report: apiReport, status: realStatus } = useRealAuditReport({
    auditId,
    enabled: real,
    state,
    isEmpty,
    retryToken,
  });

  const mockView =
    !real && state === "completed" && !isEmpty
      ? getMockAuditReportForTier(tier, auditId)
      : null;

  const realData: MockAuditReportFull | null = React.useMemo(() => {
    if (!real || !apiReport) return null;
    const planUsed =
      tier === "business" ? "business" : tier === "pro" ? "pro" : "free";
    const built = buildAuditReportFromFoundation(apiReport, planUsed);
    if (!built) return null;
    return applyAuditReportTierLimits(built, tier);
  }, [apiReport, real, tier]);

  const data: MockAuditReportFull | null = real
    ? realData
    : (mockView?.data ?? null);
  const locked = real
    ? lockedCountsForAuditReportTier(realData, tier)
    : mockView?.kind === "preview"
      ? mockView.data.locked
      : { findings: 0, recommendations: 0, strengths: 0 };
  const preview = real
    ? tier === "guest" || tier === "free"
    : mockView?.kind === "preview";

  React.useEffect(() => {
    if (state !== "completed" || !data || viewed.current) return;
    if (real && realStatus !== "ready") return;
    viewed.current = true;
    auditReportAnalytics.viewed({
      auditId: data.auditId,
      tier,
      preview,
    });
  }, [state, data, tier, preview, real, realStatus]);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
      return;
    }
    setRetryToken((n) => n + 1);
  };

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

  if (!real && state === "loading") {
    return (
      <AuditReportShell header={header}>
        <AuditReportLoadingSkeleton />
      </AuditReportShell>
    );
  }

  if (!real && state === "error") {
    return (
      <AuditReportShell header={header} center>
        <EmptyState
          variant="custom"
          tier={emptyTier}
          headline={AUDIT_REPORT_ERROR.headline}
          description={AUDIT_REPORT_ERROR.description}
          primaryLabel={AUDIT_REPORT_ERROR.primaryLabel}
          onPrimary={onRetry}
          size="page"
        />
      </AuditReportShell>
    );
  }

  if (real && realStatus !== "ready" && realStatus !== "idle") {
    return (
      <RealAuditReportGate
        header={header}
        tier={emptyTier}
        status={state === "loading" ? "loading" : realStatus}
        auditId={auditId}
        onRetry={handleRetry}
        onOpenProcessing={(id) => router.push(auditProcessingRoute(id))}
        onHistory={() => router.push("/history")}
        onHome={() => router.push("/")}
      />
    );
  }

  if (!data || isEmpty) {
    return (
      <AuditReportShell header={header} center>
        <AuditReportStatusEmpty
          tier={emptyTier}
          kind="not_found"
          onPrimary={() => router.push("/history")}
          onSecondary={() => router.push("/")}
        />
      </AuditReportShell>
    );
  }

  return (
    <AuditReportCompletedView
      header={header}
      data={data}
      tier={tier}
      locked={locked}
      shareTier={shareTier}
      shareOpen={shareOpen}
      onShareOpenChange={setShareOpen}
      onBack={() => router.push(tier === "guest" ? "/" : "/history")}
      onShare={() => {
        auditReportAnalytics.shareReport({ auditId: data.auditId, tier });
        if (!shareTier) {
          openUpgrade(AUDIT_REPORT_UPGRADE_SOURCES.share);
          return;
        }
        setShareOpen(true);
      }}
      onUpgrade={openUpgrade}
      onContinueCompare={(peerAuditId) => {
        toast.info(`Compare with ${peerAuditId} coming soon (placeholder).`);
      }}
    />
  );
}
