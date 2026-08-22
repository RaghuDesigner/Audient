"use client";

import * as React from "react";
import { GitCompareArrows, Lock } from "lucide-react";

import { CompareReportSelector } from "@/components/common/CompareReportSelector";
import { Button } from "@/components/ui/button";
import {
  COMPARE_REPORT_BUTTON_OPEN_DELAY_MS,
  COMPARE_REPORT_BUTTON_UPGRADE_SOURCE,
  type CompareReportButtonState,
  type CompareReportButtonSurface,
  type CompareReportButtonTier,
  type CompareReportButtonVariant,
} from "@/config/compare-report-button";
import { compareReportButtonAnalytics } from "@/lib/analytics/compare-report-button-events";
import type { MockComparePeerAudit } from "@/data/mock-compare-report-button";
import {
  compareReportButtonAccessibleName,
  compareReportButtonLabel,
  compareReportButtonTooltip,
  isCompareReportButtonInteractive,
  resolveCompareReportButtonState,
  resolveCompareReportClickIntent,
  shouldRenderCompareReportButton,
} from "@/utils/compare-report-button";
import { cn } from "@/utils/cn";

export type CompareReportButtonProps = {
  auditId: string;
  tier: CompareReportButtonTier;
  state?: CompareReportButtonState;
  compareReady?: boolean;
  label?: string;
  tooltip?: string;
  variant?: CompareReportButtonVariant;
  surface?: CompareReportButtonSurface;
  peers?: MockComparePeerAudit[];
  onCompare?: () => void;
  onUpgrade?: (source: string) => void;
  onContinueCompare?: (peerAuditId: string) => void;
  className?: string;
};

/**
 * COMPONENT-032 — Compare Report Button.
 * Business → selector placeholder; Free/Pro locked → Upgrade. Guest hidden.
 */
export function CompareReportButton({
  auditId,
  tier,
  state: stateProp,
  compareReady = true,
  label,
  tooltip,
  variant = "button",
  surface = "report",
  peers,
  onCompare,
  onUpgrade,
  onContinueCompare,
  className,
}: CompareReportButtonProps) {
  const [internalLoading, setInternalLoading] = React.useState(false);
  const [selectorOpen, setSelectorOpen] = React.useState(false);
  const isControlled = stateProp !== undefined;

  const resolved = resolveCompareReportButtonState({
    tier,
    compareReady,
    state: isControlled
      ? stateProp
      : internalLoading
        ? "loading"
        : undefined,
  });

  if (!shouldRenderCompareReportButton(tier)) return null;

  const displayLabel = compareReportButtonLabel({ state: resolved, label });
  const accessibleName = compareReportButtonAccessibleName({
    state: resolved,
    label,
    variant,
  });
  const tip = compareReportButtonTooltip({ state: resolved, tooltip });
  const interactive = isCompareReportButtonInteractive(resolved);
  const isMenu = variant === "menuItem";
  const locked = resolved === "locked";

  const openSelector = async () => {
    setInternalLoading(true);
    compareReportButtonAnalytics.clicked({
      auditId,
      tier,
      surface,
      gated: false,
    });
    onCompare?.();
    await new Promise<void>((r) => {
      window.setTimeout(r, COMPARE_REPORT_BUTTON_OPEN_DELAY_MS);
    });
    setInternalLoading(false);
    setSelectorOpen(true);
    compareReportButtonAnalytics.started({ auditId, tier, surface });
  };

  const handleClick = () => {
    const intent = resolveCompareReportClickIntent(resolved);
    if (intent === "upgrade") {
      compareReportButtonAnalytics.clicked({
        auditId,
        tier,
        surface,
        gated: true,
      });
      compareReportButtonAnalytics.upgradeClicked({
        auditId,
        source: COMPARE_REPORT_BUTTON_UPGRADE_SOURCE,
        tier,
        surface,
      });
      onUpgrade?.(COMPARE_REPORT_BUTTON_UPGRADE_SOURCE);
      return;
    }
    if (intent === "compare") {
      void openSelector();
    }
  };

  return (
    <>
      <Button
        type="button"
        variant={locked || isMenu ? "outline" : "outline"}
        size="sm"
        className={cn(isMenu && "w-full justify-start", className)}
        title={tip}
        aria-label={accessibleName}
        aria-busy={resolved === "loading"}
        disabled={!interactive}
        isLoading={resolved === "loading"}
        onClick={handleClick}
        iconLeft={
          resolved === "loading" ? undefined : locked ? (
            <Lock className="size-4" aria-hidden />
          ) : (
            <GitCompareArrows className="size-4" aria-hidden />
          )
        }
      >
        {displayLabel}
      </Button>

      <CompareReportSelector
        open={selectorOpen}
        auditId={auditId}
        tier={tier}
        peers={peers}
        onClose={() => setSelectorOpen(false)}
        onContinue={onContinueCompare}
      />
    </>
  );
}
