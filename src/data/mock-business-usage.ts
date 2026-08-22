/**
 * Mock Business usage — COMPONENT-056.
 * Credits align with centralized mock app state — no backend.
 */

import type { MockAppCredits } from "@/data/mock-app-state";
import {
  BUSINESS_USAGE_DEFAULT_MONTHLY_AUDIT_SOFT_CAP,
  BUSINESS_USAGE_DEFAULT_STORAGE_QUOTA_GB,
} from "@/config/business-usage-widget";
import { PLANS } from "@/config/plans";
import { MOCK_DEMO_CREDITS_USED } from "@/lib/auth/mock-membership";
import type { BusinessUsageMetrics } from "@/utils/business-usage-widget";

export function getMockBusinessUsage(
  credits?: MockAppCredits | null,
): BusinessUsageMetrics {
  const creditsGrant =
    credits?.monthlyAllocation ?? PLANS.ENTERPRISE.monthlyCredits;
  const creditsUsed = credits?.used ?? MOCK_DEMO_CREDITS_USED.ENTERPRISE;
  const creditsRemaining =
    credits?.remaining ?? Math.max(0, creditsGrant - creditsUsed);

  return {
    totalAudits: 148,
    monthlyAudits: 42,
    creditsUsed,
    creditsRemaining,
    creditsGrant,
    storageUsedGb: 12.5,
    storageQuotaGb: BUSINESS_USAGE_DEFAULT_STORAGE_QUOTA_GB,
    activeMembers: 9,
    chartSeries: [
      { label: "Mon", value: 4 },
      { label: "Tue", value: 7 },
      { label: "Wed", value: 5 },
      { label: "Thu", value: 9 },
      { label: "Fri", value: 6 },
      { label: "Sat", value: 2 },
      { label: "Sun", value: 3 },
    ],
  };
}

export const MOCK_BUSINESS_MONTHLY_AUDIT_SOFT_CAP =
  BUSINESS_USAGE_DEFAULT_MONTHLY_AUDIT_SOFT_CAP;
