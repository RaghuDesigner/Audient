/**
 * Audit failure taxonomy — SCREEN-003 / SCREEN-M03.
 * One reusable template parameterized by code.
 */

export const AUDIT_FAILURE_CODES = [
  "SSRF_BLOCKED",
  "CRAWL_TIMEOUT",
  "SITE_BLOCKS_BOT",
  "URL_UNREACHABLE",
  "AI_UNAVAILABLE",
  "AI_TIMEOUT",
  "AI_RATE_LIMITED",
  "SCREENSHOT_INVALID",
  "PAGE_TOO_HEAVY",
  "INTERNAL_ERROR",
] as const;

export type AuditFailureCode = (typeof AUDIT_FAILURE_CODES)[number];

export type AuditFailureDefinition = {
  code: AuditFailureCode;
  title: string;
  description: string;
  retryAllowed: boolean;
  refundEligible: boolean;
};

export const AUDIT_FAILURE_CATALOG: Record<
  AuditFailureCode,
  AuditFailureDefinition
> = {
  SSRF_BLOCKED: {
    code: "SSRF_BLOCKED",
    title: "Unsupported website",
    description:
      "This address isn’t allowed, or we can’t audit this page type. Try a public homepage.",
    retryAllowed: false,
    refundEligible: true,
  },
  CRAWL_TIMEOUT: {
    code: "CRAWL_TIMEOUT",
    title: "Scan timed out",
    description:
      "The audit took too long and stopped. Try again or use a simpler page / screenshot.",
    retryAllowed: true,
    refundEligible: true,
  },
  SITE_BLOCKS_BOT: {
    code: "SITE_BLOCKS_BOT",
    title: "Access blocked",
    description:
      "The site blocked automated access. Try uploading a screenshot instead.",
    retryAllowed: true,
    refundEligible: true,
  },
  URL_UNREACHABLE: {
    code: "URL_UNREACHABLE",
    title: "Site unreachable",
    description:
      "We couldn’t reach this site. Check the URL or your connection, then retry.",
    retryAllowed: true,
    refundEligible: true,
  },
  AI_UNAVAILABLE: {
    code: "AI_UNAVAILABLE",
    title: "AI temporarily unavailable",
    description:
      "Our AI is temporarily unavailable. Please try again shortly.",
    retryAllowed: true,
    refundEligible: true,
  },
  AI_TIMEOUT: {
    code: "AI_TIMEOUT",
    title: "AI timed out",
    description:
      "The AI analysis took too long and stopped. Please retry.",
    retryAllowed: true,
    refundEligible: true,
  },
  AI_RATE_LIMITED: {
    code: "AI_RATE_LIMITED",
    title: "AI busy",
    description:
      "The AI provider is rate-limiting requests. Please wait a moment and retry.",
    retryAllowed: true,
    refundEligible: true,
  },
  SCREENSHOT_INVALID: {
    code: "SCREENSHOT_INVALID",
    title: "Screenshot unreadable",
    description:
      "We couldn’t read this image. Use a clear PNG, JPG, JPEG, or WEBP.",
    retryAllowed: true,
    // Create-time invalid uploads are 400 before credit deduction, so they
    // never reach failAudit. Processor-time SCREENSHOT_INVALID (missing or
    // unreadable stored evidence) refunds so lost-job failures are not charged.
    refundEligible: true,
  },
  PAGE_TOO_HEAVY: {
    code: "PAGE_TOO_HEAVY",
    title: "Image too large",
    description:
      "Use an image under the size limit, or try a simpler page.",
    retryAllowed: true,
    refundEligible: true,
  },
  INTERNAL_ERROR: {
    code: "INTERNAL_ERROR",
    title: "Something went wrong",
    description:
      "An unexpected error occurred. Retry or contact support with the error details.",
    retryAllowed: true,
    refundEligible: true,
  },
};

export type AuditFailureViewModel = AuditFailureDefinition & {
  auditId: string;
  correlationId: string;
  /** Mock / Phase-1: show refund confirmation when eligible. */
  refundApplied: boolean;
  technicalMessage?: string;
};

/** True when code is a known failure taxonomy entry. */
export function isAuditFailureCode(code: string): code is AuditFailureCode {
  return (AUDIT_FAILURE_CODES as readonly string[]).includes(code);
}

/** Resolve any code to a catalog entry; unknown → INTERNAL_ERROR. */
export function resolveAuditFailure(
  code: string | undefined | null,
): AuditFailureDefinition {
  if (code && isAuditFailureCode(code)) {
    return AUDIT_FAILURE_CATALOG[code];
  }
  return AUDIT_FAILURE_CATALOG.INTERNAL_ERROR;
}

/**
 * Phase-1 mock failure for UI QA.
 * Prefer `?fail=` query code when provided; otherwise INTERNAL_ERROR.
 */
export function createMockAuditFailure(options: {
  auditId: string;
  code?: string | null;
}): AuditFailureViewModel {
  const definition = resolveAuditFailure(options.code ?? "INTERNAL_ERROR");
  return {
    ...definition,
    auditId: options.auditId,
    correlationId: `corr-${options.auditId}`,
    refundApplied: definition.refundEligible,
    technicalMessage:
      "Mock failure for UI development. No backend audit worker ran.",
  };
}
