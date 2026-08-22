"use client";

import * as React from "react";

import { AuthSessionFallback } from "@/components/auth/AuthSessionFallback";
import { DashboardScreen } from "@/components/dashboard/DashboardScreen";
import { buildMockDashboardBundle } from "@/data/mock-app-state";
import type { MockDashboardBundle } from "@/data/mock-dashboard";
import { useAppState } from "@/hooks/use-app-state";
import { useRealAuditApi } from "@/hooks/use-real-audit-api";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { fetchAuditHistory } from "@/lib/audits/client";
import type { AuditListItem } from "@/types/audit";
import type { MockRecentAudit } from "@/data/mock-recent-audits";
import type { RecentAuditPlanUsed } from "@/utils/recent-audit";

function mapRecent(
  items: AuditListItem[],
  planUsed: RecentAuditPlanUsed | null,
): MockRecentAudit[] {
  return items.slice(0, 5).map((item) => {
    const status =
      item.status === "COMPLETED"
        ? ("completed" as const)
        : item.status === "FAILED"
          ? ("failed" as const)
          : ("processing" as const);
    return {
      auditId: item.id,
      websiteName: item.title,
      thumbnailUrl: null,
      score: item.overallScore,
      auditDate: item.createdAt,
      status,
      planUsed,
    };
  });
}

/**
 * SCREEN-008 client shell — dashboard from app state (mock or real account).
 * Recent audits from Supabase when on the real OAuth path.
 */
export function DashboardClient() {
  const { user, isReady } = useRequireAuth({ redirectTo: "/dashboard" });
  const { appState, isLoading: accountLoading } = useAppState();
  const useRealApi = useRealAuditApi();
  const [data, setData] = React.useState<MockDashboardBundle | null>(null);

  React.useEffect(() => {
    if (!isReady || !user || accountLoading) {
      setData(null);
      return;
    }

    const base = buildMockDashboardBundle(appState);
    if (!useRealApi) {
      setData(base);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const items = await fetchAuditHistory({ limit: 5 });
        if (cancelled) return;
        const planUsed: RecentAuditPlanUsed | null =
          base.tier === "business"
            ? "business"
            : base.tier === "pro"
              ? "pro"
              : "free";
        const recentAudits = mapRecent(items, planUsed);
        setData({
          ...base,
          recentAudits,
          recentAuditsEmpty: recentAudits.length === 0,
        });
      } catch {
        if (!cancelled) {
          setData({
            ...base,
            recentAudits: [],
            recentAuditsEmpty: true,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accountLoading, appState, isReady, useRealApi, user]);

  if (!isReady || !user || !data) {
    return <AuthSessionFallback message="Loading dashboard…" />;
  }

  return <DashboardScreen data={data} />;
}
