"use client";

import * as React from "react";

import { AuthSessionFallback } from "@/components/auth/AuthSessionFallback";
import { SettingsScreen } from "@/components/settings/SettingsScreen";
import {
  SETTINGS_COPY,
  SETTINGS_ROUTE,
  type SettingsScreenState,
} from "@/config/settings-screen";
import { getMockSettingsScreen } from "@/data/mock-settings-screen";
import { useAppState } from "@/hooks/use-app-state";
import { useRequireAuth } from "@/hooks/use-require-auth";

export type SettingsClientProps = {
  state?: SettingsScreenState | null;
};

/**
 * SCREEN-019 client shell — guest → sign-in; profile from session + account.
 */
export function SettingsClient({ state = null }: SettingsClientProps) {
  const { user, isReady } = useRequireAuth({ redirectTo: SETTINGS_ROUTE });
  const { appState, effectiveUser } = useAppState();
  const resolved = effectiveUser ?? user;

  const [bundle, setBundle] = React.useState(() =>
    getMockSettingsScreen({
      state: state ?? undefined,
    }),
  );

  React.useEffect(() => {
    if (!isReady || !resolved) return;
    setBundle(
      getMockSettingsScreen({
        userId: resolved.id,
        email: resolved.email,
        fullName: resolved.fullName ?? appState.user.displayName,
        avatarUrl: resolved.avatarUrl ?? appState.user.avatar,
        planTier: resolved.planTier,
        state: state ?? undefined,
      }),
    );
  }, [appState.user.avatar, appState.user.displayName, isReady, resolved, state]);

  if (!isReady || !resolved) {
    return <AuthSessionFallback message={SETTINGS_COPY.guestRedirect} />;
  }

  return (
    <SettingsScreen
      key={`${resolved.id}-${bundle.state}`}
      data={bundle}
      screenState={bundle.state}
      onRetry={() => {
        setBundle(
          getMockSettingsScreen({
            userId: resolved.id,
            email: resolved.email,
            fullName: resolved.fullName ?? appState.user.displayName,
            avatarUrl: resolved.avatarUrl ?? appState.user.avatar,
            planTier: resolved.planTier,
            state: "success",
          }),
        );
      }}
    />
  );
}
