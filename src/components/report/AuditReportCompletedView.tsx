"use client";

import { ShareReportModal } from "@/components/common/ShareReportModal";
import { AuditReportContent } from "@/components/report/AuditReportContent";
import { AuditReportShell } from "@/components/report/AuditReportShell";
import type { AuditReportTier } from "@/config/audit-report";
import type { ShareReportModalTier } from "@/config/share-report-modal";
import type { MockAuditReportFull } from "@/data/mock-audit-report";

export function AuditReportCompletedView({
  header,
  data,
  tier,
  locked,
  shareTier,
  shareOpen,
  onShareOpenChange,
  onBack,
  onShare,
  onUpgrade,
  onContinueCompare,
}: {
  header: React.ReactNode;
  data: MockAuditReportFull;
  tier: AuditReportTier;
  locked: { findings: number; recommendations: number; strengths: number };
  shareTier: ShareReportModalTier | null;
  shareOpen: boolean;
  onShareOpenChange: (open: boolean) => void;
  onBack: () => void;
  onShare: () => void;
  onUpgrade: (source: string) => void;
  onContinueCompare: (peerAuditId: string) => void;
}) {
  return (
    <AuditReportShell header={header}>
      <AuditReportContent
        data={data}
        tier={tier}
        locked={locked}
        onBack={onBack}
        onExportPdf={() => {
          /* Mock progress/success live in ExportPdfButton (COMPONENT-030). */
        }}
        onShare={onShare}
        onCompare={() => {
          /* Selector + analytics live in CompareReportButton (COMPONENT-032). */
        }}
        onContinueCompare={onContinueCompare}
        onUpgrade={onUpgrade}
      />

      {shareTier ? (
        <ShareReportModal
          open={shareOpen}
          auditId={data.auditId}
          reportLabel={data.summary.websiteName}
          auditedAt={data.summary.auditDate}
          score={data.overall.score}
          tier={shareTier}
          onClose={() => onShareOpenChange(false)}
        />
      ) : null}
    </AuditReportShell>
  );
}
