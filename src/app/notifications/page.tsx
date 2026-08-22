import { NotificationsClient } from "@/app/notifications/notifications-client";
import { LoginModalProvider } from "@/providers/login-modal-provider";
import { UpgradePlansModalProvider } from "@/providers/upgrade-plans-modal-provider";
import {
  NOTIFICATIONS_STATES,
  type NotificationsScreenState,
} from "@/config/notifications-screen";

type NotificationsPageProps = {
  searchParams: Promise<{
    state?: string;
    empty?: string;
  }>;
};

/**
 * SCREEN-018 — Notifications (`/notifications`).
 * Mock only. QA: `?state=loading|error|empty|success` `?empty=1`.
 * Guests → sign-in via client shell.
 */
export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  const query = await searchParams;
  const state = parseState(query.state);
  const empty = query.empty === "1" || query.empty === "true";

  return (
    <LoginModalProvider>
      <UpgradePlansModalProvider>
        <NotificationsClient state={state} empty={empty} />
      </UpgradePlansModalProvider>
    </LoginModalProvider>
  );
}

function parseState(
  value: string | undefined,
): NotificationsScreenState | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if ((NOTIFICATIONS_STATES as readonly string[]).includes(normalized)) {
    return normalized as NotificationsScreenState;
  }
  return null;
}
