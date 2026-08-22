import "server-only";

import { isIP } from "node:net";

import { validateHttpsUrl } from "@/utils/url-validation";

const FETCH_TIMEOUT_MS = 12_000;
const MAX_BYTES = 400_000;
const MAX_EXCERPT_CHARS = 12_000;

function isPrivateIp(ip: string): boolean {
  const v = ip.toLowerCase();
  if (v === "::1" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80")) {
    return true;
  }
  if (v.includes(":")) return false;
  const parts = v.split(".").map((p) => Number(p));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true;
  const a = parts[0]!;
  const b = parts[1]!;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

/**
 * Fetch public HTTPS page text for URL audits with basic SSRF guards.
 * Hostname denylist via validateHttpsUrl; blocks private literal IPs; size/timeout capped.
 */
export async function fetchUrlAuditEvidence(websiteUrl: string): Promise<{
  excerpt: string;
  finalUrl: string;
}> {
  const validated = validateHttpsUrl(websiteUrl);
  if (!validated.ok) {
    throw new Error("INVALID_URL");
  }

  const hostname = new URL(validated.href).hostname;
  if (isIP(hostname) && isPrivateIp(hostname)) {
    throw new Error("SSRF_BLOCKED");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(validated.href, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "AudientAuditBot/1.0 (+https://audient.app)",
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error("URL_UNREACHABLE");
    }

    const finalUrl = response.url || validated.href;
    const finalCheck = validateHttpsUrl(finalUrl);
    if (!finalCheck.ok) {
      throw new Error("SSRF_BLOCKED");
    }
    const finalHost = new URL(finalCheck.href).hostname;
    if (isIP(finalHost) && isPrivateIp(finalHost)) {
      throw new Error("SSRF_BLOCKED");
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (
      contentType &&
      !contentType.includes("text/") &&
      !contentType.includes("html") &&
      !contentType.includes("xml")
    ) {
      throw new Error("SITE_BLOCKS_BOT");
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("URL_UNREACHABLE");
    }

    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > MAX_BYTES) {
        reader.cancel().catch(() => undefined);
        break;
      }
      chunks.push(value);
    }

    const buffer = Buffer.concat(chunks.map((c) => Buffer.from(c)));
    const html = buffer.toString("utf8");
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!text) {
      throw new Error("URL_UNREACHABLE");
    }

    return {
      excerpt: text.slice(0, MAX_EXCERPT_CHARS),
      finalUrl: finalCheck.href,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") throw new Error("CRAWL_TIMEOUT");
      if (
        error.message === "SSRF_BLOCKED" ||
        error.message === "URL_UNREACHABLE" ||
        error.message === "CRAWL_TIMEOUT" ||
        error.message === "SITE_BLOCKS_BOT" ||
        error.message === "INVALID_URL"
      ) {
        throw error;
      }
    }
    throw new Error("URL_UNREACHABLE");
  } finally {
    clearTimeout(timer);
  }
}
