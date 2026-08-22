"use client";

import * as React from "react";

import { AuthSessionFallback } from "@/components/auth/AuthSessionFallback";
import { AuditHistoryScreen } from "@/components/history/AuditHistoryScreen";
import {
  AUDIT_HISTORY_COPY,
  AUDIT_HISTORY_ROUTE,
  type AuditHistoryScreenState,
  type AuditHistoryType,
} from "@/config/audit-history";
import type { AuditHistoryCardStatus } from "@/config/audit-history-card";
import { getMockAppAuditHistory } from "@/data/mock-app-state";
import type { MockAuditHistoryCard } from "@/data/mock-audit-history-card";
import { useAppState } from "@/hooks/use-app-state";
import { useRealAuditApi } from "@/hooks/use-real-audit-api";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { fetchAuditHistory } from "@/lib/audits/client";
import type { AuditListItem } from "@/types/audit";
import type { RecentAuditPlanUsed } from "@/utils/recent-audit";

export type HistoryClientProps = {
  state?: AuditHistoryScreenState | null;
  empty?: boolean;
};

function mapStatus(status: AuditListItem["status"]): AuditHistoryCardStatus {
  switch (status) {
    case "COMPLETED":
      return "completed";
    case "FAILED":
      return "failed";
    case "PROCESSING":
    case "QUEUED":
      return "processing";
    default:
      return "processing";
  }
}

function mapAuditType(inputType: AuditListItem["inputType"]): AuditHistoryType {
  return inputType === "URL" ? "website" : "screenshot";
}

function mapPlanUsed(
  tier: "free" | "pro" | "business" | "guest",
): RecentAuditPlanUsed | null {
  if (tier === "guest") return null;
  if (tier === "business") return "business";
  if (tier === "pro") return "pro";
  return "free";
}

function toHistoryCards(
  items: AuditListItem[],
  tier: "free" | "pro" | "business",
  pdfEnabled: boolean,
): MockAuditHistoryCard[] {
  const planUsed = mapPlanUsed(tier);
  return items.map((item) => ({
    auditId: item.id,
    websiteName: item.title,
    websiteUrl: item.websiteUrl,
    thumbnailUrl: null,
    auditDate: item.createdAt,
    score: item.overallScore,
    status: mapStatus(item.status),
    planUsed,
    auditType: mapAuditType(item.inputType),
    tier,
    pdfAvailable: pdfEnabled && item.status === "COMPLETED",
  }));
}

/**
 * SCREEN-009 client shell — real history for Supabase users; mock for mock auth.
 */
export function HistoryClient({
  state = null,
  empty = false,
}: HistoryClientProps) {
  const { user, isReady } = useRequireAuth({
    redirectTo: AUDIT_HISTORY_ROUTE,
  });
  const useRealApi = useRealAuditApi();
  const { appState, account } = useAppState();
  const headerTier =
    appState.user.planTier === "business"
      ? "business"
      : appState.user.planTier === "pro"
        ? "pro"
        : "free";

  const [screenState, setScreenState] =
    React.useState<AuditHistoryScreenState>(state ?? "loading");
  const [audits, setAudits] = React.useState<MockAuditHistoryCard[]>([]);

  const load = React.useCallback(async () => {
    if (!user) return;

    if (!useRealApi) {
      const bundle = getMockAppAuditHistory(user, {
        auditState: state ?? undefined,
        auditEmpty: empty || state === "empty",
      });
      setAudits(bundle.audits);
      setScreenState(bundle.state);
      return;
    }

    if (state === "error") {
      setScreenState("error");
      setAudits([]);
      return;
    }

    setScreenState("loading");
    try {
      const items = await fetchAuditHistory({ limit: 50 });
      const cards = toHistoryCards(
        items,
        headerTier,
        account?.limits.pdfEnabled ?? appState.permissions.canExportPdf,
      );
      if (empty || state === "empty" || cards.length === 0) {
        setAudits([]);
        setScreenState("empty");
        return;
      }
      setAudits(cards);
      setScreenState("success");
    } catch {
      setAudits([]);
      setScreenState("error");
    }
  }, [
    account?.limits.pdfEnabled,
    appState.permissions.canExportPdf,
    empty,
    headerTier,
    state,
    useRealApi,
    user,
  ]);

  React.useEffect(() => {
    if (!isReady || !user) return;
    void load();
  }, [isReady, load, user]);

  if (!isReady || !user) {
    return (
      <AuthSessionFallback message={AUDIT_HISTORY_COPY.guestRedirect} />
    );
  }

  return (
    <AuditHistoryScreen
      key={`${user.id}-${screenState}-${audits.length}`}
      audits={audits}
      screenState={screenState}
      onRetry={() => {
        void load();
      }}
    />
  );
}
