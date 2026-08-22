import { LoginModalProvider } from "@/providers/login-modal-provider";
import { MaintenanceStateScreen } from "@/components/system/MaintenanceStateScreen";

/**
 * SCREEN-M17 — Maintenance full-page mock route.
 * QA: visit `/maintenance` or `/system/error?state=maintenance`
 */
export default function MaintenancePage() {
  return (
    <LoginModalProvider>
      <MaintenanceStateScreen />
    </LoginModalProvider>
  );
}
