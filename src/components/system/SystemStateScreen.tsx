"use client";

import * as React from "react";

import { ErrorStatePanel } from "@/components/system/ErrorStatePanel";
import { MaintenanceState } from "@/components/system/MaintenanceState";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/layout/footer";
import { SkipLink } from "@/components/layout/skip-link";
import type { ErrorSystemStateType } from "@/config/error-system-states";
import { getMockMaintenanceState } from "@/data/mock-maintenance-state";
import { useAuth } from "@/hooks/use-auth";
import { useErrorActionHandlers } from "@/hooks/use-error-action-handlers";
import { errorSystemAnalytics } from "@/lib/analytics/error-system-events";
import {
  useHeaderCredits,
  useHeaderPlanTier,
} from "@/hooks/use-app-state";
import {
  errorSystemStateShowsErrorId,
  generateMockErrorId,
} from "@/utils/error-system-states";
import { usePathname } from "next/navigation";

export type SystemStateScreenProps = {
  stateType: ErrorSystemStateType;
  /** Opaque correlation id — generated when omitted for id-bearing states. */
  errorId?: string | null;
  onRetry?: () => void | Promise<void>;
  /** Full app chrome vs panel-only (inline / boundary). */
  showShell?: boolean;
  surface?: "page" | "inline";
};

const MAIN_ID = "system-state-main";

/**
 * SCREEN-025 — full-page or inline system / error state shell.
 */
export function SystemStateScreen({
  stateType,
  errorId: errorIdProp = null,
  onRetry,
  showShell = true,
  surface = "page",
}: SystemStateScreenProps) {
  const pathname = usePathname();
  const { isGuest, user } = useAuth();
  const headerTier = useHeaderPlanTier();
  const headerCredits = useHeaderCredits();
  const viewed = React.useRef(false);

  const errorId = React.useMemo(() => {
    if (errorIdProp) return errorIdProp;
    if (!errorSystemStateShowsErrorId(stateType)) return null;
    return generateMockErrorId(`${stateType}-${pathname ?? "root"}`);
  }, [errorIdProp, pathname, stateType]);

  const { runAction, loading } = useErrorActionHandlers({
    errorType: stateType,
    errorId,
    onRetry,
  });

  React.useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    errorSystemAnalytics.viewed({
      errorType: stateType,
      errorId: errorId ?? undefined,
      surface,
    });
  }, [errorId, stateType, surface]);


  const mockMaintenance = React.useMemo(() => getMockMaintenanceState(), []);

  const panel =
    stateType === "maintenance" ? (
      <MaintenanceState
        expectedAvailability={mockMaintenance.expectedAvailability}
        loading={loading}
        size={showShell ? "page" : "section"}
        onRetry={() => void runAction("retry")}
        onBackToDashboard={() => void runAction("go_to_dashboard")}
      />
    ) : (
      <ErrorStatePanel
        stateType={stateType}
        errorId={errorId}
        loading={loading}
        size={showShell ? "page" : "section"}
        onPrimaryAction={(action) => void runAction(action)}
        onSecondaryAction={(action) => void runAction(action)}
      />
    );

  if (!showShell) {
    return panel;
  }

  const isAuthenticated = !isGuest && Boolean(user);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SkipLink href={`#${MAIN_ID}`} />
      {isAuthenticated ? (
        <DashboardHeader
          credits={headerCredits}
          displayName={user?.fullName ?? null}
          tier={headerTier}
        />
      ) : (
        <Header />
      )}

      <main
        id={MAIN_ID}
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-md py-xl lg:px-lg"
      >
        {panel}
      </main>

      <Footer />
    </div>
  );
}
