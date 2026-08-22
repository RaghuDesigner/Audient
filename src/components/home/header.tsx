"use client";

import { CreditsBadge } from "@/components/home/credits-badge";
import { Logo } from "@/components/home/logo";
import { Button } from "@/components/ui/button";
import { GuestProfileDropdown } from "@/components/profile/GuestProfileDropdown";
import { useUpgradePlansModalOptional } from "@/providers/upgrade-plans-modal-provider";
import { cn } from "@/utils/cn";

export type HeaderProps = {
  className?: string;
};

/**
 * SCREEN-001 header — Logo · Pricing · Credits · Guest Profile Dropdown.
 * Pricing opens COMPONENT-013 Plan Comparison Modal via provider.
 */
export function Header({ className }: HeaderProps) {
  const upgradeModal = useUpgradePlansModalOptional();

  return (
    <header
      className={cn(
        "sticky top-0 z-sticky border-b border-border bg-background shadow-sm",
        "pt-safe",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-[1400px] items-center justify-between",
          "min-h-14 gap-md px-md py-sm lg:px-lg",
        )}
      >
        <Logo />
        <div className="flex items-center gap-sm sm:gap-md">
          {upgradeModal ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                upgradeModal.openPlanComparison({
                  source: "header_pricing",
                  reason: "header_pricing",
                  currentPlan: "guest",
                })
              }
            >
              Pricing
            </Button>
          ) : null}
          <CreditsBadge value={100} />
          <GuestProfileDropdown />
        </div>
      </div>
    </header>
  );
}
