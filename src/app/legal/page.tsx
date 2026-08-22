import { LegalClient } from "@/app/legal/legal-client";
import { LoginModalProvider } from "@/providers/login-modal-provider";
import { UpgradePlansModalProvider } from "@/providers/upgrade-plans-modal-provider";
import { redirect } from "next/navigation";

import {
  LEGAL_PRIVACY_DEFAULT_DOCUMENT,
  LEGAL_PRIVACY_ROUTE,
  LEGAL_PRIVACY_STATES,
  type LegalPrivacyScreenState,
} from "@/config/legal-privacy-screen";

type LegalPageProps = {
  searchParams: Promise<{
    state?: string;
  }>;
};

/**
 * SCREEN-024 — Legal & Privacy hub (`/legal`).
 * Redirects to default document. QA: `?state=loading|success|error`.
 */
export default async function LegalPage({ searchParams }: LegalPageProps) {
  const query = await searchParams;
  const state = parseLegalPrivacyState(query.state);

  if (state) {
    return (
      <LoginModalProvider>
        <UpgradePlansModalProvider>
          <LegalClient state={state} />
        </UpgradePlansModalProvider>
      </LoginModalProvider>
    );
  }

  redirect(`${LEGAL_PRIVACY_ROUTE}/${LEGAL_PRIVACY_DEFAULT_DOCUMENT}`);
}

function parseLegalPrivacyState(
  value: string | undefined,
): LegalPrivacyScreenState | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if ((LEGAL_PRIVACY_STATES as readonly string[]).includes(normalized)) {
    return normalized as LegalPrivacyScreenState;
  }
  return null;
}
