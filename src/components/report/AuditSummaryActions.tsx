"use client";

import { Lock, Share2 } from "lucide-react";

import { CompareReportButton } from "@/components/common/CompareReportButton";
import { ExportPdfButton } from "@/components/common/ExportPdfButton";
import { Button } from "@/components/ui/button";
import type { AuditSummaryTier } from "@/config/audit-summary";
import { auditSummaryAnalytics } from "@/lib/analytics/audit-summary-events";
import type { AuditSummaryActionAvailability } from "@/utils/audit-summary";

export type AuditSummaryActionsProps = {
  auditId: string | null;
  tier: AuditSummaryTier;
  actions: AuditSummaryActionAvailability[];
  pdfAvailable?: boolean;
  compareReady?: boolean;
  onShare?: () => void;
  onExportPdf?: () => void;
  onCompare?: () => void;
  onContinueCompare?: (peerAuditId: string) => void;
  onUpgrade?: (source: string) => void;
};

/**
 * COMPONENT-027 companion — Share / Export PDF / Compare controls.
 * Export: COMPONENT-030 · Compare: COMPONENT-032.
 */
export function AuditSummaryActions({
  auditId,
  tier,
  actions,
  pdfAvailable = false,
  compareReady = true,
  onShare,
  onExportPdf,
  onCompare,
  onContinueCompare,
  onUpgrade,
}: AuditSummaryActionsProps) {
  const visible = actions.filter((a) => a.visible);
  if (visible.length === 0) return null;

  const id = auditId ?? "unknown";

  return (
    <div className="flex flex-wrap items-center gap-sm">
      {visible.map((action) => {
        if (action.action === "exportPdf") {
          return (
            <ExportPdfButton
              key={action.action}
              auditId={id}
              tier={tier}
              pdfReady={pdfAvailable && !action.disabled}
              surface="report"
              onExport={onExportPdf}
              onUpgrade={onUpgrade}
            />
          );
        }

        if (action.action === "compare") {
          return (
            <CompareReportButton
              key={action.action}
              auditId={id}
              tier={tier}
              compareReady={compareReady && !action.disabled}
              surface="summary"
              onCompare={onCompare}
              onContinueCompare={onContinueCompare}
              onUpgrade={onUpgrade}
            />
          );
        }

        return (
          <SummaryShareButton
            key={action.action}
            action={action}
            auditId={id}
            tier={tier}
            onShare={onShare}
            onUpgrade={onUpgrade}
          />
        );
      })}
    </div>
  );
}

function SummaryShareButton({
  action,
  auditId,
  tier,
  onShare,
  onUpgrade,
}: {
  action: AuditSummaryActionAvailability;
  auditId: string;
  tier: AuditSummaryTier;
  onShare?: () => void;
  onUpgrade?: (source: string) => void;
}) {
  const handleClick = () => {
    if (action.locked) {
      if (action.upgradeSource) {
        auditSummaryAnalytics.upgradeClicked({
          auditId,
          tier,
          source: action.upgradeSource,
        });
        onUpgrade?.(action.upgradeSource);
      }
      return;
    }
    if (!action.entitled || action.disabled) return;
    auditSummaryAnalytics.shareClicked({ auditId, tier });
    onShare?.();
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={action.disabled}
      aria-label={action.label}
      onClick={handleClick}
      iconLeft={
        action.locked ? (
          <Lock className="size-4" aria-hidden />
        ) : (
          <Share2 className="size-4" aria-hidden />
        )
      }
    >
      {action.label}
    </Button>
  );
}
