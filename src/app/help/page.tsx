import { HelpClient } from "@/app/help/help-client";
import { LoginModalProvider } from "@/providers/login-modal-provider";
import { UpgradePlansModalProvider } from "@/providers/upgrade-plans-modal-provider";
import {
  HELP_SUPPORT_STATES,
  type HelpSupportScreenState,
} from "@/config/help-support-screen";

type HelpPageProps = {
  searchParams: Promise<{
    state?: string;
  }>;
};

/**
 * SCREEN-023 — Help & Support (`/help`).
 * Mock only. QA: `?state=loading|success|error|empty-requests`.
 * Public route — guests see limited help; auth users see tickets.
 */
export default async function HelpPage({ searchParams }: HelpPageProps) {
  const query = await searchParams;
  const state = parseHelpSupportState(query.state);

  return (
    <LoginModalProvider>
      <UpgradePlansModalProvider>
        <HelpClient state={state} />
      </UpgradePlansModalProvider>
    </LoginModalProvider>
  );
}

function parseHelpSupportState(
  value: string | undefined,
): HelpSupportScreenState | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if ((HELP_SUPPORT_STATES as readonly string[]).includes(normalized)) {
    return normalized as HelpSupportScreenState;
  }
  return null;
}
