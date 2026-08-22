import "server-only";

export { hasOpenAiApiKey, requireOpenAiApiKey, openAiModel } from "@/lib/ai/env";
export {
  runAiUxAudit,
  AiProviderError,
  AI_MAX_OUTPUT_TOKENS,
  AI_VISION_DETAIL,
} from "@/lib/ai/client";
export {
  AI_EVIDENCE_TYPES,
  AI_CONFIDENCE_LEVELS,
  normalizeAiAuditResult,
  calibrateFindingSeverity,
  dedupeFindings,
  redactSensitiveEvidence,
  confidenceToUi,
  type AiEvidenceType,
  type AiConfidenceLevel,
} from "@/lib/ai/principles";
export {
  aiAuditResultSchema,
  parseAiAuditResult,
  AI_ISSUE_CATEGORIES,
  AI_SEVERITIES,
  AI_PRIORITIES,
  type AiAuditResult,
  type AiAuditResultNormalized,
  type AiFinding,
  type AiRecommendation,
} from "@/lib/ai/schema";
export {
  computeOverallScoreFromFindings,
  resolveOverallScore,
  clampScore,
} from "@/lib/ai/score";
