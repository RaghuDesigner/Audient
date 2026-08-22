"use client";

import { DashboardClient } from "@/app/dashboard/dashboard-client";
import { LoginModalProvider } from "@/providers/login-modal-provider";
import { UpgradePlansModalProvider } from "@/providers/upgrade-plans-modal-provider";

/**
 * SCREEN-008 — Authenticated Dashboard (Phase-1 mock).
 * Plan / credits / audits from centralized mock app state.
 */
export default function DashboardPage() {
  return (
    <LoginModalProvider>
      <UpgradePlansModalProvider>
        <DashboardClient />
      </UpgradePlansModalProvider>
    </LoginModalProvider>
  );
}
