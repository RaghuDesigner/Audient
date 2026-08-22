/**
 * Phase-1 curated AI tips — COMPONENT-019.
 * One tip per category minimum for rotation mix.
 */

import type { AiTip } from "@/config/ai-tips";

export const MOCK_AI_TIPS: AiTip[] = [
  {
    tipId: "tip-ux-cta",
    category: "ux",
    title: "One clear primary action",
    description:
      "Above the fold, keep a single dominant CTA. Competing buttons slow decisions and weaken conversion clarity.",
    illustrationUrl: null,
    readMoreHref: null,
  },
  {
    tipId: "tip-a11y-contrast",
    category: "accessibility",
    title: "Check text contrast early",
    description:
      "Body text should meet WCAG AA contrast (4.5:1). Low contrast hides content for many users and fails audits.",
    illustrationUrl: null,
    readMoreHref: null,
  },
  {
    tipId: "tip-seo-headings",
    category: "seo",
    title: "Use a clear heading ladder",
    description:
      "One H1 per page, then logical H2/H3 sections. Clear structure helps people and search engines understand the page.",
    illustrationUrl: null,
    readMoreHref: null,
  },
  {
    tipId: "tip-perf-images",
    category: "performance",
    title: "Compress hero images",
    description:
      "Large hero assets delay first paint on mobile. Prefer modern formats and right-sized dimensions for faster perceived speed.",
    illustrationUrl: null,
    readMoreHref: null,
  },
];

export const MOCK_AI_TIPS_EMPTY: AiTip[] = [];
