/**
 * COMPONENT-024 — Audit History Card constants.
 * Action labels, tier gates, status rules — no UI.
 */

import type { AuditHistoryStatus, AuditHistoryType } from "@/config/audit-history";

/** Current user membership for gating PDF / Compare (not plan-used-on-audit). */
export const AUDIT_HISTORY_CARD_TIERS = ["free", "pro", "business"] as const;

export type AuditHistoryCardTier = (typeof AUDIT_HISTORY_CARD_TIERS)[number];

export const AUDIT_HISTORY_CARD_STATUSES = [
  "loading",
  "completed",
  "processing",
  "failed",
] as const;

export type AuditHistoryCardStatus =
  (typeof AUDIT_HISTORY_CARD_STATUSES)[number];

export const AUDIT_HISTORY_CARD_ACTIONS = [
  "open",
  "duplicate",
  "delete",
  "download_pdf",
  "compare",
] as const;

export type AuditHistoryCardAction =
  (typeof AUDIT_HISTORY_CARD_ACTIONS)[number];

/** Accessible / visible action names. */
export const AUDIT_HISTORY_CARD_ACTION_LABELS: Record<
  AuditHistoryCardAction,
  string
> = {
  open: "Open report",
  duplicate: "Duplicate audit",
  delete: "Delete audit",
  download_pdf: "Download PDF",
  compare: "Compare report",
};

/** Primary CTA label by lifecycle status (loading has no CTA). */
export const AUDIT_HISTORY_CARD_OPEN_LABELS: Record<
  Exclude<AuditHistoryStatus, never>,
  string
> = {
  completed: "Open Report",
  processing: "View Progress",
  failed: "View Details",
};

export const AUDIT_HISTORY_CARD_TYPE_LABELS: Record<AuditHistoryType, string> = {
  website: "Website",
  screenshot: "Screenshot",
};

/** Overflow menu trigger. */
export const AUDIT_HISTORY_CARD_MORE_LABEL = "More actions";

/** Locked / upgrade copy for gated secondary actions. */
export const AUDIT_HISTORY_CARD_LOCKED = {
  pdf: {
    reason: "Upgrade to Pro or Business to download PDF reports.",
    shortReason: "Upgrade to unlock PDF",
  },
  compare: {
    reason: "Upgrade to Business to compare reports.",
    shortReason: "Upgrade to unlock Compare",
  },
} as const;

/** Analytics / upgrade-modal source keys for gated clicks. */
export const AUDIT_HISTORY_CARD_UPGRADE_SOURCES = {
  pdf: "history_card_pdf",
  compare: "history_card_compare",
} as const;

/**
 * Which secondary actions are relevant for a lifecycle status.
 * Entitlement (tier/pdfAvailable) is applied in utils — not here.
 */
export const AUDIT_HISTORY_CARD_ACTIONS_BY_STATUS: Record<
  AuditHistoryStatus,
  readonly AuditHistoryCardAction[]
> = {
  completed: ["duplicate", "delete", "download_pdf", "compare"],
  processing: ["duplicate", "delete"],
  failed: ["duplicate", "delete"],
};

/** Minimum tier for each gated action (`null` = all authenticated). */
export const AUDIT_HISTORY_CARD_ACTION_MIN_TIER: Record<
  AuditHistoryCardAction,
  AuditHistoryCardTier | null
> = {
  open: null,
  duplicate: null,
  delete: null,
  download_pdf: "pro",
  compare: "business",
};

export const AUDIT_HISTORY_CARD_DELETE_CONFIRM = {
  title: "Delete this audit?",
  description:
    "This permanently removes the audit from your history. Credits are not refunded.",
  confirmLabel: "Delete audit",
  cancelLabel: "Cancel",
} as const;
