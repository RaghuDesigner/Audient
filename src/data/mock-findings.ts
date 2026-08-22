/**
 * Phase-1 mock findings for COMPONENT-010 / Guest Results.
 * Preview-safe only — parents slice to top 3 for guests.
 */

import type { AuditCategoryId } from "@/utils/category-score";
import type { FindingSeverity } from "@/utils/finding-severity";

export type MockFinding = {
  findingId: string;
  severity: FindingSeverity;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  thumbnailAlt: string | null;
  affectedPage: string | null;
  category: AuditCategoryId;
  recommendationPreview: string;
  priority: "P1" | "P2" | "P3" | "P4";
  /** BACKEND-011 — from AI report when available */
  evidenceType?: string | null;
  confidence?: string | null;
  userImpact?: string | null;
};

export const MOCK_FINDINGS: MockFinding[] = [
  {
    findingId: "finding-critical-cta",
    severity: "critical",
    title: "Primary CTA contrast is too low",
    description:
      "The main action button does not meet WCAG contrast for normal text, reducing visibility for many users and hurting conversion clarity.",
    thumbnailUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Crect fill='%23e8e8e8' width='160' height='160'/%3E%3Crect x='24' y='100' width='112' height='28' rx='6' fill='%23999'/%3E%3Ctext x='80' y='48' text-anchor='middle' fill='%23666' font-family='system-ui' font-size='12'%3ECTA crop%3C/text%3E%3C/svg%3E",
    thumbnailAlt: "Annotated crop of low-contrast primary CTA in the hero",
    affectedPage: "Home / Hero",
    category: "accessibility",
    recommendationPreview:
      "Raise primary button contrast to at least 4.5:1 and keep one dominant CTA above the fold.",
    priority: "P1",
  },
  {
    findingId: "finding-high-form",
    severity: "high",
    title: "Form errors rely on color alone",
    description:
      "Invalid fields are marked only with red borders. Users who cannot perceive color may miss errors entirely.",
    thumbnailUrl: null,
    thumbnailAlt: null,
    affectedPage: "Contact form",
    category: "usability",
    recommendationPreview:
      "Pair error borders with text or icons describing what to fix.",
    priority: "P1",
  },
  {
    findingId: "finding-medium-nav",
    severity: "medium",
    title: "Mobile nav targets are undersized",
    description:
      "Several header links fall below the recommended 44×44px tap target on small screens, increasing mis-taps.",
    thumbnailUrl: null,
    thumbnailAlt: null,
    affectedPage: "Global header",
    category: "usability",
    recommendationPreview:
      "Increase tap targets and spacing in the mobile navigation.",
    priority: "P2",
  },
  {
    findingId: "finding-low-meta",
    severity: "low",
    title: "Meta description is generic",
    description:
      "The default meta description does not summarize the page value, which can reduce click-through from search results.",
    thumbnailUrl: null,
    thumbnailAlt: null,
    affectedPage: "/",
    category: "seo",
    recommendationPreview:
      "Write a unique 150–160 character meta description focused on the primary user benefit.",
    priority: "P3",
  },
];

/** Guest preview — first three unlocked findings only. */
export const MOCK_GUEST_TOP_FINDINGS = MOCK_FINDINGS.slice(0, 3);
