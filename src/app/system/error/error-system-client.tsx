"use client";

import * as React from "react";

import { SystemStateScreen } from "@/components/system/SystemStateScreen";
import { type ErrorSystemStateType } from "@/config/error-system-states";

export type ErrorSystemClientProps = {
  state?: ErrorSystemStateType | null;
};

/**
 * SCREEN-025 QA client — mock error surfaces via `?state=`.
 */
export function ErrorSystemClient({ state = "generic_error" }: ErrorSystemClientProps) {
  const [retryKey, setRetryKey] = React.useState(0);
  const resolved = state ?? "generic_error";

  return (
    <SystemStateScreen
      key={`${resolved}-${retryKey}`}
      stateType={resolved}
      onRetry={async () => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        setRetryKey((value) => value + 1);
      }}
    />
  );
}
