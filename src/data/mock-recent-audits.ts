/**
 * Phase-1 mock recent audits — COMPONENT-016 / Dashboard (max 5).
 */

import type { RecentAuditCardProps } from "@/components/dashboard/RecentAuditCard";

export type MockRecentAudit = Omit<
  RecentAuditCardProps,
  "onOpen" | "className" | "compact" | "ctaLabel"
>;

export const MOCK_RECENT_AUDITS: MockRecentAudit[] = [
  {
    auditId: "audit-completed-1",
    websiteName: "acme.studio",
    thumbnailUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='120' viewBox='0 0 160 120'%3E%3Crect fill='%23e8eef5' width='160' height='120'/%3E%3Ctext x='80' y='64' text-anchor='middle' fill='%23666' font-family='system-ui' font-size='12'%3EPreview%3C/text%3E%3C/svg%3E",
    thumbnailAlt: "Screenshot preview of acme.studio home",
    score: 82,
    auditDate: "2026-07-28T14:20:00.000Z",
    status: "completed",
    planUsed: "pro",
  },
  {
    auditId: "audit-processing-1",
    websiteName: "northwind.app",
    thumbnailUrl: null,
    score: null,
    auditDate: "2026-08-02T09:05:00.000Z",
    status: "processing",
    planUsed: "free",
  },
  {
    auditId: "audit-failed-1",
    websiteName: "broken.example",
    thumbnailUrl: null,
    score: null,
    auditDate: "2026-07-30T18:40:00.000Z",
    status: "failed",
    planUsed: "free",
  },
  {
    auditId: "audit-completed-2",
    websiteName: "shop.local",
    thumbnailUrl: null,
    score: 68,
    auditDate: "2026-07-22T11:00:00.000Z",
    status: "completed",
    planUsed: "business",
  },
];

/** Parent Empty State — no cards rendered. */
export const MOCK_RECENT_AUDITS_EMPTY: MockRecentAudit[] = [];

export const MOCK_RECENT_AUDIT_LOADING: MockRecentAudit = {
  auditId: "loading",
  websiteName: "",
  thumbnailUrl: null,
  score: null,
  auditDate: new Date().toISOString(),
  status: "loading",
  planUsed: null,
};
