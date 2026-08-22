/**
 * COMPONENT-055 — Team Activity Card helpers.
 * Feed state helpers — no React / no API.
 */

import {
  TEAM_ACTIVITY_CARD_COPY,
  type TeamActivityCardState,
  type TeamActivityType,
} from "@/config/team-activity-card";

export type TeamActivityItem = {
  id: string;
  type: TeamActivityType;
  userName: string | null;
  description: string;
  timestamp: string;
};

export function resolveTeamActivityCardState(
  items: TeamActivityItem[],
  state?: TeamActivityCardState,
): TeamActivityCardState {
  if (state) return state;
  return items.length === 0 ? "empty" : "default";
}

export function displayTeamActivityUserName(
  userName: string | null | undefined,
): string {
  const trimmed = userName?.trim();
  return trimmed && trimmed.length > 0
    ? trimmed
    : TEAM_ACTIVITY_CARD_COPY.systemUser;
}
