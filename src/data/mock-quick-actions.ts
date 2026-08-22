/**
 * Phase-1 mock Quick Actions for Authenticated Dashboard.
 */

import type { QuickActionCardProps } from "@/components/dashboard/QuickActionCard";
import { QUICK_ACTION_DEFAULTS } from "@/config/quick-action";

export const MOCK_QUICK_ACTIONS: Array<
  Pick<QuickActionCardProps, "action" | "title" | "description" | "state">
> = [
  {
    action: "upload_screenshot",
    ...QUICK_ACTION_DEFAULTS.upload_screenshot,
    state: "default",
  },
  {
    action: "paste_url",
    ...QUICK_ACTION_DEFAULTS.paste_url,
    state: "default",
  },
  {
    action: "history",
    ...QUICK_ACTION_DEFAULTS.history,
    state: "default",
  },
];
