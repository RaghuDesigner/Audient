"use client";

import {
  AuditReportLoadingSkeleton,
  AuditReportShell,
  AuditReportStatusEmpty,
} from "@/components/report/AuditReportShell";
import type { AuditReportTier } from "@/config/audit-report";
import type { RealAuditReportStatus } from "@/hooks/use-real-audit-report";

/**
 * Status / loading / error gates for real UUID audit reports.
 * Returns null when the report is ready to render.
 */
export function RealAuditReportGate({
  header,
  tier,
  status,
  auditId,
  onRetry,
  onOpenProcessing,
  onHistory,
  onHome,
}: {
  header: React.ReactNode;
  tier: AuditReportTier;
  status: RealAuditReportStatus;
  auditId: string;
  onRetry: () => void;
  onOpenProcessing: (auditId: string) => void;
  onHistory: () => void;
  onHome: () => void;
}): React.ReactNode {
  if (status === "loading") {
    return (
      <AuditReportShell header={header}>
        <AuditReportLoadingSkeleton />
      </AuditReportShell>
    );
  }

  if (status === "processing") {
    return (
      <AuditReportShell header={header} center>
        <AuditReportStatusEmpty
          tier={tier}
          kind="processing"
          onPrimary={() => onOpenProcessing(auditId)}
          onSecondary={onHistory}
        />
      </AuditReportShell>
    );
  }

  if (status === "failed") {
    return (
      <AuditReportShell header={header} center>
        <AuditReportStatusEmpty
          tier={tier}
          kind="failed"
          onPrimary={() => onOpenProcessing(auditId)}
          onSecondary={onHistory}
        />
      </AuditReportShell>
    );
  }

  if (status === "error" || status === "placeholder") {
    return (
      <AuditReportShell header={header} center>
        <AuditReportStatusEmpty
          tier={tier}
          kind={status === "placeholder" ? "placeholder" : "error"}
          onPrimary={onRetry}
          onSecondary={onHistory}
        />
      </AuditReportShell>
    );
  }

  if (status === "not_found") {
    return (
      <AuditReportShell header={header} center>
        <AuditReportStatusEmpty
          tier={tier}
          kind="not_found"
          onPrimary={onHistory}
          onSecondary={onHome}
        />
      </AuditReportShell>
    );
  }

  return null;
}
