/**
 * COMPONENT-027 — Audit Summary helpers.
 * Pure formatting and action gates — no React / no API.
 */

import { AUDIT_REPORT_GATES } from "@/config/audit-report";
import {
  AUDIT_SUMMARY_ACTION_LABELS,
  AUDIT_SUMMARY_MEMBERSHIP_LABELS,
  AUDIT_SUMMARY_STATUS_LABELS,
  AUDIT_SUMMARY_TYPE_LABELS,
  type AuditSummaryMembership,
  type AuditSummaryState,
  type AuditSummaryStatus,
  type AuditSummaryTier,
  type AuditSummaryType,
  type AuditSummaryVariant,
} from "@/config/audit-summary";
import {
  formatAuditHistoryUrl,
  truncateAuditHistoryUrl,
} from "@/utils/audit-history-card";

export type AuditSummaryAction = "share" | "exportPdf" | "compare";

export type AuditSummaryActionAvailability = {
  action: AuditSummaryAction;
  visible: boolean;
  /** Entitled to perform the real action (tier + readiness + lifecycle). */
  entitled: boolean;
  /** Visible but gated → upgrade path. */
  locked: boolean;
  /** Visible but temporarily unavailable (processing / PDF not ready). */
  disabled: boolean;
  label: string;
  upgradeSource: string | null;
};

export const AUDIT_SUMMARY_UPGRADE_SOURCES = {
  share: "audit_summary_share",
  exportPdf: "audit_summary_pdf",
  compare: "audit_summary_compare",
} as const;

/** Human-readable processing duration (e.g. “1m 24s”). */
export function formatAuditDuration(
  seconds: number | null | undefined,
): string | null {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return null;
  const total = Math.floor(seconds);
  if (total < 60) return `${total}s`;

  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  if (minutes < 60) {
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  if (remMinutes === 0 && secs === 0) return `${hours}h`;
  if (secs === 0) return `${hours}h ${remMinutes}m`;
  return `${hours}h ${remMinutes}m ${secs}s`;
}

/** Localized audit date & time for summary meta. */
export function formatAuditSummaryDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatAuditSummaryUrl(
  websiteUrl: string | null | undefined,
  maxLength: number = 48,
): string | null {
  const formatted = formatAuditHistoryUrl(websiteUrl);
  if (!formatted) return null;
  return truncateAuditHistoryUrl(formatted, maxLength);
}

export function canShareAuditSummary(tier: AuditSummaryTier): boolean {
  return AUDIT_REPORT_GATES.shareReport[tier];
}

export function canExportAuditSummaryPdf(
  tier: AuditSummaryTier,
  pdfAvailable: boolean,
): boolean {
  return AUDIT_REPORT_GATES.exportPdf[tier] && pdfAvailable;
}

export function canCompareAuditSummary(tier: AuditSummaryTier): boolean {
  return AUDIT_REPORT_GATES.compareReports[tier];
}

function actionsInteractive(
  state: AuditSummaryState,
  variant: AuditSummaryVariant,
): boolean {
  if (state === "loading" || state === "error") return false;
  if (variant === "pdf" || variant === "shared") return false;
  return true;
}

/**
 * Resolve Share / Export PDF / Compare for the summary chrome.
 * Locked gated actions stay visible so Guest/Free/Pro can open Upgrade.
 */
export function resolveAuditSummaryActions(input: {
  state: AuditSummaryState;
  status: AuditSummaryStatus;
  tier: AuditSummaryTier;
  variant?: AuditSummaryVariant;
  pdfAvailable?: boolean;
}): AuditSummaryActionAvailability[] {
  const variant = input.variant ?? "report";
  const pdfAvailable = input.pdfAvailable ?? false;
  const interactive = actionsInteractive(input.state, variant);
  const lifecycleBlocks =
    input.status === "processing" || input.status === "failed";

  const shareEntitled = canShareAuditSummary(input.tier);
  const pdfTierOk = AUDIT_REPORT_GATES.exportPdf[input.tier];
  const compareEntitled = canCompareAuditSummary(input.tier);

  const share: AuditSummaryActionAvailability = {
    action: "share",
    visible: interactive,
    entitled: interactive && shareEntitled && !lifecycleBlocks,
    locked: interactive && !shareEntitled,
    disabled: interactive && shareEntitled && lifecycleBlocks,
    label: shareEntitled
      ? AUDIT_SUMMARY_ACTION_LABELS.share
      : AUDIT_SUMMARY_ACTION_LABELS.upgradeShare,
    upgradeSource: shareEntitled
      ? null
      : AUDIT_SUMMARY_UPGRADE_SOURCES.share,
  };

  const exportPdf: AuditSummaryActionAvailability = {
    action: "exportPdf",
    /** Guest: parent must not show Export PDF (COMPONENT-030). */
    visible: interactive && input.tier !== "guest",
    entitled:
      interactive &&
      canExportAuditSummaryPdf(input.tier, pdfAvailable) &&
      !lifecycleBlocks,
    locked: interactive && !pdfTierOk,
    disabled:
      interactive &&
      pdfTierOk &&
      (lifecycleBlocks || !pdfAvailable),
    label: pdfTierOk
      ? AUDIT_SUMMARY_ACTION_LABELS.exportPdf
      : AUDIT_SUMMARY_ACTION_LABELS.upgradePdf,
    upgradeSource: pdfTierOk
      ? null
      : AUDIT_SUMMARY_UPGRADE_SOURCES.exportPdf,
  };

  const compare: AuditSummaryActionAvailability = {
    action: "compare",
    /** Guest: do not render Compare (COMPONENT-032). Free/Pro locked in button. */
    visible: interactive && input.tier !== "guest",
    entitled: interactive && compareEntitled && !lifecycleBlocks,
    locked: interactive && !compareEntitled,
    disabled: interactive && compareEntitled && lifecycleBlocks,
    label: compareEntitled
      ? AUDIT_SUMMARY_ACTION_LABELS.compare
      : AUDIT_SUMMARY_ACTION_LABELS.upgradeCompare,
    upgradeSource: compareEntitled
      ? null
      : AUDIT_SUMMARY_UPGRADE_SOURCES.compare,
  };

  return [share, exportPdf, compare];
}

/** Screen-reader summary: name, type, status, date, audit id. */
export function auditSummaryAccessibleName(input: {
  websiteName: string;
  auditType: AuditSummaryType;
  status: AuditSummaryStatus;
  auditedAt: string | Date;
  auditId?: string | null;
  membershipUsed?: AuditSummaryMembership | null;
  aiEngineVersion?: string | null;
}): string {
  const parts = [
    input.websiteName,
    AUDIT_SUMMARY_TYPE_LABELS[input.auditType],
    AUDIT_SUMMARY_STATUS_LABELS[input.status],
    formatAuditSummaryDateTime(input.auditedAt),
  ];
  if (input.auditId) parts.push(`Audit ID ${input.auditId}`);
  if (input.membershipUsed) {
    parts.push(AUDIT_SUMMARY_MEMBERSHIP_LABELS[input.membershipUsed]);
  }
  if (input.aiEngineVersion) {
    parts.push(`AI ${input.aiEngineVersion}`);
  }
  return parts.join(", ");
}
