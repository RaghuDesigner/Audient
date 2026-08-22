/**
 * Phase-1 mock Upgrade Banner — COMPONENT-012 / SCREEN-007.
 */

import type { UpgradeBannerVariant } from "@/config/upgrade-banner";

export type MockUpgradeBanner = {
  variant: UpgradeBannerVariant;
  source: string;
  auditId?: string | null;
  dismissible: boolean;
};

export const MOCK_GUEST_UPGRADE_BANNER: MockUpgradeBanner = {
  variant: "guest",
  source: "guest_results",
  auditId: "mock-guest-preview",
  dismissible: false,
};

export const MOCK_UPGRADE_BANNERS: MockUpgradeBanner[] = [
  MOCK_GUEST_UPGRADE_BANNER,
  {
    variant: "free",
    source: "free_results",
    auditId: "mock-free-preview",
    dismissible: true,
  },
  {
    variant: "business",
    source: "pro_upsell",
    auditId: null,
    dismissible: true,
  },
];
