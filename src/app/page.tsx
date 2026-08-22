"use client";

import { HomeScreen } from "@/components/home/home-screen";
import { LoginModalProvider } from "@/providers/login-modal-provider";
import { UpgradePlansModalProvider } from "@/providers/upgrade-plans-modal-provider";

/**
 * Public Landing (SCREEN-001).
 * Login + Upgrade modals are provided at this boundary — not inside sections.
 */
export default function HomePage() {
  return (
    <LoginModalProvider>
      <UpgradePlansModalProvider>
        <HomeScreen />
      </UpgradePlansModalProvider>
    </LoginModalProvider>
  );
}
