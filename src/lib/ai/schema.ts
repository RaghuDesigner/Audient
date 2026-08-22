import { z } from "zod";

import { validateFindingIndices } from "@/utils/audit-evidence-enforcement";

/** BACKEND-011 evidence / confidence enums */
export const AI_EVIDENCE_TYPES = ["OBSERVED", "INFERRED", "UNVERIFIED"] as const;
export const AI_CONFIDENCE_LEVELS = ["HIGH", "MEDIUM", "LOW"] as const;

/** Matches public.issue_category */
export const AI_ISSUE_CATEGORIES = [
  "NAVIGATION",
  "CTA",
  "VISUAL_HIERARCHY",
  "MOBILE_RESPONSIVENESS",
  "COPY_MESSAGING",
  "TRUST_SIGNALS",
  "PAGE_SPEED",
  "ACCESSIBILITY",
  "CONVERSION_FLOW",
] as const;

/** Matches public.severity (post remap) */
export const AI_SEVERITIES = [
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
  "INFO",
] as const;

/** Matches public.recommendation_priority */
export const AI_PRIORITIES = ["HIGH", "MEDIUM", "LOW"] as const;

const scoreSchema = z.number().min(0).max(100);

export const aiFindingSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  severity: z.enum(AI_SEVERITIES),
  category: z.enum(AI_ISSUE_CATEGORIES),
  evidence: z.string().max(1000).optional().nullable(),
  /** OBSERVED | INFERRED | UNVERIFIED — BACKEND-011 */
  evidence_type: z.enum(AI_EVIDENCE_TYPES),
  /** HIGH | MEDIUM | LOW — reflects evidence quality */
  confidence: z.enum(AI_CONFIDENCE_LEVELS),
  /** Why this matters for the user */
  user_impact: z.string().min(1).max(1000),
});

export const aiRecommendationSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  priority: z.enum(AI_PRIORITIES),
  category: z.enum(AI_ISSUE_CATEGORIES),
  expectedImprovement: z.string().min(1).max(1000),
  findingIndex: z.number().int().min(0).optional().nullable(),
});

export const aiAuditResultSchema = z.object({
  /** Model estimate 0–100; persistence may recompute from findings. */
  overall_score: scoreSchema,
  summary: z.string().min(1).max(4000),
  category_scores: z.object({
    NAVIGATION: scoreSchema,
    CTA: scoreSchema,
    VISUAL_HIERARCHY: scoreSchema,
    MOBILE_RESPONSIVENESS: scoreSchema,
    COPY_MESSAGING: scoreSchema,
    TRUST_SIGNALS: scoreSchema,
    PAGE_SPEED: scoreSchema,
    ACCESSIBILITY: scoreSchema,
    CONVERSION_FLOW: scoreSchema,
  }),
  findings: z.array(aiFindingSchema).min(1).max(25),
  recommendations: z.array(aiRecommendationSchema).min(1).max(25),
});

export type AiAuditResult = z.infer<typeof aiAuditResultSchema>;
export type AiFinding = z.infer<typeof aiFindingSchema>;
export type AiRecommendation = z.infer<typeof aiRecommendationSchema>;

/** Normalized camelCase shape used by persistence / scoring. */
export type AiAuditResultNormalized = {
  overallScore: number;
  summary: string;
  categoryScores: AiAuditResult["category_scores"];
  findings: AiFinding[];
  recommendations: AiRecommendation[];
};

export function parseAiAuditResult(
  value: unknown,
):
  | { ok: true; data: AiAuditResultNormalized }
  | { ok: false; error: string } {
  const parsed = aiAuditResultSchema.safeParse(value);
  if (!parsed.success) {
    return { ok: false, error: "AI output failed schema validation" };
  }
  const d = parsed.data;
  const indexCheck = validateFindingIndices(
    d.findings.length,
    d.recommendations,
  );
  if (!indexCheck.ok) {
    return { ok: false, error: indexCheck.error };
  }
  return {
    ok: true,
    data: {
      overallScore: d.overall_score,
      summary: d.summary,
      categoryScores: d.category_scores,
      findings: d.findings,
      recommendations: d.recommendations,
    },
  };
}

/** JSON Schema for OpenAI structured outputs (snake_case keys). */
export const aiAuditResultJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "overall_score",
    "summary",
    "category_scores",
    "findings",
    "recommendations",
  ],
  properties: {
    overall_score: { type: "number", minimum: 0, maximum: 100 },
    summary: { type: "string" },
    category_scores: {
      type: "object",
      additionalProperties: false,
      required: [...AI_ISSUE_CATEGORIES],
      properties: Object.fromEntries(
        AI_ISSUE_CATEGORIES.map((k) => [
          k,
          { type: "number", minimum: 0, maximum: 100 },
        ]),
      ),
    },
    findings: {
      type: "array",
      minItems: 1,
      maxItems: 25,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "title",
          "description",
          "severity",
          "category",
          "evidence",
          "evidence_type",
          "confidence",
          "user_impact",
        ],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          severity: { type: "string", enum: [...AI_SEVERITIES] },
          category: { type: "string", enum: [...AI_ISSUE_CATEGORIES] },
          evidence: { type: ["string", "null"] },
          evidence_type: { type: "string", enum: [...AI_EVIDENCE_TYPES] },
          confidence: { type: "string", enum: [...AI_CONFIDENCE_LEVELS] },
          user_impact: { type: "string" },
        },
      },
    },
    recommendations: {
      type: "array",
      minItems: 1,
      maxItems: 25,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "title",
          "description",
          "priority",
          "category",
          "expectedImprovement",
          "findingIndex",
        ],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          priority: { type: "string", enum: [...AI_PRIORITIES] },
          category: { type: "string", enum: [...AI_ISSUE_CATEGORIES] },
          expectedImprovement: { type: "string" },
          findingIndex: { type: ["integer", "null"] },
        },
      },
    },
  },
} as const;
