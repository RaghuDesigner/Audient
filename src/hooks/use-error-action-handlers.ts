"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  ERROR_SYSTEM_DASHBOARD_ROUTE,
  ERROR_SYSTEM_HOME_ROUTE,
  type ErrorSystemAction,
  type ErrorSystemStateType,
} from "@/config/error-system-states";
import { useAuth } from "@/hooks/use-auth";
import { errorSystemAnalytics } from "@/lib/analytics/error-system-events";
import { useLoginModalControls } from "@/providers/login-modal-provider";

export type UseErrorActionHandlersOptions = {
  errorType: ErrorSystemStateType;
  errorId?: string | null;
  onRetry?: () => void | Promise<void>;
};

export type UseErrorActionHandlersResult = {
  runAction: (action: ErrorSystemAction) => Promise<void>;
  loading: boolean;
  dashboardRoute: string;
};

/**
 * Wires Error Actions to Next.js routing and Login Modal (session expired).
 */
export function useErrorActionHandlers({
  errorType,
  errorId = null,
  onRetry,
}: UseErrorActionHandlersOptions): UseErrorActionHandlersResult {
  const router = useRouter();
  const pathname = usePathname();
  const { isGuest, user } = useAuth();
  const { openLogin } = useLoginModalControls();
  const [loading, setLoading] = React.useState(false);

  const dashboardRoute =
    !isGuest && user ? ERROR_SYSTEM_DASHBOARD_ROUTE : ERROR_SYSTEM_HOME_ROUTE;

  const runAction = React.useCallback(
    async (action: ErrorSystemAction) => {
      if (action === "retry") {
        errorSystemAnalytics.retryClicked({
          errorType,
          errorId: errorId ?? undefined,
        });
      }
      if (action === "go_to_dashboard") {
        errorSystemAnalytics.dashboardClicked({
          errorType,
          errorId: errorId ?? undefined,
        });
      }

      switch (action) {
        case "retry": {
          setLoading(true);
          try {
            if (onRetry) {
              await onRetry();
            } else {
              router.refresh();
            }
          } finally {
            setLoading(false);
          }
          break;
        }
        case "go_to_dashboard":
          router.push(dashboardRoute);
          break;
        case "go_back":
          if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
          } else {
            router.push(dashboardRoute);
          }
          break;
        case "login":
          openLogin({
            source: "session_expired",
            nextPath: pathname ?? dashboardRoute,
          });
          break;
        default:
          break;
      }
    },
    [
      dashboardRoute,
      errorId,
      errorType,
      onRetry,
      openLogin,
      pathname,
      router,
    ],
  );

  return { runAction, loading, dashboardRoute };
}
