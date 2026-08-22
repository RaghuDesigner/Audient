"use client";

import { AuditHistoryCard } from "@/components/history/AuditHistoryCard";
import type { AuditHistoryCardTier } from "@/config/audit-history-card";
import type { MockAuditHistoryCard } from "@/data/mock-audit-history-card";

export type AuditHistoryListProps = {
  audits: readonly MockAuditHistoryCard[];
  tier: AuditHistoryCardTier;
  onOpen: (
    auditId: string,
    status: Exclude<MockAuditHistoryCard["status"], "loading">,
  ) => void;
  onDuplicate: (auditId: string) => void;
  onDelete: (audit: MockAuditHistoryCard) => void;
  onDownloadPdf: (auditId: string) => void;
  onCompare: (auditId: string) => void;
  onUpgrade?: (source: string) => void;
};

/**
 * SCREEN-009 list — one AuditHistoryCard per row.
 */
export function AuditHistoryList({
  audits,
  tier,
  onOpen,
  onDuplicate,
  onDelete,
  onDownloadPdf,
  onCompare,
  onUpgrade,
}: AuditHistoryListProps) {
  return (
    <ul className="m-0 flex list-none flex-col gap-md p-0">
      {audits.map((audit) => (
        <li key={audit.auditId}>
          <AuditHistoryCard
            {...audit}
            tier={tier}
            onOpenReport={onOpen}
            onDuplicate={onDuplicate}
            onDelete={() => onDelete(audit)}
            onDownloadPdf={onDownloadPdf}
            onCompare={onCompare}
            onUpgrade={onUpgrade}
          />
        </li>
      ))}
    </ul>
  );
}
