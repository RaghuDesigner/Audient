/**
 * Audit History Card helpers — COMPONENT-024.
 * Pure entitlement, labels, and a11y strings — no React.
 */

import {
  AUDIT_HISTORY_STATUS_LABELS,
  type AuditHistoryStatus,
  type AuditHistoryType,
} from "@/config/audit-history";
import {
  AUDIT_HISTORY_CARD_ACTION_LABELS,
  AUDIT_HISTORY_CARD_ACTION_MIN_TIER,
  AUDIT_HISTORY_CARD_ACTIONS_BY_STATUS,
  AUDIT_HISTORY_CARD_LOCKED,
  AUDIT_HISTORY_CARD_OPEN_LABELS,
  AUDIT_HISTORY_CARD_TYPE_LABELS,
  AUDIT_HISTORY_CARD_UPGRADE_SOURCES,
  type AuditHistoryCardAction,
  type AuditHistoryCardTier,
} from "@/config/audit-history-card";
import { formatAuditDate } from "@/utils/recent-audit";

const TIER_RANK: Record<AuditHistoryCardTier, number> = {
  free: 0,
  pro: 1,
  business: 2,
};

export type AuditHistoryCardActionAvailability = {
  action: AuditHistoryCardAction;
  /** True when the control should render (including locked gated CTAs). */
  visible: boolean;
  /** True when entitled to perform the real action. */
  entitled: boolean;
  /** True when visible but gated → upgrade path. */
  locked: boolean;
  label: string;
  lockedReason: string | null;
  upgradeSource: string | null;
};

export function meetsAuditHistoryCardTier(
  userTier: AuditHistoryCardTier,
  minTier: AuditHistoryCardTier | null,
): boolean {
  if (minTier == null) return true;
  return TIER_RANK[userTier] >= TIER_RANK[minTier];
}

export function canDownloadHistoryPdf(
  tier: AuditHistoryCardTier,
  pdfAvailable: boolean,
): boolean {
  return (
    meetsAuditHistoryCardTier(
      tier,
      AUDIT_HISTORY_CARD_ACTION_MIN_TIER.download_pdf,
    ) && pdfAvailable
  );
}

export function canCompareHistoryReports(tier: AuditHistoryCardTier): boolean {
  return meetsAuditHistoryCardTier(
    tier,
    AUDIT_HISTORY_CARD_ACTION_MIN_TIER.compare,
  );
}

export function auditHistoryCardOpenLabel(
  status: AuditHistoryStatus,
): string {
  return AUDIT_HISTORY_CARD_OPEN_LABELS[status];
}

export function auditHistoryCardScoreDisplay(
  status: AuditHistoryStatus,
  score: number | null | undefined,
): string | null {
  if (status === "processing") return "—";
  if (status === "completed" && score != null) return String(score);
  return null;
}

/** Hostname for display; falls back to raw string if not a URL. */
export function formatAuditHistoryUrl(
  websiteUrl: string | null | undefined,
): string | null {
  if (!websiteUrl) return null;
  const trimmed = websiteUrl.trim();
  if (!trimmed) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const url = new URL(withProtocol);
    return url.hostname.replace(/^www\./i, "") + (url.pathname === "/" ? "" : url.pathname);
  } catch {
    return trimmed;
  }
}

export function truncateAuditHistoryUrl(
  value: string,
  maxLength: number = 42,
): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(1, maxLength - 1))}…`;
}

export function auditHistoryCardAccessibleName(input: {
  websiteName: string;
  websiteUrl?: string | null;
  status: AuditHistoryStatus;
  score?: number | null;
  auditType: AuditHistoryType;
  auditDate: string | Date;
}): string {
  const statusLabel = AUDIT_HISTORY_STATUS_LABELS[input.status];
  const typeLabel = AUDIT_HISTORY_CARD_TYPE_LABELS[input.auditType];
  const dateLabel = formatAuditDate(input.auditDate);
  const urlLabel = formatAuditHistoryUrl(input.websiteUrl);
  const scorePart =
    input.status === "completed" && input.score != null
      ? `, score ${input.score}`
      : "";
  const urlPart = urlLabel ? `, ${urlLabel}` : "";
  return `${input.websiteName}${urlPart}, ${statusLabel}${scorePart}, ${typeLabel}, ${dateLabel}`;
}

export function lockedReasonForHistoryAction(
  action: Extract<AuditHistoryCardAction, "download_pdf" | "compare">,
): string {
  return action === "download_pdf"
    ? AUDIT_HISTORY_CARD_LOCKED.pdf.reason
    : AUDIT_HISTORY_CARD_LOCKED.compare.reason;
}

/**
 * Resolve secondary actions for a card given status, tier, and PDF readiness.
 * Locked gated actions stay visible so Free/Pro can trigger Upgrade.
 */
export function resolveAuditHistoryCardActions(input: {
  status: AuditHistoryStatus;
  tier: AuditHistoryCardTier;
  pdfAvailable?: boolean;
}): AuditHistoryCardActionAvailability[] {
  const pdfAvailable = input.pdfAvailable ?? false;
  const candidates = AUDIT_HISTORY_CARD_ACTIONS_BY_STATUS[input.status];

  return candidates.map((action) => {
    const label = AUDIT_HISTORY_CARD_ACTION_LABELS[action];
    const minTier = AUDIT_HISTORY_CARD_ACTION_MIN_TIER[action];

    if (action === "download_pdf") {
      const entitled = canDownloadHistoryPdf(input.tier, pdfAvailable);
      const tierOk = meetsAuditHistoryCardTier(input.tier, minTier);
      const locked = !tierOk;
      return {
        action,
        visible: true,
        entitled,
        locked,
        label,
        lockedReason: locked ? lockedReasonForHistoryAction("download_pdf") : null,
        upgradeSource: locked
          ? AUDIT_HISTORY_CARD_UPGRADE_SOURCES.pdf
          : null,
      };
    }

    if (action === "compare") {
      const entitled = canCompareHistoryReports(input.tier);
      const locked = !entitled;
      return {
        action,
        visible: true,
        entitled,
        locked,
        label,
        lockedReason: locked ? lockedReasonForHistoryAction("compare") : null,
        upgradeSource: locked
          ? AUDIT_HISTORY_CARD_UPGRADE_SOURCES.compare
          : null,
      };
    }

    return {
      action,
      visible: true,
      entitled: true,
      locked: false,
      label,
      lockedReason: null,
      upgradeSource: null,
    };
  });
}
