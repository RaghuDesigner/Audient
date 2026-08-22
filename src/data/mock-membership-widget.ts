/**
 * Phase-1 mock Membership Widget — COMPONENT-018.
 */

import type { MembershipWidgetProps } from "@/components/dashboard/MembershipWidget";

export const MOCK_MEMBERSHIP_GUEST: MembershipWidgetProps = {
  state: "active",
  plan: "guest",
  renewalDate: null,
};

export const MOCK_MEMBERSHIP_FREE: MembershipWidgetProps = {
  state: "active",
  plan: "free",
  renewalDate: null,
};

export const MOCK_MEMBERSHIP_PRO: MembershipWidgetProps = {
  state: "active",
  plan: "pro",
  renewalDate: "2026-09-01T00:00:00.000Z",
};

export const MOCK_MEMBERSHIP_BUSINESS: MembershipWidgetProps = {
  state: "active",
  plan: "business",
  renewalDate: "2026-08-20T00:00:00.000Z",
};

export const MOCK_MEMBERSHIP_LOADING: MembershipWidgetProps = {
  state: "loading",
  plan: "free",
};

export const MOCK_MEMBERSHIP_EXPIRED: MembershipWidgetProps = {
  state: "expired",
  plan: "pro",
  renewalDate: "2026-07-01T00:00:00.000Z",
  statusDetail: "Payment past due — update billing to restore Pro features.",
};
