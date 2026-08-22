/**
 * Phase-1 mock Locked Cards — COMPONENT-011 / Guest Results teasers.
 * Counts are preview-safe only; no premium finding bodies.
 */

import type { LockedCardVariant } from "@/utils/locked-card";
import {
  defaultLockedCtaLabel,
  defaultLockedMessage,
  defaultLockedReason,
} from "@/utils/locked-card";

export type MockLockedCard = {
  variant: LockedCardVariant;
  message: string;
  ctaLabel: string;
  reason: string;
  lockedCount: number | null;
};

function mockCard(
  variant: Exclude<LockedCardVariant, "custom">,
  lockedCount: number | null = null,
): MockLockedCard {
  return {
    variant,
    message: defaultLockedMessage(variant, lockedCount),
    ctaLabel: defaultLockedCtaLabel(variant),
    reason: defaultLockedReason(variant),
    lockedCount,
  };
}

/** Guest Results stack — Figma teaser count 37. */
export const MOCK_LOCKED_FINDINGS_CARD = mockCard("findings", 37);

export const MOCK_LOCKED_CARDS: MockLockedCard[] = [
  MOCK_LOCKED_FINDINGS_CARD,
  mockCard("pdf"),
  mockCard("compare"),
  mockCard("accessibility_report"),
  mockCard("performance_report"),
  mockCard("seo_report"),
];
