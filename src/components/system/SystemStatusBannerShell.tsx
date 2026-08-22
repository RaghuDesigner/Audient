"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { SystemStatusBanner } from "@/components/system/SystemStatusBanner";
import { SYSTEM_STATUS_BANNER_QA_PARAM } from "@/config/system-status-banner";
import {
  getDefaultMockSystemStatus,
  resolveMockSystemStatus,
} from "@/data/mock-system-status";
import {
  parseSystemStatusBannerParam,
  readSystemStatusDismissed,
  writeSystemStatusDismissed,
} from "@/utils/system-status-banner";

/**
 * App-shell client wrapper — mock status from env, query param, or defaults.
 * QA: `?systemStatus=degraded|unavailable|maintenance|operational`
 */
export function SystemStatusBannerShell() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = React.useState(false);

  const queryStatus = parseSystemStatusBannerParam(
    searchParams.get(SYSTEM_STATUS_BANNER_QA_PARAM),
  );

  const mock = React.useMemo(
    () =>
      resolveMockSystemStatus(
        queryStatus ? { status: queryStatus } : getDefaultMockSystemStatus(),
      ),
    [queryStatus],
  );

  React.useEffect(() => {
    setDismissed(readSystemStatusDismissed(mock.status));
  }, [mock.status]);

  const handleDismiss = React.useCallback(() => {
    writeSystemStatusDismissed(mock.status, true);
    setDismissed(true);
  }, [mock.status]);

  const handleAction = React.useCallback(() => {
    router.refresh();
  }, [router]);

  if (dismissed && mock.dismissible) {
    return null;
  }

  return (
    <SystemStatusBanner
      status={mock.status}
      message={mock.message}
      actionLabel={mock.actionLabel}
      dismissible={mock.dismissible}
      onDismiss={mock.dismissible ? handleDismiss : undefined}
      onAction={mock.actionLabel ? handleAction : undefined}
      forceVisible={queryStatus === "operational"}
    />
  );
}
