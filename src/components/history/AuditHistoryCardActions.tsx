"use client";

import * as React from "react";
import { Lock, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AuditHistoryType } from "@/config/audit-history";
import {
  AUDIT_HISTORY_CARD_ACTION_LABELS,
  AUDIT_HISTORY_CARD_MORE_LABEL,
  type AuditHistoryCardTier,
} from "@/config/audit-history-card";
import { auditHistoryCardAnalytics } from "@/lib/analytics/audit-history-card-events";
import type { AuditHistoryCardActionAvailability } from "@/utils/audit-history-card";
import { cn } from "@/utils/cn";

export type AuditHistoryCardActionsProps = {
  auditId: string;
  auditType: AuditHistoryType;
  tier: AuditHistoryCardTier;
  actions: AuditHistoryCardActionAvailability[];
  onDuplicate: (auditId: string) => void;
  onDelete: (auditId: string) => void;
  onDownloadPdf?: (auditId: string) => void;
  onCompare?: (auditId: string) => void;
  onUpgrade?: (source: string) => void;
};

/**
 * Secondary actions for COMPONENT-024.
 * Delete confirmation is owned by the History screen.
 */
export function AuditHistoryCardActions({
  auditId,
  auditType,
  tier,
  actions,
  onDuplicate,
  onDelete,
  onDownloadPdf,
  onCompare,
  onUpgrade,
}: AuditHistoryCardActionsProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && rootRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const runAction = (action: AuditHistoryCardActionAvailability) => {
    if (action.locked && action.upgradeSource) {
      auditHistoryCardAnalytics.upgradeClicked({
        auditId,
        tier,
        source: action.upgradeSource,
      });
      onUpgrade?.(action.upgradeSource);
      setMenuOpen(false);
      return;
    }
    switch (action.action) {
      case "duplicate":
        auditHistoryCardAnalytics.duplicated({ auditId, auditType });
        onDuplicate(auditId);
        break;
      case "delete":
        onDelete(auditId);
        break;
      case "download_pdf":
        if (!action.entitled) break;
        auditHistoryCardAnalytics.pdfDownloaded({ auditId, tier });
        onDownloadPdf?.(auditId);
        break;
      case "compare":
        if (!action.entitled) break;
        auditHistoryCardAnalytics.compare({ auditId, tier });
        onCompare?.(auditId);
        break;
      default:
        break;
    }
    setMenuOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label={AUDIT_HISTORY_CARD_MORE_LABEL}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        onClick={() => setMenuOpen((open) => !open)}
        iconLeft={<MoreHorizontal className="size-5" aria-hidden />}
      >
        <span className="sr-only">{AUDIT_HISTORY_CARD_MORE_LABEL}</span>
      </Button>

      {menuOpen ? (
        <ul
          role="menu"
          className={cn(
            "absolute right-0 z-dropdown mt-sm min-w-48",
            "rounded-md border border-border bg-popover py-sm shadow-md",
          )}
        >
          {actions.map((action) => (
            <li key={action.action} role="none">
              <button
                type="button"
                role="menuitem"
                className={cn(
                  "flex min-h-11 w-full items-center gap-sm px-md py-sm",
                  "text-left text-body-sm text-popover-foreground",
                  "hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                )}
                aria-label={
                  action.locked && action.lockedReason
                    ? `${action.label}. ${action.lockedReason}`
                    : action.label
                }
                onClick={() => runAction(action)}
              >
                {action.locked ? (
                  <Lock className="size-4 shrink-0" aria-hidden />
                ) : null}
                {AUDIT_HISTORY_CARD_ACTION_LABELS[action.action]}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
