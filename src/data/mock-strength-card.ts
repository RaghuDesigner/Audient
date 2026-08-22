/**
 * Phase-1 mock Strength Card props — COMPONENT-028.
 * Category / impact / screenshot samples for QA; no API.
 */

import type {
  StrengthCardCategory,
  StrengthCardImpactLevel,
  StrengthCardState,
  StrengthCardVariant,
} from "@/config/strength-card";

const MOCK_SHOT =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180' viewBox='0 0 320 180'%3E%3Crect fill='%23e8f5ee' width='320' height='180'/%3E%3Ctext x='160' y='96' text-anchor='middle' fill='%232d6a4f' font-family='system-ui' font-size='14'%3EStrength%3C/text%3E%3C/svg%3E";

/** Data props for StrengthCard (callbacks omitted). */
export type MockStrengthCard = {
  strengthId: string;
  title: string;
  description: string;
  category: StrengthCardCategory;
  aiConfidence: number | null;
  impactLevel: StrengthCardImpactLevel | null;
  screenshotUrl: string | null;
  screenshotAlt?: string | null;
  state: StrengthCardState;
  variant?: StrengthCardVariant;
  /** Default uncontrolled expand for demos. */
  defaultExpanded?: boolean;
};

/** Aligns with SCREEN-010 Acme report strength ids. */
export const MOCK_STRENGTH_CARD_HIERARCHY: MockStrengthCard = {
  strengthId: "strength-hierarchy",
  title: "Clear visual hierarchy on the home hero",
  description:
    "Headline, supporting copy, and CTA stack in a readable order that guides first-time visitors toward the primary action without competing focal points.",
  category: "visual_design",
  aiConfidence: 0.92,
  impactLevel: "high",
  screenshotUrl: MOCK_SHOT,
  screenshotAlt: "Home hero with clear headline, supporting copy, and CTA stack",
  state: "default",
  variant: "report",
  defaultExpanded: true,
};

export const MOCK_STRENGTH_CARD_NAV: MockStrengthCard = {
  strengthId: "strength-nav",
  title: "Primary navigation labels are plain-language",
  description:
    "Menu items use familiar terms, reducing cognitive load for new users exploring the product and making destinations easier to predict.",
  category: "navigation",
  aiConfidence: 0.88,
  impactLevel: "high",
  screenshotUrl: null,
  state: "default",
  variant: "report",
};

export const MOCK_STRENGTH_CARD_FORMS: MockStrengthCard = {
  strengthId: "strength-forms",
  title: "Contact form fields are clearly labeled",
  description:
    "Visible labels stay associated with inputs, helping users complete the form without guessing what each field expects.",
  category: "forms",
  aiConfidence: 0.85,
  impactLevel: "medium",
  screenshotUrl: MOCK_SHOT,
  screenshotAlt: "Contact form with visible labels next to each input",
  state: "default",
  variant: "report",
};

export const MOCK_STRENGTH_CARD_SEO: MockStrengthCard = {
  strengthId: "strength-seo-titles",
  title: "Page titles describe unique page purpose",
  description:
    "Most routes use distinct titles that match on-page H1 intent for search clarity and clearer browser-tab orientation.",
  category: "seo",
  aiConfidence: 0.79,
  impactLevel: "medium",
  screenshotUrl: null,
  state: "default",
  variant: "report",
};

export const MOCK_STRENGTH_CARD_RESPONSIVE: MockStrengthCard = {
  strengthId: "strength-responsive",
  title: "Layout reflows cleanly at tablet widths",
  description:
    "Key marketing sections stack without horizontal scroll between common breakpoints, keeping content readable on mid-size devices.",
  category: "mobile_ux",
  aiConfidence: 0.81,
  impactLevel: "medium",
  screenshotUrl: null,
  state: "default",
  variant: "report",
};

export const MOCK_STRENGTH_CARD_A11Y: MockStrengthCard = {
  strengthId: "strength-focus-ring",
  title: "Focus indicators remain visible on primary controls",
  description:
    "Keyboard users can track focus on buttons and links with a clear outline that meets contrast expectations against the surface.",
  category: "accessibility",
  aiConfidence: 0.9,
  impactLevel: "high",
  screenshotUrl: MOCK_SHOT,
  screenshotAlt: "Primary button showing a visible keyboard focus ring",
  state: "default",
};

export const MOCK_STRENGTH_CARD_LOADING: MockStrengthCard = {
  strengthId: "strength-loading",
  title: "",
  description: "",
  category: "content",
  aiConfidence: null,
  impactLevel: null,
  screenshotUrl: null,
  state: "loading",
};

export const MOCK_STRENGTH_CARD_ERROR: MockStrengthCard = {
  strengthId: "strength-error",
  title: "",
  description: "",
  category: "content",
  aiConfidence: null,
  impactLevel: null,
  screenshotUrl: null,
  state: "error",
};

/** Full Acme report list — COMPONENT-028 enriched strengths. */
export const MOCK_STRENGTH_CARDS_REPORT: MockStrengthCard[] = [
  MOCK_STRENGTH_CARD_HIERARCHY,
  MOCK_STRENGTH_CARD_NAV,
  MOCK_STRENGTH_CARD_FORMS,
  MOCK_STRENGTH_CARD_SEO,
  MOCK_STRENGTH_CARD_RESPONSIVE,
];

export const MOCK_STRENGTH_CARD_BY_STATE: Record<
  StrengthCardState,
  MockStrengthCard
> = {
  loading: MOCK_STRENGTH_CARD_LOADING,
  default: MOCK_STRENGTH_CARD_HIERARCHY,
  error: MOCK_STRENGTH_CARD_ERROR,
};

export function getMockStrengthCard(
  state: StrengthCardState = "default",
  overrides?: Partial<MockStrengthCard>,
): MockStrengthCard {
  return { ...MOCK_STRENGTH_CARD_BY_STATE[state], ...overrides };
}
