import { SettingsClient } from "@/app/settings/settings-client";
import { LoginModalProvider } from "@/providers/login-modal-provider";
import { UpgradePlansModalProvider } from "@/providers/upgrade-plans-modal-provider";
import {
  SETTINGS_STATES,
  type SettingsScreenState,
} from "@/config/settings-screen";

type SettingsPageProps = {
  searchParams: Promise<{
    state?: string;
  }>;
};

/**
 * SCREEN-019 — Settings (`/settings`).
 * Mock only. QA: `?state=loading|error|success`.
 * Guests → sign-in via client shell.
 */
export default async function SettingsPage({
  searchParams,
}: SettingsPageProps) {
  const query = await searchParams;
  const state = parseState(query.state);

  return (
    <LoginModalProvider>
      <UpgradePlansModalProvider>
        <SettingsClient state={state} />
      </UpgradePlansModalProvider>
    </LoginModalProvider>
  );
}

function parseState(
  value: string | undefined,
): SettingsScreenState | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if ((SETTINGS_STATES as readonly string[]).includes(normalized)) {
    return normalized as SettingsScreenState;
  }
  return null;
}
