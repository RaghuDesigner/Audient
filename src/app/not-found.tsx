import { LoginModalProvider } from "@/providers/login-modal-provider";
import { SystemStateScreen } from "@/components/system/SystemStateScreen";

/**
 * Global 404 — SCREEN-025 `not_found`.
 */
export default function NotFound() {
  return (
    <LoginModalProvider>
      <SystemStateScreen stateType="not_found" />
    </LoginModalProvider>
  );
}
