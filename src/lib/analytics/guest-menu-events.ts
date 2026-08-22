/**
 * Guest profile menu analytics (SCREEN-002 / COMPONENT-001).
 * Wire to a real sink later — no PII.
 */

type GuestMenuEventProps = Record<string, string | undefined>;

function track(event: string, props?: GuestMenuEventProps): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const guestMenuAnalytics = {
  opened: () => track("guest_menu_opened"),
  closed: (reason?: string) => track("guest_menu_closed", { reason }),
  loginClicked: () => track("guest_login_clicked"),
};
