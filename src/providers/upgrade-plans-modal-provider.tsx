"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { PlanComparisonModal } from "@/components/billing/PlanComparisonModal";
import { AUTH_ROUTES } from "@/config/auth";
import {
  mapFocusTierToHighlight,
  type PlanComparisonCurrentPlan,
} from "@/config/plan-comparison";
import type { PlanTier } from "@/config/plans";
import { useAuth } from "@/hooks/use-auth";
import { useUpgradeModalCurrentPlan } from "@/hooks/use-mock-membership-state";
import { buildSignInUrl } from "@/utils/auth-redirect";
import { buildCheckoutHref } from "@/utils/checkout";

type OpenUpgradeOptions = {
  reason?: string;
  source?: string;
  /** Emphasize Pro or Business in the plan comparison modal. */
  focusTier?: PlanTier;
  currentPlan?: PlanComparisonCurrentPlan;
};

type UpgradePlansModalControls = {
  open: boolean;
  reason?: string;
  source?: string;
  focusTier?: PlanTier;
  currentPlan: PlanComparisonCurrentPlan;
  openUpgrade: (options?: OpenUpgradeOptions) => void;
  /** Alias — same as openUpgrade (COMPONENT-013 entry). */
  openPlanComparison: (options?: OpenUpgradeOptions) => void;
  closeUpgrade: () => void;
};

const UpgradePlansModalContext =
  React.createContext<UpgradePlansModalControls | null>(null);

export type UpgradePlansModalProviderProps = {
  children: React.ReactNode;
  /**
   * QA-only plan override (e.g. billing `?tier=pro`).
   * Normal navigation uses the authenticated user's plan.
   */
  qaTierOverride?: PlanComparisonCurrentPlan | null;
  /**
   * Optional override. When omitted, Pro/Business selection routes to
   * `/checkout?plan=…` (guests → `/sign-in?next=…`).
   */
  onSelectPlan?: (tier: PlanTier) => void;
};

function planTierToCheckoutPlan(
  tier: PlanTier,
): "pro" | "business" | null {
  if (tier === "PRO") return "pro";
  if (tier === "ENTERPRISE") return "business";
  return null;
}

/**
 * Mounts shared Plan Comparison Modal (COMPONENT-013).
 * Syncs current plan from auth unless `qaTierOverride` is set.
 */
export function UpgradePlansModalProvider({
  children,
  qaTierOverride = null,
  onSelectPlan,
}: UpgradePlansModalProviderProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const authCurrentPlan = useUpgradeModalCurrentPlan(qaTierOverride);
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState<string | undefined>();
  const [source, setSource] = React.useState<string | undefined>();
  const [focusTier, setFocusTier] = React.useState<PlanTier | undefined>();
  const [modalCurrentPlan, setModalCurrentPlan] =
    React.useState<PlanComparisonCurrentPlan>(authCurrentPlan);

  React.useEffect(() => {
    setModalCurrentPlan(authCurrentPlan);
  }, [authCurrentPlan]);

  const openUpgrade = React.useCallback(
    (options: OpenUpgradeOptions = {}) => {
      setReason(options.reason);
      setSource(options.source ?? options.reason);
      setFocusTier(options.focusTier);
      setModalCurrentPlan(options.currentPlan ?? authCurrentPlan);
      setOpen(true);
    },
    [authCurrentPlan],
  );

  const closeUpgrade = React.useCallback(() => {
    setOpen(false);
  }, []);

  const navigateToCheckout = React.useCallback(
    (tier: PlanTier) => {
      const checkoutPlan = planTierToCheckoutPlan(tier);
      if (!checkoutPlan) {
        closeUpgrade();
        return;
      }

      const href = buildCheckoutHref({
        plan: checkoutPlan,
        cycle: "monthly",
      });
      closeUpgrade();

      if (!isAuthenticated) {
        router.push(buildSignInUrl(AUTH_ROUTES.signIn, href));
        return;
      }

      router.push(href);
    },
    [closeUpgrade, isAuthenticated, router],
  );

  const handleSelectPlan = React.useCallback(
    (tier: PlanTier) => {
      if (onSelectPlan) {
        onSelectPlan(tier);
        closeUpgrade();
        return;
      }
      navigateToCheckout(tier);
    },
    [closeUpgrade, navigateToCheckout, onSelectPlan],
  );

  const value = React.useMemo<UpgradePlansModalControls>(
    () => ({
      open,
      reason,
      source,
      focusTier,
      currentPlan: modalCurrentPlan,
      openUpgrade,
      openPlanComparison: openUpgrade,
      closeUpgrade,
    }),
    [
      closeUpgrade,
      focusTier,
      modalCurrentPlan,
      open,
      openUpgrade,
      reason,
      source,
    ],
  );

  return (
    <UpgradePlansModalContext.Provider value={value}>
      {children}
      <PlanComparisonModal
        open={open}
        onOpenChange={setOpen}
        source={source ?? reason ?? "unknown"}
        currentPlan={modalCurrentPlan}
        highlightTier={mapFocusTierToHighlight(focusTier ?? null)}
        onUpgradePlan={(plan) =>
          handleSelectPlan(plan === "business" ? "ENTERPRISE" : "PRO")
        }
        onContinueFree={closeUpgrade}
      />
    </UpgradePlansModalContext.Provider>
  );
}

export function useUpgradePlansModal(): UpgradePlansModalControls {
  const context = React.useContext(UpgradePlansModalContext);
  if (!context) {
    throw new Error(
      "useUpgradePlansModal must be used within UpgradePlansModalProvider",
    );
  }
  return context;
}

/** Optional hook — Locked Card / Header fall back when provider is absent. */
export function useUpgradePlansModalOptional(): UpgradePlansModalControls | null {
  return React.useContext(UpgradePlansModalContext);
}
