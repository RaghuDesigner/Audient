/**
 * Phase-1 mock Share Report Modal props — COMPONENT-031.
 * Tier / state samples for QA; mock URLs only — no real access.
 */

import type {
  ShareReportModalState,
  ShareReportModalTier,
  ShareReportPermission,
  ShareReportShareOption,
} from "@/config/share-report-modal";
import { buildMockShareReportUrl } from "@/utils/share-report-modal";

/** Data props for ShareReportModal (callbacks omitted). */
export type MockShareReportModal = {
  open: boolean;
  auditId: string;
  reportLabel: string;
  auditedAt: string;
  score: number | null;
  tier: ShareReportModalTier;
  state: ShareReportModalState;
  shareUrl: string | null;
  permission: ShareReportPermission;
  activeOption: ShareReportShareOption;
  errorMessage?: string | null;
};

export const MOCK_SHARE_REPORT_FREE: MockShareReportModal = {
  open: true,
  auditId: "audit-report-acme-1",
  reportLabel: "acme.studio",
  auditedAt: "2026-07-28T14:20:00.000Z",
  score: 72,
  tier: "free",
  state: "default",
  shareUrl: null,
  permission: "view",
  activeOption: "link",
};

export const MOCK_SHARE_REPORT_PRO: MockShareReportModal = {
  open: true,
  auditId: "audit-report-acme-1",
  reportLabel: "acme.studio",
  auditedAt: "2026-07-28T14:20:00.000Z",
  score: 72,
  tier: "pro",
  state: "default",
  shareUrl: null,
  permission: "view",
  activeOption: "link",
};

export const MOCK_SHARE_REPORT_BUSINESS: MockShareReportModal = {
  open: true,
  auditId: "audit-report-acme-1",
  reportLabel: "acme.studio",
  auditedAt: "2026-07-28T14:20:00.000Z",
  score: 72,
  tier: "business",
  state: "default",
  shareUrl: null,
  permission: "view",
  activeOption: "link",
};

export const MOCK_SHARE_REPORT_GENERATING: MockShareReportModal = {
  ...MOCK_SHARE_REPORT_PRO,
  state: "generating",
};

export const MOCK_SHARE_REPORT_LINK_GENERATED: MockShareReportModal = {
  ...MOCK_SHARE_REPORT_PRO,
  state: "link_generated",
  shareUrl: buildMockShareReportUrl("audit-report-acme-1"),
};

export const MOCK_SHARE_REPORT_COPIED: MockShareReportModal = {
  ...MOCK_SHARE_REPORT_LINK_GENERATED,
  state: "copied",
};

export const MOCK_SHARE_REPORT_ERROR: MockShareReportModal = {
  ...MOCK_SHARE_REPORT_PRO,
  state: "error",
  shareUrl: null,
  errorMessage: "Mock share failed. Retry to try again.",
};

export const MOCK_SHARE_REPORT_BY_TIER: Record<
  ShareReportModalTier,
  MockShareReportModal
> = {
  free: MOCK_SHARE_REPORT_FREE,
  pro: MOCK_SHARE_REPORT_PRO,
  business: MOCK_SHARE_REPORT_BUSINESS,
};

export function getMockShareReportModal(
  tier: ShareReportModalTier = "pro",
  overrides?: Partial<MockShareReportModal>,
): MockShareReportModal {
  return { ...MOCK_SHARE_REPORT_BY_TIER[tier], ...overrides };
}
