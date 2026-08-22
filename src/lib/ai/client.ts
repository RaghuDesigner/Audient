import "server-only";

import OpenAI from "openai";

import { openAiModel, requireOpenAiApiKey } from "@/lib/ai/env";
import {
  AI_AUDIT_SYSTEM_PROMPT,
  buildAiAuditUserPrompt,
} from "@/lib/ai/prompts";
import { normalizeAiAuditResult } from "@/lib/ai/principles";
import {
  aiAuditResultJsonSchema,
  parseAiAuditResult,
  type AiAuditResultNormalized,
} from "@/lib/ai/schema";
import { logError, logWarn } from "@/lib/log";

/** MVP cost controls — one completion per audit attempt (plus bounded provider retries). */
export const AI_MAX_OUTPUT_TOKENS = 3500;
export const AI_VISION_DETAIL = "low" as const;
export const AI_MAX_IMAGE_DATA_URL_CHARS = 5_500_000; // ~4MB
/** Hard bound on wall-clock OpenAI request time. */
export const AI_REQUEST_TIMEOUT_MS = 60_000;
/** Provider-level retries for transient failures only (not audit user retries). */
export const AI_PROVIDER_MAX_ATTEMPTS = 3;

export type RunAiAuditInput = {
  auditId: string;
  inputType: "SCREENSHOT" | "URL";
  websiteUrl: string | null;
  pageTextExcerpt: string | null;
  /** data URL or remote https URL for vision */
  imageUrl?: string | null;
};

export type AiFailureCode =
  | "AI_UNAVAILABLE"
  | "AI_TIMEOUT"
  | "AI_RATE_LIMITED"
  | "INTERNAL_ERROR";

export class AiProviderError extends Error {
  readonly code: AiFailureCode;
  /** Safe for logging; never includes API keys. */
  readonly internalMessage: string;
  readonly retryable: boolean;

  constructor(
    publicMessage: string,
    code: AiFailureCode = "AI_UNAVAILABLE",
    internalMessage?: string,
    retryable = false,
  ) {
    super(publicMessage);
    this.name = "AiProviderError";
    this.code = code;
    this.internalMessage = internalMessage ?? publicMessage;
    this.retryable = retryable;
  }
}

function createOpenAiClient(): OpenAI {
  return new OpenAI({
    apiKey: requireOpenAiApiKey(),
    timeout: AI_REQUEST_TIMEOUT_MS,
    maxRetries: 0, // we own retry policy
  });
}

function assertBoundedImage(imageUrl: string | null | undefined): void {
  if (!imageUrl) return;
  if (
    imageUrl.startsWith("data:image/") &&
    imageUrl.length > AI_MAX_IMAGE_DATA_URL_CHARS
  ) {
    throw new AiProviderError(
      "Screenshot is too large to analyze.",
      "INTERNAL_ERROR",
      "image data URL exceeds AI_MAX_IMAGE_DATA_URL_CHARS",
      false,
    );
  }
}

function classifyProviderError(error: unknown): AiProviderError {
  const anyErr = error as {
    status?: number;
    code?: string;
    message?: string;
    name?: string;
  };
  const status = anyErr?.status;
  const msg = String(anyErr?.message ?? "OpenAI request failed");
  const redacted = msg.replace(/sk-[a-zA-Z0-9._-]+/g, "[redacted]");
  const lower = redacted.toLowerCase();

  const isTimeout =
    anyErr?.code === "ETIMEDOUT" ||
    anyErr?.name === "APIConnectionTimeoutError" ||
    lower.includes("timeout") ||
    lower.includes("timed out");

  if (isTimeout) {
    return new AiProviderError(
      "The AI analysis took too long and stopped. Please retry.",
      "AI_TIMEOUT",
      redacted,
      true,
    );
  }

  if (status === 429) {
    return new AiProviderError(
      "The AI provider is rate-limiting requests. Please wait a moment and retry.",
      "AI_RATE_LIMITED",
      redacted,
      true,
    );
  }

  if (typeof status === "number" && status >= 500 && status < 600) {
    return new AiProviderError(
      "Our AI is temporarily unavailable. Please try again shortly.",
      "AI_UNAVAILABLE",
      redacted,
      true,
    );
  }

  // Auth / invalid request — do not retry
  if (status === 401 || status === 403 || status === 400) {
    return new AiProviderError(
      "Our AI is temporarily unavailable. Please try again shortly.",
      "AI_UNAVAILABLE",
      redacted,
      false,
    );
  }

  return new AiProviderError(
    "Our AI is temporarily unavailable. Please try again shortly.",
    "AI_UNAVAILABLE",
    redacted,
    false,
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Call OpenAI with structured JSON schema. Server-only.
 * Bounded timeout + transient retries. Never logs or returns the API key.
 */
export async function runAiUxAudit(
  input: RunAiAuditInput,
): Promise<AiAuditResultNormalized> {
  assertBoundedImage(input.imageUrl);

  const client = createOpenAiClient();
  const model = openAiModel();
  const userText = buildAiAuditUserPrompt(input);

  const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
    { type: "text", text: userText },
  ];

  if (input.imageUrl) {
    userContent.push({
      type: "image_url",
      image_url: { url: input.imageUrl, detail: AI_VISION_DETAIL },
    });
  }

  const requestBody: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming =
    {
      model,
      temperature: 0.2,
      max_tokens: AI_MAX_OUTPUT_TOKENS,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "audient_ux_audit",
          strict: true,
          schema: aiAuditResultJsonSchema as unknown as Record<string, unknown>,
        },
      },
      messages: [
        { role: "system", content: AI_AUDIT_SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
    };

  let lastError: AiProviderError | null = null;

  for (let attempt = 1; attempt <= AI_PROVIDER_MAX_ATTEMPTS; attempt++) {
    try {
      const completion = await client.chat.completions.create(requestBody);
      const raw = completion.choices[0]?.message?.content;
      if (!raw) {
        throw new AiProviderError(
          "Our AI is temporarily unavailable. Please try again shortly.",
          "AI_UNAVAILABLE",
          "Empty AI response",
          true,
        );
      }

      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(raw);
      } catch {
        // Invalid JSON is not safely retryable (same prompt likely same output).
        throw new AiProviderError(
          "We couldn’t process the AI response. Please retry.",
          "INTERNAL_ERROR",
          "AI returned invalid JSON",
          false,
        );
      }

      const parsed = parseAiAuditResult(parsedJson);
      if (!parsed.ok) {
        throw new AiProviderError(
          "We couldn’t process the AI response. Please retry.",
          "INTERNAL_ERROR",
          parsed.error,
          false,
        );
      }

      return normalizeAiAuditResult(parsed.data, {
        inputType: input.inputType,
      });
    } catch (error) {
      const classified =
        error instanceof AiProviderError ? error : classifyProviderError(error);
      lastError = classified;

      if (!classified.retryable || attempt >= AI_PROVIDER_MAX_ATTEMPTS) {
        logError("ai.provider_failed", {
          auditId: input.auditId,
          attempt,
          code: classified.code,
          retryable: classified.retryable,
          detail: classified.internalMessage.slice(0, 200),
        });
        throw classified;
      }

      const backoffMs = Math.min(8_000, 500 * 2 ** (attempt - 1));
      logWarn("ai.provider_retry", {
        auditId: input.auditId,
        attempt,
        nextAttempt: attempt + 1,
        code: classified.code,
        backoffMs,
      });
      await sleep(backoffMs);
    }
  }

  throw (
    lastError ??
    new AiProviderError(
      "Our AI is temporarily unavailable. Please try again shortly.",
      "AI_UNAVAILABLE",
      "exhausted retries",
      false,
    )
  );
}
