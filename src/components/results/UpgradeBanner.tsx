"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  UPGRADE_BANNER_CONTENT,
  upgradeBannerPlanChips,
  type UpgradeBannerVariant,
} from "@/config/upgrade-banner";
import { upgradeBannerAnalytics } from "@/lib/analytics/upgrade-banner-events";
import { useUpgradePlansModalOptional } from "@/providers/upgrade-plans-modal-provider";
import { cn } from "@/utils/cn";

export type UpgradeBannerProps = {
  variant: UpgradeBannerVariant;
  headline?: string;
  description?: string;
  highlights?: string[];
  upgradeLabel?: string;
  compareLabel?: string;
  businessLabel?: string;
  dismissible?: boolean;
  source?: string;
  auditId?: string | null;
  onUpgrade?: () => void;
  onComparePlans?: () => void;
  onBusiness?: () => void;
  onDismiss?: () => void;
  className?: string;
};

/**
 * COMPONENT-012 — Upgrade Banner.
 * Large plan-conversion section for Guest / Free / Pro Renewal / Business.
 */
export function UpgradeBanner({
  variant,
  headline: headlineProp,
  description: descriptionProp,
  highlights: highlightsProp,
  upgradeLabel: upgradeLabelProp,
  compareLabel: compareLabelProp,
  businessLabel: businessLabelProp,
  dismissible = false,
  source = "unknown",
  auditId = null,
  onUpgrade,
  onComparePlans,
  onBusiness,
  onDismiss,
  className,
}: UpgradeBannerProps) {
  const upgradeModal = useUpgradePlansModalOptional();
  const reduceMotion = useReducedMotion();
  const headingId = React.useId();
  const impressed = React.useRef(false);
  const [dismissed, setDismissed] = React.useState(false);

  const defaults = UPGRADE_BANNER_CONTENT[variant];
  const headline = headlineProp ?? defaults.headline;
  const description = descriptionProp ?? defaults.description;
  const highlights = highlightsProp ?? defaults.highlights;
  const upgradeLabel = upgradeLabelProp ?? defaults.upgradeLabel;
  const compareLabel = compareLabelProp ?? defaults.compareLabel;
  const businessLabel = businessLabelProp ?? defaults.businessLabel;
  const planChips = upgradeBannerPlanChips(variant);

  React.useEffect(() => {
    if (dismissed || impressed.current) return;
    impressed.current = true;
    upgradeBannerAnalytics.impressed({
      variant,
      source,
      auditId: auditId ?? undefined,
    });
  }, [dismissed, variant, source, auditId]);

  if (dismissed) return null;

  const openCompare = (reason: string, focusTier?: "PRO" | "ENTERPRISE") => {
    if (upgradeModal) {
      upgradeModal.openPlanComparison({
        reason,
        source: source,
        focusTier,
        currentPlan:
          variant === "business"
            ? "pro"
            : variant === "free"
              ? "free"
              : variant === "guest"
                ? "guest"
                : "pro",
      });
    }
  };

  const handleUpgrade = () => {
    upgradeBannerAnalytics.upgradeClicked({
      variant,
      source,
      auditId: auditId ?? undefined,
      targetTier: defaults.targetTier,
    });
    if (onUpgrade) {
      onUpgrade();
      return;
    }
    if (defaults.targetTier === "business") {
      openCompare("upgrade_banner_business", "ENTERPRISE");
      return;
    }
    if (defaults.targetTier === "renew") {
      openCompare("upgrade_banner_renew", "PRO");
      return;
    }
    openCompare("upgrade_banner", "PRO");
  };

  const handleCompare = () => {
    upgradeBannerAnalytics.comparePlansClicked({ variant, source });
    if (onComparePlans) {
      onComparePlans();
      return;
    }
    openCompare("upgrade_banner_compare");
  };

  const handleBusiness = () => {
    upgradeBannerAnalytics.businessClicked({ variant, source });
    if (onBusiness) {
      onBusiness();
      return;
    }
    openCompare("upgrade_banner_business", "ENTERPRISE");
  };

  const handleDismiss = () => {
    upgradeBannerAnalytics.dismissed({ variant, source });
    setDismissed(true);
    onDismiss?.();
  };

  const showBusinessCta = variant !== "business";

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "relative w-full overflow-hidden rounded-md border border-border",
        "bg-surface p-md shadow-sm sm:p-lg",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10"
        aria-hidden
      />

      {dismissible ? (
        <button
          type="button"
          className={cn(
            "absolute right-md top-md z-raised inline-flex size-11 items-center justify-center",
            "rounded-md text-muted-foreground transition-colors duration-fast",
            "hover:bg-muted hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
          aria-label="Dismiss upgrade offer"
          onClick={handleDismiss}
        >
          <X className="size-5" aria-hidden />
        </button>
      ) : null}

      <div className="relative flex flex-col gap-lg">
        <div className="flex max-w-3xl flex-col gap-sm pr-lg">
          <h2
            id={headingId}
            className="text-body font-bold text-foreground sm:text-body-lg"
          >
            {headline}
          </h2>
          <BodySmall className="text-muted-foreground sm:text-body-sm">
            {description}
          </BodySmall>
        </div>

        <ul
          className="grid gap-sm sm:grid-cols-3"
          aria-label="Plan comparison"
        >
          {planChips.map((chip) => (
            <li
              key={chip.id}
              className={cn(
                "flex flex-col gap-sm rounded-md border border-border bg-background p-md",
                chip.emphasized && "border-secondary ring-2 ring-secondary/25",
              )}
            >
              <Caption className="font-semibold uppercase tracking-wide text-muted-foreground">
                {chip.label}
              </Caption>
              <p className="text-body-sm font-bold text-primary sm:text-body">
                {chip.price}
                <span className="text-info font-regular text-muted-foreground">
                  {" "}
                  / mo
                </span>
              </p>
              <Caption>{chip.meta}</Caption>
            </li>
          ))}
        </ul>

        <ul className="grid gap-sm sm:grid-cols-2" aria-label="Unlocked benefits">
          {highlights.map((item) => (
            <li
              key={item}
              className="flex items-start gap-sm text-info text-foreground sm:text-body-sm"
            >
              <Check
                className="mt-0.5 size-4 shrink-0 text-success"
                aria-hidden
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-sm sm:flex-row sm:flex-wrap sm:items-center">
          <motion.div
            className="w-full sm:w-auto"
            animate={reduceMotion ? undefined : { scale: [1, 1.04, 1] }}
            transition={
              reduceMotion
                ? undefined
                : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
            }
          >
            <Button
              type="button"
              variant="primary"
              size="lg"
              fullWidth
              className="text-primary-foreground sm:w-auto"
              onClick={handleUpgrade}
            >
              {upgradeLabel}
            </Button>
          </motion.div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            fullWidth
            className="sm:w-auto"
            onClick={handleCompare}
          >
            {compareLabel}
          </Button>

          {showBusinessCta ? (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              fullWidth
              className="sm:w-auto"
              onClick={handleBusiness}
            >
              {businessLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
