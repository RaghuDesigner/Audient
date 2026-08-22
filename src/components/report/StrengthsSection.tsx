"use client";

import { LockedCard } from "@/components/results/LockedCard";
import { StrengthCard } from "@/components/results/StrengthCard";
import { Caption } from "@/components/ui/typography";
import {
  AUDIT_REPORT_LOCKED_COPY,
  AUDIT_REPORT_SECTION_TITLES,
  AUDIT_REPORT_UPGRADE_SOURCES,
  type AuditReportTier,
} from "@/config/audit-report";
import type { MockAuditReportStrength } from "@/data/mock-audit-report";
import { cn } from "@/utils/cn";

export type StrengthsSectionProps = {
  strengths: MockAuditReportStrength[];
  lockedCount?: number;
  tier?: AuditReportTier;
  auditId?: string;
  onUpgrade?: () => void;
  className?: string;
};

/**
 * SCREEN-010 — Strengths list (StrengthCard) + optional locked remainder.
 */
export function StrengthsSection({
  strengths,
  lockedCount = 0,
  tier = "free",
  auditId,
  onUpgrade,
  className,
}: StrengthsSectionProps) {
  const showLocked = lockedCount > 0;

  return (
    <section
      aria-labelledby="audit-report-strengths-heading"
      className={cn("flex w-full flex-col gap-md", className)}
    >
      <h2
        id="audit-report-strengths-heading"
        className="text-body-sm font-bold text-foreground sm:text-body"
      >
        {AUDIT_REPORT_SECTION_TITLES.strengths}
      </h2>

      {strengths.length === 0 && !showLocked ? (
        <Caption className="text-muted-foreground">
          No strengths listed for this audit.
        </Caption>
      ) : (
        <ul className="flex flex-col gap-md">
          {strengths.map((item, index) => (
            <li key={item.strengthId}>
              <StrengthCard
                strengthId={item.strengthId}
                title={item.title}
                description={item.description}
                category={item.category}
                aiConfidence={item.aiConfidence}
                impactLevel={item.impactLevel}
                screenshotUrl={item.screenshotUrl}
                screenshotAlt={item.screenshotAlt}
                state="default"
                defaultExpanded={index === 0}
                variant="report"
                auditId={auditId}
              />
            </li>
          ))}
        </ul>
      )}

      {showLocked ? (
        <LockedCard
          variant="custom"
          message={AUDIT_REPORT_LOCKED_COPY.strengths(lockedCount)}
          lockedCount={lockedCount}
          reason={AUDIT_REPORT_UPGRADE_SOURCES.lockedStrengths}
          tier={tier}
          auditId={auditId}
          density="compact"
          onUpgrade={onUpgrade}
        />
      ) : null}
    </section>
  );
}
