/**
 * Mock Business team activity feed — COMPONENT-055.
 * Covers all activity types — no realtime / no backend.
 */

import type { TeamActivityItem } from "@/utils/team-activity-card";
import { MOCK_USER_DISPLAY_NAME } from "@/lib/auth/mock-session";

/** Newest first. */
export function getMockTeamActivity(): TeamActivityItem[] {
  return [
    {
      id: "ta-1",
      type: "audit_completed",
      userName: "Jordan Lee",
      description: "Completed audit for checkout.example.com",
      timestamp: "12 min ago",
    },
    {
      id: "ta-2",
      type: "member_invited",
      userName: MOCK_USER_DISPLAY_NAME,
      description: "Invited sam@audient.example as Manager",
      timestamp: "1 hour ago",
    },
    {
      id: "ta-3",
      type: "audit_created",
      userName: "Sam Patel",
      description: "Started audit for mobile onboarding screens",
      timestamp: "3 hours ago",
    },
    {
      id: "ta-4",
      type: "role_changed",
      userName: MOCK_USER_DISPLAY_NAME,
      description: "Changed Casey Nguyen from Viewer to Manager",
      timestamp: "Yesterday",
    },
    {
      id: "ta-5",
      type: "audit_deleted",
      userName: "Jordan Lee",
      description: "Deleted audit “Legacy homepage v1”",
      timestamp: "2 days ago",
    },
    {
      id: "ta-6",
      type: "member_removed",
      userName: MOCK_USER_DISPLAY_NAME,
      description: "Removed guest.contractor@example.com from the team",
      timestamp: "3 days ago",
    },
    {
      id: "ta-7",
      type: "subscription_updated",
      userName: null,
      description: "Business plan renewed for the workspace",
      timestamp: "1 week ago",
    },
  ];
}
