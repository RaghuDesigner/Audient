/**
 * Phase-1 mock Empty State props — COMPONENT-020.
 */

import type { EmptyStateProps } from "@/components/common/EmptyState";
import { EMPTY_STATE_DEFAULTS } from "@/config/empty-state";

export const MOCK_EMPTY_NO_AUDITS: EmptyStateProps = {
  variant: "no_audits",
  ...EMPTY_STATE_DEFAULTS.no_audits,
  size: "section",
  tier: "free",
};

export const MOCK_EMPTY_NO_REPORTS: EmptyStateProps = {
  variant: "no_reports",
  ...EMPTY_STATE_DEFAULTS.no_reports,
  size: "section",
  tier: "free",
};

export const MOCK_EMPTY_NO_NOTIFICATIONS: EmptyStateProps = {
  variant: "no_notifications",
  ...EMPTY_STATE_DEFAULTS.no_notifications,
  size: "page",
  tier: "free",
};

export const MOCK_EMPTY_NO_HISTORY: EmptyStateProps = {
  variant: "no_history",
  ...EMPTY_STATE_DEFAULTS.no_history,
  size: "page",
  tier: "free",
};

export const MOCK_EMPTY_NO_CREDITS: EmptyStateProps = {
  variant: "no_credits",
  ...EMPTY_STATE_DEFAULTS.no_credits,
  size: "section",
  tier: "free",
};
