"use client";

import { AuditSummary } from "@/components/report/AuditSummary";
import { RecommendationCard } from "@/components/report/RecommendationCard";
import { StrengthsSection } from "@/components/report/StrengthsSection";
import { CategoryScoreCard } from "@/components/results/CategoryScoreCard";
import { FindingCard } from "@/components/results/FindingCard";
import { LockedCard } from "@/components/results/LockedCard";
import { OverallScoreCard } from "@/components/results/OverallScoreCard";
import { UpgradeBanner } from "@/components/results/UpgradeBanner";
import {
  AUDIT_REPORT_ACTION_LABELS,
  AUDIT_REPORT_LOCKED_COPY,
  AUDIT_REPORT_SECTION_TITLES,
  AUDIT_REPORT_UPGRADE_SOURCES,
  type AuditReportTier,
} from "@/config/audit-report";
import type {
  MockAuditReportFull,
  MockAuditReportPreview,
} from "@/data/mock-audit-report";
import { MOCK_AUDIT_SUMMARY_COMPLETED } from "@/data/mock-audit-summary";
import { shouldShowAuditReportUpgradeBanner } from "@/utils/audit-report";

export type AuditReportContentProps = {
  data: MockAuditReportFull | MockAuditReportPreview;
  tier: AuditReportTier;
  locked: { findings: number; recommendations: number; strengths: number };
  onBack: () => void;
  onExportPdf: () => void;
  onShare: () => void;
  onCompare: () => void;
  onContinueCompare?: (peerAuditId: string) => void;
  onUpgrade: (source: string) => void;
};

/**
 * Completed report sections — SCREEN-010 body (keeps screen shell slim).
 */
export function AuditReportContent({
  data,
  tier,
  locked,
  onBack,
  onExportPdf,
  onShare,
  onCompare,
  onContinueCompare,
  onUpgrade,
}: AuditReportContentProps) {
  const summaryExtras =
    data.auditId === MOCK_AUDIT_SUMMARY_COMPLETED.auditId
      ? MOCK_AUDIT_SUMMARY_COMPLETED
      : null;

  return (
    <>
      <AuditSummary
        state="completed"
        auditId={data.auditId}
        websiteName={data.summary.websiteName}
        websiteUrl={data.summary.websiteUrl}
        thumbnailUrl={summaryExtras?.thumbnailUrl ?? null}
        thumbnailAlt={summaryExtras?.thumbnailAlt ?? null}
        auditedAt={data.summary.auditDate}
        durationSeconds={summaryExtras?.durationSeconds ?? null}
        auditType={
          data.summary.auditType === "screenshot" ? "screenshot" : "url"
        }
        membershipUsed={data.summary.planUsed}
        aiEngineVersion={summaryExtras?.aiEngineVersion ?? null}
        status="completed"
        tier={tier}
        pdfAvailable={tier === "pro" || tier === "business"}
        backLabel={
          tier === "guest"
            ? AUDIT_REPORT_ACTION_LABELS.backToDashboard
            : AUDIT_REPORT_ACTION_LABELS.backToHistory
        }
        onBack={onBack}
        onExportPdf={onExportPdf}
        onShare={onShare}
        onCompare={onCompare}
        onContinueCompare={onContinueCompare}
        onUpgrade={onUpgrade}
      />

      <section aria-labelledby="audit-report-overall-heading">
        <h2 id="audit-report-overall-heading" className={sectionHeading}>
          {AUDIT_REPORT_SECTION_TITLES.overall}
        </h2>
        <OverallScoreCard
          state="success"
          score={data.overall.score}
          summary={data.overall.summary}
          lastUpdated={data.overall.lastUpdated}
          auditType={data.overall.auditType}
          tier={tier}
          auditId={data.auditId}
        />
      </section>

      <section aria-labelledby="audit-report-categories-heading">
        <h2 id="audit-report-categories-heading" className={sectionHeading}>
          {AUDIT_REPORT_SECTION_TITLES.categories}
        </h2>
        <ul className="grid gap-md sm:grid-cols-2 xl:grid-cols-3">
          {data.categories.map((item) => (
            <li key={item.category}>
              <CategoryScoreCard
                category={item.category}
                score={item.score}
                trend={item.trend}
                trendDelta={item.trendDelta}
                tier={tier}
                auditId={data.auditId}
              />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="audit-report-findings-heading">
        <h2 id="audit-report-findings-heading" className={sectionHeading}>
          {AUDIT_REPORT_SECTION_TITLES.findings}
        </h2>
        <ul className="flex flex-col gap-md">
          {data.findings.map((finding) => (
            <li key={finding.findingId}>
              <FindingCard {...finding} tier={tier} auditId={data.auditId} />
            </li>
          ))}
        </ul>
        {locked.findings > 0 ? (
          <div className="mt-md">
            <LockedCard
              variant="findings"
              message={AUDIT_REPORT_LOCKED_COPY.findings(locked.findings)}
              lockedCount={locked.findings}
              reason={AUDIT_REPORT_UPGRADE_SOURCES.lockedFindings}
              tier={tier}
              auditId={data.auditId}
              onUpgrade={() =>
                onUpgrade(AUDIT_REPORT_UPGRADE_SOURCES.lockedFindings)
              }
            />
          </div>
        ) : null}
      </section>

      <StrengthsSection
        strengths={data.strengths}
        lockedCount={locked.strengths}
        tier={tier}
        auditId={data.auditId}
        onUpgrade={() =>
          onUpgrade(AUDIT_REPORT_UPGRADE_SOURCES.lockedStrengths)
        }
      />

      <section aria-labelledby="audit-report-recommendations-heading">
        <h2
          id="audit-report-recommendations-heading"
          className={sectionHeading}
        >
          {AUDIT_REPORT_SECTION_TITLES.recommendations}
        </h2>
        <ul className="flex flex-col gap-md">
          {data.recommendations.map((rec, index) => (
            <li key={rec.recommendationId}>
              <RecommendationCard
                recommendationId={rec.recommendationId}
                title={rec.title}
                description={rec.description}
                category={rec.category}
                severity={rec.severity}
                priority={rec.priority}
                estimatedImpact={rec.estimatedImpact}
                effort={rec.effort}
                aiConfidence={rec.aiConfidence}
                findingId={rec.findingId}
                learnMoreHref={rec.learnMoreHref}
                showBeforeAfterPlaceholder={rec.showBeforeAfterPlaceholder}
                state="default"
                defaultExpanded={index === 0}
                tier={tier}
                auditId={data.auditId}
                collaborationPlaceholder={tier === "business"}
                onUpgrade={onUpgrade}
              />
            </li>
          ))}
        </ul>
        {locked.recommendations > 0 ? (
          <div className="mt-md">
            <LockedCard
              variant="custom"
              message={AUDIT_REPORT_LOCKED_COPY.recommendations(
                locked.recommendations,
              )}
              lockedCount={locked.recommendations}
              reason={AUDIT_REPORT_UPGRADE_SOURCES.lockedRecommendations}
              tier={tier}
              auditId={data.auditId}
              onUpgrade={() =>
                onUpgrade(AUDIT_REPORT_UPGRADE_SOURCES.lockedRecommendations)
              }
            />
          </div>
        ) : null}
      </section>

      {shouldShowAuditReportUpgradeBanner(tier) ? (
        <UpgradeBanner
          variant={tier === "guest" ? "guest" : "free"}
          source={AUDIT_REPORT_UPGRADE_SOURCES.banner}
          auditId={data.auditId}
          onUpgrade={() => onUpgrade(AUDIT_REPORT_UPGRADE_SOURCES.banner)}
        />
      ) : null}
    </>
  );
}

const sectionHeading =
  "mb-md text-body-sm font-bold text-foreground sm:text-body";
