"use client";

import * as React from "react";

import { MaintenanceState } from "@/components/system/MaintenanceState";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Header } from "@/components/home/header";
import { Footer } from "@/components/layout/footer";
import { SkipLink } from "@/components/layout/skip-link";
import { getMockMaintenanceState } from "@/data/mock-maintenance-state";
import { useAuth } from "@/hooks/use-auth";
import { useErrorActionHandlers } from "@/hooks/use-error-action-handlers";
import { errorSystemAnalytics } from "@/lib/analytics/error-system-events";
import {
  useHeaderCredits,
  useHeaderPlanTier,
} from "@/hooks/use-app-state";

export type MaintenanceStateScreenProps = {
  expectedAvailability?: string | null;
  onRetry?: () => void | Promise<void>;
  showShell?: boolean;
};

const MAIN_ID = "maintenance-state-main";

/**
 * COMPONENT-076 — full-page maintenance shell with app chrome.
 */
export function MaintenanceStateScreen({
  expectedAvailability: expectedAvailabilityProp,
  onRetry,
  showShell = true,
}: MaintenanceStateScreenProps) {
  const { isGuest, user } = useAuth();
  const headerTier = useHeaderPlanTier();
  const headerCredits = useHeaderCredits();
  const viewed = React.useRef(false);
  const mock = React.useMemo(() => getMockMaintenanceState(), []);

  const expectedAvailability =
    expectedAvailabilityProp !== undefined
      ? expectedAvailabilityProp
      : mock.expectedAvailability;

  const { runAction, loading } = useErrorActionHandlers({
    errorType: "maintenance",
    onRetry,
  });

  React.useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    errorSystemAnalytics.viewed({
      errorType: "maintenance",
      surface: "page",
    });
  }, []);

  const panel = (
    <MaintenanceState
      expectedAvailability={expectedAvailability}
      loading={loading}
      size={showShell ? "page" : "section"}
      onRetry={() => void runAction("retry")}
      onBackToDashboard={() => void runAction("go_to_dashboard")}
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
