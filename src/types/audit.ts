/**
 * Audit domain types — BACKEND-005.
 * Mirror public.audits / reports; never accept client-owned user_id/status/cost.
 */

import type { AuditFailureCode } from "@/config/audit-failure";
import type { AuditInputType, AuditStatus } from "@/types/index";

export type { AuditInputType, AuditStatus };

export type AuditRecord = {
  id: string;
  userId: string;
  workspaceId: string | null;
  inputType: AuditInputType;
  websiteUrl: string | null;
  status: AuditStatus;
  creditsCost: number;
  overallScore: number | null;
  summary: string | null;
  errorMessage: string | null;
  failureCode: AuditFailureCode | string | null;
  progressPercent: number;
  attemptCount: number;
  claimedAt: string | null;
  failedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  correlationId: string | null;
  retryOfAuditId: string | null;
  primaryAssetId: string | null;
};

export type CreateAuditInput = {
  inputType: AuditInputType;
  websiteUrl?: string | null;
  /** Optional storage key / asset id when upload exists (foundation). */
  primaryAssetId?: string | null;
  correlationId?: string | null;
  /**
   * Optional workspace. Must be a workspace the user belongs to with a
   * create-capable role. Defaults to personal workspace.
   */
  workspaceId?: string | null;
  /**
   * Non-production QA only — force failure after claim.
   * Rejected by POST /api/audits when NODE_ENV=production.
   */
  simulateFailure?: boolean;
  /**
   * Transient screenshot for AI (data URL). Not persisted; storage upload is separate.
   * Max size enforced in API route.
   */
  imageDataUrl?: string | null;
};

export type CreateAuditResult = {
  audit: AuditRecord;
  creditsRemaining: number | null;
};

export type AuditReportFoundation = {
  auditId: string;
  reportId: string;
  overallScore: number | null;
  categoryScores: Record<string, number> | null;
  aiSummary: string | null;
  reportJson: Record<string, unknown> | null;
  status: AuditStatus;
  inputType: AuditInputType;
  websiteUrl: string | null;
  createdAt: string;
  completedAt: string | null;
  /** True until AI worker fills real findings. */
  placeholder: boolean;
  findings: AuditReportFinding[];
  recommendations: AuditReportRecommendation[];
};

export type AuditReportFinding = {
  id: string;
  title: string;
  description: string;
  severity: string;
  category: string;
  evidence: string | null;
  evidenceType?: string | null;
  confidence?: string | null;
  userImpact?: string | null;
};

export type AuditReportRecommendation = {
  id: string;
  title: string;
  description: string;
  priority: string;
  category: string;
  expectedImprovement: string | null;
  findingIndex?: number | null;
};

export type AuditListItem = {
  id: string;
  inputType: AuditInputType;
  websiteUrl: string | null;
  status: AuditStatus;
  overallScore: number | null;
  creditsCost: number;
  createdAt: string;
  completedAt: string | null;
  failureCode: string | null;
  errorMessage: string | null;
  title: string;
};
