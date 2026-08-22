"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { EmptyState } from "@/components/common/EmptyState";
import { AITipsCard } from "@/components/dashboard/AITipsCard";
import { CreditsWidget } from "@/components/dashboard/CreditsWidget";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MembershipWidget } from "@/components/dashboard/MembershipWidget";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { RecentAuditCard } from "@/components/dashboard/RecentAuditCard";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { Footer } from "@/components/layout/footer";
import { SkipLink } from "@/components/layout/skip-link";
import { MANAGE_MEMBERSHIP_ROUTE } from "@/config/manage-membership";
import type { QuickActionKey } from "@/config/quick-action";
import {
  MOCK_DASHBOARD,
  type MockDashboardBundle,
} from "@/data/mock-dashboard";
import { useAuth } from "@/hooks/use-auth";
import { dashboardAnalytics } from "@/lib/analytics/dashboard-events";
import { useUpgradePlansModalOptional } from "@/providers/upgrade-plans-modal-provider";
import {
  auditProcessingRoute,
  auditReportRoute,
} from "@/utils/audit-processing-route";
import type { RecentAuditStatus } from "@/utils/recent-audit";
import { cn } from "@/utils/cn";

export type DashboardScreenProps = {
  /** Phase-1 mock bundle; swap for API hydrate later. */
  data?: MockDashboardBundle;
};

/**
 * SCREEN-008 — Authenticated Dashboard.
 * Assembles existing widgets only — no redesign / no backend.
 */
export function DashboardScreen({
  data = MOCK_DASHBOARD,
}: DashboardScreenProps) {
  const router = useRouter();
  const { user } = useAuth();
  const upgradeModal = useUpgradePlansModalOptional();
  const viewed = React.useRef(false);

  React.useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    dashboardAnalytics.viewed({ tier: data.tier });
  }, [data.tier]);

  const openUpgrade = React.useCallback(
    (via: string) => {
      dashboardAnalytics.upgradeClicked({ tier: data.tier, via });
      upgradeModal?.openPlanComparison({
        source: via,
        reason: via,
        currentPlan: data.tier,
        focusTier: "PRO",
      });
    },
    [data.tier, upgradeModal],
  );

  const handleQuickAction = (action: QuickActionKey) => {
    switch (action) {
      case "start_audit":
        dashboardAnalytics.startAudit({ tier: data.tier, mode: "chooser" });
        router.push("/");
        break;
      case "upload_screenshot":
        dashboardAnalytics.uploadImage({ tier: data.tier });
        router.push("/");
        break;
      case "paste_url":
        dashboardAnalytics.analyzeUrl({ tier: data.tier });
        if (data.tier === "free") {
          openUpgrade("dashboard_url_gate");
          return;
        }
        router.push("/");
        break;
      case "history":
        dashboardAnalytics.historyOpened({
          tier: data.tier,
          via: "dashboard_quick_action",
        });
        router.push("/history");
        break;
      default:
        break;
    }
  };

  const handleRecentOpen = (
    auditId: string,
    status: Exclude<RecentAuditStatus, "loading">,
  ) => {
    switch (status) {
      case "completed":
        router.push(auditReportRoute(auditId));
        break;
      case "failed":
        router.push(auditProcessingRoute(auditId, { fail: "1" }));
        break;
      case "processing":
      default:
        router.push(auditProcessingRoute(auditId));
        break;
    }
  };

  const showEmptyAudits =
    data.recentAuditsEmpty || data.recentAudits.length === 0;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SkipLink />
      <DashboardHeader
        credits={data.headerCredits}
        displayName={user?.fullName ?? data.welcome.displayName}
        tier={data.tier}
        onCreditsClick={() => openUpgrade("header_credits")}
        profileNavigation={{
          onAction: (action) => {
            if (action === "history") {
              dashboardAnalytics.historyOpened({
                tier: data.tier,
                via: "profile_menu",
              });
            }
          },
        }}
      />

      <main
        id="main-content"
        className={cn(
          "mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-lg",
          "px-md py-lg lg:px-lg",
        )}
      >
        <WelcomeCard
          {...data.welcome}
          onCreditsClick={() => openUpgrade("welcome_credits")}
          onBadgeClick={() => openUpgrade("welcome_badge")}
        />

        <section aria-labelledby="dashboard-quick-actions-heading">
          <h2
            id="dashboard-quick-actions-heading"
            className="mb-md text-body-sm font-bold text-foreground sm:text-body"
          >
            Quick actions
          </h2>
          <ul className="grid gap-md sm:grid-cols-2 xl:grid-cols-4">
            {data.quickActions.map((action) => (
              <li key={action.action}>
                <QuickActionCard
                  {...action}
                  tier={data.tier}
                  onAction={handleQuickAction}
                />
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-label="Account usage"
          className="grid gap-lg lg:grid-cols-2"
        >
          <CreditsWidget
            {...data.credits}
            onUpgrade={() => openUpgrade("credits_widget")}
            onViewDetails={() => openUpgrade("credits_details")}
          />
          <MembershipWidget
            {...data.membership}
            onUpgrade={() => openUpgrade("membership_widget")}
            onManagePlan={() => router.push(MANAGE_MEMBERSHIP_ROUTE)}
          />
        </section>

        <section aria-labelledby="dashboard-recent-heading">
          <h2
            id="dashboard-recent-heading"
            className="mb-md text-body-sm font-bold text-foreground sm:text-body"
          >
            Recent audits
          </h2>
          {showEmptyAudits ? (
            <EmptyState
              variant="no_audits"
              tier={data.tier}
              onPrimary={() => handleQuickAction("start_audit")}
              onSecondary={() => openUpgrade("empty_audits_plans")}
            />
          ) : (
            <ul className="flex flex-col gap-md">
              {data.recentAudits.map((audit) => (
                <li key={audit.auditId}>
                  <RecentAuditCard {...audit} onOpen={handleRecentOpen} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <AITipsCard state="success" tips={data.tips} />
      </main>

      <Footer variant="minimal" />
    </div>
  );
}
