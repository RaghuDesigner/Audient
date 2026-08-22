"use client";

import * as React from "react";
import {
  BookOpen,
  CreditCard,
  FileText,
  Rocket,
  ScanSearch,
  Shield,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent, CardSubtitle, CardTitle } from "@/components/ui/card";
import { BodySmall } from "@/components/ui/typography";
import {
  formatSupportCategoryItemCount,
  supportCategoryAccessibleName,
} from "@/config/support-category-card";
import type { HelpSupportCategory } from "@/config/help-support-screen";
import { cn } from "@/utils/cn";

const CATEGORY_ICONS: Record<HelpSupportCategory, LucideIcon> = {
  getting_started: Rocket,
  audits: ScanSearch,
  reports: FileText,
  membership: BookOpen,
  billing_payments: CreditCard,
  team_business: Users,
  account_security: Shield,
};

export type SupportCategoryCardProps = {
  category: HelpSupportCategory;
  label: string;
  description: string;
  articleCount: number;
  selected?: boolean;
  disabled?: boolean;
  onSelect: (category: HelpSupportCategory) => void;
  icon?: React.ReactNode;
  className?: string;
};

/**
 * COMPONENT-063 — Support Category Card.
 * Help category navigation tile — mock counts only; no backend.
 */
export function SupportCategoryCard({
  category,
  label,
  description,
  articleCount,
  selected = false,
  disabled = false,
  onSelect,
  icon,
  className,
}: SupportCategoryCardProps) {
  const Icon = CATEGORY_ICONS[category];
  const countLabel = formatSupportCategoryItemCount(articleCount);
  const accessibleName = supportCategoryAccessibleName(label, articleCount);

  return (
    <Card
      variant={selected ? "elevated" : "default"}
      padding="md"
      clickable={!disabled}
      interactive
      aria-pressed={selected}
      aria-label={accessibleName}
      aria-disabled={disabled || undefined}
      className={cn(
        "min-h-11 w-full text-left",
        selected && "ring-2 ring-ring ring-offset-2 ring-offset-background",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
      onClick={() => {
        if (disabled) return;
        onSelect(category);
      }}
    >
      <CardContent className="gap-sm">
        <div className="flex items-start gap-sm">
          <span
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-foreground"
            aria-hidden
          >
            {icon ?? <Icon className="size-4" aria-hidden />}
          </span>
          <div className="min-w-0 flex-1 space-y-xs">
            <CardTitle as="h3" className="text-body-sm">
              {label}
            </CardTitle>
            <CardSubtitle className="line-clamp-2">{description}</CardSubtitle>
          </div>
        </div>
        <BodySmall className="text-muted-foreground">{countLabel}</BodySmall>
      </CardContent>
    </Card>
  );
}
