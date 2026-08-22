import { RolesClient } from "@/app/workspace/roles/roles-client";
import { LoginModalProvider } from "@/providers/login-modal-provider";
import { UpgradePlansModalProvider } from "@/providers/upgrade-plans-modal-provider";
import {
  ROLES_PERMISSIONS_STATES,
  type RolesPermissionsActorRole,
  type RolesPermissionsScreenState,
} from "@/config/roles-permissions-screen";
import { isRolesPermissionsActorRole } from "@/utils/roles-permissions-screen";

type RolesPageProps = {
  searchParams: Promise<{
    state?: string;
    actor?: string;
    saveFail?: string;
  }>;
};

/**
 * SCREEN-022 — Roles & Permissions (`/workspace/roles`).
 * Mock only. QA: `?state=loading|empty|error|success|unauthorized`
 * Actor override: `?actor=owner|admin|designer|analyst|viewer`
 */
export default async function RolesPage({ searchParams }: RolesPageProps) {
  const query = await searchParams;
  const state = parseState(query.state);
  const actor = parseRolesPermissionsActor(query.actor);
  const saveShouldFail = query.saveFail === "1" || query.saveFail === "true";

  return (
    <LoginModalProvider>
      <UpgradePlansModalProvider>
        <RolesClient
          state={state}
          actor={actor}
          saveShouldFail={saveShouldFail}
        />
      </UpgradePlansModalProvider>
    </LoginModalProvider>
  );
}

function parseState(
  value: string | undefined,
): RolesPermissionsScreenState | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if ((ROLES_PERMISSIONS_STATES as readonly string[]).includes(normalized)) {
    return normalized as RolesPermissionsScreenState;
  }
  return null;
}

function parseRolesPermissionsActor(
  value: string | undefined,
): RolesPermissionsActorRole | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (isRolesPermissionsActorRole(normalized)) return normalized;
  return null;
}
