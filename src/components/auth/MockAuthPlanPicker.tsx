"use client";

import * as React from "react";

import { Caption } from "@/components/ui/typography";
import { USE_MOCK_AUTH } from "@/config/auth";
import type { AuthPlanTier } from "@/types/auth";
import { cn } from "@/utils/cn";

export const MOCK_AUTH_PLAN_OPTIONS = [
  { tier: "FREE" as const, label: "Free" },
  { tier: "PRO" as const, label: "Pro" },
  { tier: "ENTERPRISE" as const, label: "Business" },
] as const;

export type MockAuthPlanPickerProps = {
  value: AuthPlanTier;
  onChange: (tier: AuthPlanTier) => void;
  disabled?: boolean;
  className?: string;
};

/**
 * Dev/mock-only plan picker for SSO demos.
 * Hidden when `USE_MOCK_AUTH` is false — not shown in real OAuth.
 */
export function MockAuthPlanPicker({
  value,
  onChange,
  disabled = false,
  className,
}: MockAuthPlanPickerProps) {
  if (!USE_MOCK_AUTH) return null;

  return (
    <div className={cn("flex flex-col gap-sm", className)}>
      <Caption className="text-muted-foreground" id="mock-auth-plan-label">
        Mock plan (dev)
      </Caption>
      <div
        role="radiogroup"
        aria-labelledby="mock-auth-plan-label"
        className="grid grid-cols-3 gap-sm"
      >
        {MOCK_AUTH_PLAN_OPTIONS.map((option) => {
          const selected = value === option.tier;
          return (
            <button
              key={option.tier}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              className={cn(
                "min-h-11 rounded-md border px-sm py-sm text-info font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted",
                disabled && "opacity-50",
              )}
              onClick={() => onChange(option.tier)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
