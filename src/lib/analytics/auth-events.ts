/**
 * Auth analytics events (LOGIN_SCREEN §26).
 * No tokens or auth codes — properties only. Wire to a real sink later.
 */

type AuthEventProps = Record<string, string | boolean | undefined>;

function track(event: string, props?: AuthEventProps): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const authAnalytics = {
  loginModalOpened: (source: string) =>
    track("login_modal_opened", { source }),
  loginModalDismissed: (source: string) =>
    track("login_modal_dismissed", { source }),
  oauthStarted: (provider: string) =>
    track("oauth_started", { provider }),
  oauthSucceeded: (provider: string) =>
    track("oauth_succeeded", { provider }),
  loginSuccess: (provider: string, isNewUser?: boolean) =>
    track("login_success", { provider, isNewUser }),
  loginFailed: (provider: string, reason: string) =>
    track("login_failed", { provider, reason }),
  oauthFailed: (provider: string, reason: string) =>
    track("oauth_failed", { provider, reason }),
};
