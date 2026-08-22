/**
 * Phase-1 mock Audit History screen — SCREEN-009.
 * Reuses history-card fixtures; no API / no Supabase.
 */

import type { AuditHistoryScreenState } from "@/config/audit-history";
import type { AuditHistoryCardTier } from "@/config/audit-history-card";
import {
  MOCK_AUDIT_HISTORY_CARD_BUSINESS,
  MOCK_AUDIT_HISTORY_CARD_COMPLETED,
  MOCK_AUDIT_HISTORY_CARD_FAILED,
  MOCK_AUDIT_HISTORY_CARD_LOCKED_FREE,
  MOCK_AUDIT_HISTORY_CARD_PROCESSING,
  MOCK_AUDIT_HISTORY_CARDS,
  type MockAuditHistoryCard,
} from "@/data/mock-audit-history-card";
import type { AuthPlanTier } from "@/types/auth";
import { authPlanTierToHistoryCardTier } from "@/utils/audit-history";

export type MockAuditHistoryScreen = {
  state: AuditHistoryScreenState;
  audits: MockAuditHistoryCard[];
};

const EXTRA_AUDITS: MockAuditHistoryCard[] = [
  {
    ...MOCK_AUDIT_HISTORY_CARD_COMPLETED,
    auditId: "hist-completed-2",
    websiteName: "lumen.health",
    websiteUrl: "https://lumen.health/app",
    auditDate: "2026-06-12T11:00:00.000Z",
    score: 74,
    planUsed: "pro",
    auditType: "website",
  },
  {
    ...MOCK_AUDIT_HISTORY_CARD_LOCKED_FREE,
    auditId: "hist-completed-3",
    websiteName: "harbor.bank",
    websiteUrl: "https://harbor.bank",
    auditDate: "2026-05-04T16:40:00.000Z",
    score: 61,
    planUsed: "free",
    auditType: "screenshot",
  },
  {
    ...MOCK_AUDIT_HISTORY_CARD_BUSINESS,
    auditId: "hist-completed-4",
    websiteName: "northstar.io",
    websiteUrl: "https://northstar.io/pricing",
    auditDate: "2026-04-18T09:15:00.000Z",
    score: 88,
    planUsed: "business",
    auditType: "website",
  },
  {
    ...MOCK_AUDIT_HISTORY_CARD_COMPLETED,
    auditId: "hist-completed-5",
    websiteName: "pebble.shop",
    websiteUrl: "https://pebble.shop/checkout",
    auditDate: "2026-03-22T13:05:00.000Z",
    score: 79,
    planUsed: "pro",
    auditType: "screenshot",
  },
  {
    ...MOCK_AUDIT_HISTORY_CARD_FAILED,
    auditId: "hist-failed-2",
    websiteName: "timeout.demo",
    websiteUrl: "https://timeout.demo",
    auditDate: "2026-07-02T08:30:00.000Z",
    auditType: "website",
    planUsed: "free",
  },
  {
    ...MOCK_AUDIT_HISTORY_CARD_PROCESSING,
    auditId: "hist-processing-2",
    websiteName: "orbit.design",
    websiteUrl: "https://orbit.design",
    auditDate: "2026-08-10T07:50:00.000Z",
    auditType: "screenshot",
    planUsed: "pro",
  },
  {
    ...MOCK_AUDIT_HISTORY_CARD_COMPLETED,
    auditId: "hist-completed-6",
    websiteName: "cascade.news",
    websiteUrl: "https://cascade.news",
    auditDate: "2025-11-19T19:20:00.000Z",
    score: 55,
    planUsed: "free",
    auditType: "website",
  },
  {
    ...MOCK_AUDIT_HISTORY_CARD_COMPLETED,
    auditId: "hist-completed-7",
    websiteName: "atlas.travel",
    websiteUrl: "https://atlas.travel/home",
    auditDate: "2025-09-08T10:10:00.000Z",
    score: 93,
    planUsed: "business",
    auditType: "website",
  },
];

const MOCK_AUDIT_HISTORY_CATALOG: MockAuditHistoryCard[] = [
  ...MOCK_AUDIT_HISTORY_CARDS.filter((card) => card.status !== "loading"),
  ...EXTRA_AUDITS,
];

function withUserTier(
  audits: MockAuditHistoryCard[],
  tier: AuditHistoryCardTier,
): MockAuditHistoryCard[] {
  return audits.map((audit) => ({ ...audit, tier }));
}

export function getMockAuditHistory(input?: {
  userId?: string;
  planTier?: AuthPlanTier | null;
  state?: AuditHistoryScreenState;
  empty?: boolean;
}): MockAuditHistoryScreen {
  const state = input?.state ?? "success";
  const tier = authPlanTierToHistoryCardTier(input?.planTier);

  if (state === "loading") {
    return { state: "loading", audits: [] };
  }

  if (state === "error") {
    return { state: "error", audits: [] };
  }

  if (input?.empty || state === "empty") {
    return { state: "empty", audits: [] };
  }

  return {
    state: "success",
    audits: withUserTier(MOCK_AUDIT_HISTORY_CATALOG, tier),
  };
}
