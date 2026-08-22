/**
 * Invite Member Modal analytics — COMPONENT-053.
 * Dev stub — role only; no email in payloads.
 */

import {
  INVITE_MEMBER_MODAL_ANALYTICS_SOURCE,
  type InviteMemberRole,
} from "@/config/invite-member-modal";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function base(extra?: Props): Props {
  return {
    source: INVITE_MEMBER_MODAL_ANALYTICS_SOURCE,
    mock: true,
    ...extra,
  };
}

export const inviteMemberModalAnalytics = {
  opened: () => {
    track("invite_member_modal_opened", base());
  },

  sent: (props: { role: InviteMemberRole }) => {
    track("invite_member_sent", base({ role: props.role }));
  },

  cancelled: () => {
    track("invite_member_cancelled", base());
  },

  failed: (props?: { role?: InviteMemberRole }) => {
    track(
      "invite_member_failed",
      base(props?.role ? { role: props.role } : undefined),
    );
  },
};
