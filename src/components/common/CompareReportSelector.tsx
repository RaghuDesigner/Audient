"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Caption } from "@/components/ui/typography";
import { COMPARE_REPORT_BUTTON_COPY } from "@/config/compare-report-button";
import { compareReportButtonAnalytics } from "@/lib/analytics/compare-report-button-events";
import {
  getMockComparePeers,
  type MockComparePeerAudit,
} from "@/data/mock-compare-report-button";
import { formatAuditDate } from "@/utils/recent-audit";
import { cn } from "@/utils/cn";

export type CompareReportSelectorProps = {
  open: boolean;
  auditId: string;
  tier: string;
  peers?: MockComparePeerAudit[];
  onClose: () => void;
  onContinue?: (peerAuditId: string) => void;
};

/**
 * COMPONENT-032 companion — Compare Report Selector placeholder.
 * Mock peer list only; no dual-pane compare workspace.
 */
export function CompareReportSelector({
  open,
  auditId,
  tier,
  peers,
  onClose,
  onContinue,
}: CompareReportSelectorProps) {
  const list = peers ?? getMockComparePeers(auditId);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) setSelectedId(null);
  }, [open]);

  const dismiss = () => {
    compareReportButtonAnalytics.selectorDismissed({ auditId, tier });
    onClose();
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) dismiss();
      }}
      size="md"
      scrollable
      title={COMPARE_REPORT_BUTTON_COPY.selectorTitle}
      description={COMPARE_REPORT_BUTTON_COPY.selectorDescription}
      footer={
        <div className="flex w-full flex-col-reverse gap-sm sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={dismiss}>
            {COMPARE_REPORT_BUTTON_COPY.selectorCancel}
          </Button>
          <Button
            type="button"
            variant="primary"
            className="text-primary-foreground"
            disabled={!selectedId}
            onClick={() => {
              if (!selectedId) return;
              compareReportButtonAnalytics.peerSelected({
                auditId,
                peerAuditId: selectedId,
                tier,
              });
              onContinue?.(selectedId);
              onClose();
            }}
          >
            {COMPARE_REPORT_BUTTON_COPY.selectorContinue}
          </Button>
        </div>
      }
    >
      {list.length === 0 ? (
        <Caption className="text-muted-foreground">
          {COMPARE_REPORT_BUTTON_COPY.selectorEmpty}
        </Caption>
      ) : (
        <ul className="flex flex-col gap-sm" role="listbox" aria-label="Audits to compare">
          {list.map((peer) => {
            const selected = selectedId === peer.auditId;
            return (
              <li key={peer.auditId}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => setSelectedId(peer.auditId)}
                  className={cn(
                    "flex w-full min-h-11 flex-col items-start gap-sm rounded-md border p-md text-left",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-surface hover:border-border/80",
                  )}
                >
                  <span className="text-body-sm font-semibold text-foreground">
                    {peer.websiteName}
                  </span>
                  <Caption className="text-muted-foreground">
                    {formatAuditDate(peer.auditedAt)} · Score {peer.score}
                  </Caption>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <Caption className="mt-md text-muted-foreground">
        {COMPARE_REPORT_BUTTON_COPY.selectorComingSoon}
      </Caption>
    </Modal>
  );
}
