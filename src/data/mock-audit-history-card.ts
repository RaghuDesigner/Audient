/**
 * Phase-1 mock Audit History Card props — COMPONENT-024.
 * Status + tier samples for QA; no API.
 */

import type { AuditHistoryType } from "@/config/audit-history";
import type {
  AuditHistoryCardStatus,
  AuditHistoryCardTier,
} from "@/config/audit-history-card";
import type { RecentAuditPlanUsed } from "@/utils/recent-audit";

const MOCK_THUMB =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='120' viewBox='0 0 160 120'%3E%3Crect fill='%23e8eef5' width='160' height='120'/%3E%3Ctext x='80' y='64' text-anchor='middle' fill='%23666' font-family='system-ui' font-size='12'%3EPreview%3C/text%3E%3C/svg%3E";

/** Data props for AuditHistoryCard (callbacks omitted). */
export type MockAuditHistoryCard = {
  auditId: string;
  websiteName: string;
  websiteUrl: string | null;
  thumbnailUrl: string | null;
  thumbnailAlt?: string | null;
  auditDate: string;
  score: number | null;
  status: AuditHistoryCardStatus;
  planUsed: RecentAuditPlanUsed | null;
  auditType: AuditHistoryType;
  /** Current user tier — gates PDF / Compare. */
  tier: AuditHistoryCardTier;
  pdfAvailable: boolean;
};

export const MOCK_AUDIT_HISTORY_CARD_COMPLETED: MockAuditHistoryCard = {
  auditId: "hist-completed-1",
  websiteName: "acme.studio",
  websiteUrl: "https://acme.studio/pricing",
  thumbnailUrl: MOCK_THUMB,
  thumbnailAlt: "Screenshot preview of acme.studio",
  auditDate: "2026-07-28T14:20:00.000Z",
  score: 82,
  status: "completed",
  planUsed: "pro",
  auditType: "website",
  tier: "pro",
  pdfAvailable: true,
};

export const MOCK_AUDIT_HISTORY_CARD_PROCESSING: MockAuditHistoryCard = {
  auditId: "hist-processing-1",
  websiteName: "northwind.app",
  websiteUrl: "https://northwind.app",
  thumbnailUrl: null,
  auditDate: "2026-08-02T09:05:00.000Z",
  score: null,
  status: "processing",
  planUsed: "free",
  auditType: "website",
  tier: "free",
  pdfAvailable: false,
};

export const MOCK_AUDIT_HISTORY_CARD_FAILED: MockAuditHistoryCard = {
  auditId: "hist-failed-1",
  websiteName: "broken.example",
  websiteUrl: "https://broken.example/home",
  thumbnailUrl: null,
  auditDate: "2026-07-30T18:40:00.000Z",
  score: null,
  status: "failed",
  planUsed: "free",
  auditType: "screenshot",
  tier: "free",
  pdfAvailable: false,
};

export const MOCK_AUDIT_HISTORY_CARD_LOADING: MockAuditHistoryCard = {
  auditId: "hist-loading",
  websiteName: "",
  websiteUrl: null,
  thumbnailUrl: null,
  auditDate: new Date().toISOString(),
  score: null,
  status: "loading",
  planUsed: null,
  auditType: "website",
  tier: "free",
  pdfAvailable: false,
};

/** Free user viewing a completed audit — PDF/Compare locked. */
export const MOCK_AUDIT_HISTORY_CARD_LOCKED_FREE: MockAuditHistoryCard = {
  ...MOCK_AUDIT_HISTORY_CARD_COMPLETED,
  auditId: "hist-locked-free-1",
  websiteName: "shop.local",
  websiteUrl: "https://shop.local",
  score: 68,
  planUsed: "free",
  auditType: "screenshot",
  tier: "free",
  pdfAvailable: true,
};

/** Business user — PDF + Compare entitled. */
export const MOCK_AUDIT_HISTORY_CARD_BUSINESS: MockAuditHistoryCard = {
  ...MOCK_AUDIT_HISTORY_CARD_COMPLETED,
  auditId: "hist-business-1",
  websiteName: "contoso.com",
  websiteUrl: "https://www.contoso.com/products",
  score: 91,
  planUsed: "business",
  auditType: "website",
  tier: "business",
  pdfAvailable: true,
};

/** Gallery for History QA — all lifecycle states. */
export const MOCK_AUDIT_HISTORY_CARDS: MockAuditHistoryCard[] = [
  MOCK_AUDIT_HISTORY_CARD_COMPLETED,
  MOCK_AUDIT_HISTORY_CARD_PROCESSING,
  MOCK_AUDIT_HISTORY_CARD_FAILED,
  MOCK_AUDIT_HISTORY_CARD_LOCKED_FREE,
  MOCK_AUDIT_HISTORY_CARD_BUSINESS,
];
