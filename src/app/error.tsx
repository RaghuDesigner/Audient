"use client";

import * as React from "react";

import { SystemStateScreen } from "@/components/system/SystemStateScreen";
import { LoginModalProvider } from "@/providers/login-modal-provider";
import { generateMockErrorId } from "@/utils/error-system-states";

type AppErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Route-level error boundary — sanitized UI only (SCREEN-025).
 * Never renders `error.message` or stack traces.
 */
export default function AppError({ error, reset }: AppErrorProps) {
  const errorId = React.useMemo(
    () => generateMockErrorId(error.digest ?? "server-error"),
    [error.digest],
  );

  return (
    <LoginModalProvider>
      <SystemStateScreen
        stateType="server_error"
        errorId={errorId}
        onRetry={reset}
      />
    </LoginModalProvider>
  );
}
