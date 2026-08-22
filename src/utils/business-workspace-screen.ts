/**
 * SCREEN-020 — Business Workspace helpers.
 * Access + scroll — no React / no API.
 */

import type { AuthPlanTier } from "@/types/auth";
import type { BusinessWorkspaceSectionId } from "@/config/business-workspace-screen";

export function isBusinessWorkspaceAllowed(
  planTier: AuthPlanTier | null | undefined,
): boolean {
  return planTier === "ENTERPRISE";
}

export function businessWorkspaceSectionElementId(
  section: BusinessWorkspaceSectionId,
): string {
  return `workspace-section-${section}`;
}
