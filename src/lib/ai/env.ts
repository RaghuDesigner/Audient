import "server-only";

import { SupabaseEnvError } from "@/lib/supabase/env";

function isPlaceholder(value: string): boolean {
  const lower = value.toLowerCase();
  return (
    lower.includes("your-") ||
    lower.includes("changeme") ||
    lower.includes("placeholder") ||
    lower === "sk-..."
  );
}

/**
 * Server-only OpenAI API key.
 * Prefer OPENAI_API_KEY; AI_API_KEY accepted as documented alias.
 * Never use NEXT_PUBLIC_*.
 */
export function readOpenAiApiKey(): string | null {
  const key =
    process.env.OPENAI_API_KEY?.trim() ||
    process.env.AI_API_KEY?.trim() ||
    "";
  if (!key || isPlaceholder(key)) return null;
  return key;
}

export function hasOpenAiApiKey(): boolean {
  return readOpenAiApiKey() != null;
}

export function requireOpenAiApiKey(): string {
  const key = readOpenAiApiKey();
  if (!key) {
    throw new SupabaseEnvError(
      "Missing OPENAI_API_KEY (server-only). Set it in .env.local. Never expose via NEXT_PUBLIC_.",
    );
  }
  return key;
}

export function openAiModel(): string {
  return (
    process.env.OPENAI_AUDIT_MODEL?.trim() ||
    process.env.AI_AUDIT_MODEL?.trim() ||
    "gpt-4o-mini"
  );
}
