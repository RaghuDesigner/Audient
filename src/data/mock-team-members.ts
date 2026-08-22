/**
 * Mock Business team members — COMPONENT-052 / SCREEN-022.
 * Covers all five roles and statuses — no backend.
 */

import type { TeamMemberCardModel } from "@/utils/team-member-card";
import { MOCK_USER_DISPLAY_NAME } from "@/lib/auth/mock-session";

export function getMockTeamMembers(): TeamMemberCardModel[] {
  return [
    {
      id: "tm-owner-1",
      name: MOCK_USER_DISPLAY_NAME,
      email: "alex@audient.example",
      avatarUrl: null,
      role: "owner",
      status: "active",
      lastActive: "Just now",
    },
    {
      id: "tm-admin-1",
      name: "Jordan Lee",
      email: "jordan@audient.example",
      avatarUrl: null,
      role: "admin",
      status: "active",
      lastActive: "2 hours ago",
    },
    {
      id: "tm-designer-1",
      name: "Sam Patel",
      email: "sam@audient.example",
      avatarUrl: null,
      role: "designer",
      status: "invited",
      lastActive: "Invite pending",
    },
    {
      id: "tm-analyst-1",
      name: "Riley Chen",
      email: "riley@audient.example",
      avatarUrl: null,
      role: "analyst",
      status: "active",
      lastActive: "Yesterday",
    },
    {
      id: "tm-viewer-1",
      name: "Casey Nguyen",
      email: "casey@audient.example",
      avatarUrl: null,
      role: "viewer",
      status: "suspended",
      lastActive: "12 days ago",
    },
  ];
}
