import { LegalClient } from "@/app/legal/legal-client";
import { LoginModalProvider } from "@/providers/login-modal-provider";
import { UpgradePlansModalProvider } from "@/providers/upgrade-plans-modal-provider";
import {
  LEGAL_PRIVACY_STATES,
  type LegalPrivacyScreenState,
} from "@/config/legal-privacy-screen";

type LegalDocumentPageProps = {
  params: Promise<{
    document: string;
  }>;
  searchParams: Promise<{
    state?: string;
  }>;
};

/**
 * SCREEN-024 — Legal document deep link (`/legal/{document}`).
 * Mock only. QA: `?state=loading|success|error`.
 */
export default async function LegalDocumentPage({
  params,
  searchParams,
}: LegalDocumentPageProps) {
  const [{ document }, query] = await Promise.all([params, searchParams]);
  const state = parseLegalPrivacyState(query.state);

  return (
    <LoginModalProvider>
      <UpgradePlansModalProvider>
        <LegalClient documentSlug={document} state={state} />
      </UpgradePlansModalProvider>
    </LoginModalProvider>
  );
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
