import { WorkspaceClient } from "@/app/workspace/workspace-client";
import { LoginModalProvider } from "@/providers/login-modal-provider";
import { UpgradePlansModalProvider } from "@/providers/upgrade-plans-modal-provider";
import {
  BUSINESS_WORKSPACE_STATES,
  type BusinessWorkspaceScreenState,
} from "@/config/business-workspace-screen";

type WorkspacePageProps = {
  searchParams: Promise<{
    state?: string;
  }>;
};

/**
 * SCREEN-020 — Business Workspace (`/workspace`).
 * Mock only. QA: `?state=loading|empty|error|success`.
 * Guests → sign-in; Free/Pro → upgrade gate; Business → full hub.
 */
export default async function WorkspacePage({
  searchParams,
}: WorkspacePageProps) {
  const query = await searchParams;
  const state = parseState(query.state);

  return (
    <LoginModalProvider>
      <UpgradePlansModalProvider>
        <WorkspaceClient state={state} />
      </UpgradePlansModalProvider>
    </LoginModalProvider>
  );
}

function parseState(
  value: string | undefined,
): BusinessWorkspaceScreenState | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if ((BUSINESS_WORKSPACE_STATES as readonly string[]).includes(normalized)) {
    return normalized as BusinessWorkspaceScreenState;
  }
  return null;
}
