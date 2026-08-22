/**
 * AI Tips Card config — COMPONENT-019.
 * Curated catalog only — not live LLM output on the Dashboard.
 */

export const AI_TIP_CATEGORIES = [
  "ux",
  "accessibility",
  "seo",
  "performance",
] as const;

export type AiTipCategory = (typeof AI_TIP_CATEGORIES)[number];

export const AI_TIP_CATEGORY_LABELS: Record<AiTipCategory, string> = {
  ux: "UX",
  accessibility: "Accessibility",
  seo: "SEO",
  performance: "Performance",
};

export type AiTip = {
  tipId: string;
  category: AiTipCategory;
  title: string;
  description: string;
  /** Optional decorative illustration URL. */
  illustrationUrl?: string | null;
  /** Optional help article when Read More is a link. */
  readMoreHref?: string | null;
};

/** Auto-advance interval (ms). Disabled under prefers-reduced-motion. */
export const AI_TIP_ROTATE_MS = 8_000;
