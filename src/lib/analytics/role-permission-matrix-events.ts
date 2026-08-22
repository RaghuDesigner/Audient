/**
 * Role Permission Matrix analytics — COMPONENT-054.
 * Dev stub — no PII.
 */

import { ROLE_PERMISSION_MATRIX_ANALYTICS_SOURCE } from "@/config/role-permission-matrix";

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

function base(extra?: Props): Props {
  return {
    source: ROLE_PERMISSION_MATRIX_ANALYTICS_SOURCE,
    mock: true,
    ...extra,
  };
}

export const rolePermissionMatrixAnalytics = {
  viewed: () => {
    track("role_permission_matrix_viewed", base());
  },
};
