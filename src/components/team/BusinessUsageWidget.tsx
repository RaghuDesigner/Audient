"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  BUSINESS_USAGE_DEFAULT_CREDIT_GRANT,
  BUSINESS_USAGE_DEFAULT_MONTHLY_AUDIT_SOFT_CAP,
  BUSINESS_USAGE_DEFAULT_STORAGE_QUOTA_GB,
  BUSINESS_USAGE_WIDGET_COPY,
  type BusinessUsageWidgetState,
} from "@/config/business-usage-widget";
import { businessUsageWidgetAnalytics } from "@/lib/analytics/business-usage-widget-events";
import {
  businessUsageChartMax,
  businessUsageProgressPercent,
  formatBusinessUsageNumber,
  formatBusinessUsageStorage,
  type BusinessUsageChartPoint,
} from "@/utils/business-usage-widget";
import { cn } from "@/utils/cn";

export type BusinessUsageWidgetProps = {
  totalAudits: number;
  monthlyAudits: number;
  creditsUsed: number;
  creditsRemaining: number;
  creditsGrant?: number;
  storageUsedGb: number;
  storageQuotaGb?: number;
  activeMembers: number;
  chartSeries?: BusinessUsageChartPoint[];
  monthlyAuditSoftCap?: number;
  state?: BusinessUsageWidgetState;
  onRetry?: () => void;
  className?: string;
};

/**
 * COMPONENT-056 — Business Usage Widget.
 * Summary metrics, progress bars, mock chart — no backend metering.
 */
export function BusinessUsageWidget({
  totalAudits,
  monthlyAudits,
  creditsUsed,
  creditsRemaining,
  creditsGrant = BUSINESS_USAGE_DEFAULT_CREDIT_GRANT,
  storageUsedGb,
  storageQuotaGb = BUSINESS_USAGE_DEFAULT_STORAGE_QUOTA_GB,
  activeMembers,
  chartSeries = [],
  monthlyAuditSoftCap = BUSINESS_USAGE_DEFAULT_MONTHLY_AUDIT_SOFT_CAP,
  state = "default",
  onRetry,
  className,
}: BusinessUsageWidgetProps) {
  const viewed = React.useRef(false);
  const loading = state === "loading";
  const isError = state === "error";

  const creditsPct = businessUsageProgressPercent(creditsUsed, creditsGrant);
  const storagePct = businessUsageProgressPercent(
    storageUsedGb,
    storageQuotaGb,
  );
  const auditsPct = businessUsageProgressPercent(
    monthlyAudits,
    monthlyAuditSoftCap,
  );
  const chartMax = businessUsageChartMax(chartSeries);

  React.useEffect(() => {
    if (viewed.current || loading || isError) return;
    viewed.current = true;
    businessUsageWidgetAnalytics.viewed();
  }, [isError, loading]);

  return (
    <section
      className={cn(
        "flex w-full flex-col gap-lg rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg",
        className,
      )}
      aria-busy={loading || undefined}
      aria-labelledby="business-usage-widget-title"
    >
      <div className="flex flex-col gap-sm">
        <h3
          id="business-usage-widget-title"
          className="text-h4 font-semibold text-foreground"
        >
          {BUSINESS_USAGE_WIDGET_COPY.title}
        </h3>
        <BodySmall className="text-muted-foreground">
          {BUSINESS_USAGE_WIDGET_COPY.caption}
        </BodySmall>
      </div>

      {loading ? (
        <>
          <Caption className="sr-only" role="status">
            {BUSINESS_USAGE_WIDGET_COPY.loading}
          </Caption>
          <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-md" />
            ))}
          </div>
          <Skeleton className="h-24 w-full rounded-md" />
          <Skeleton className="h-40 w-full rounded-md" />
        </>
      ) : null}

      {isError ? (
        <div
          className="flex flex-col gap-md rounded-md border border-border p-md"
          role="alert"
        >
          <BodySmall className="text-foreground">
            {BUSINESS_USAGE_WIDGET_COPY.loadError}
          </BodySmall>
          {onRetry ? (
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full sm:w-auto"
              onClick={() => {
                businessUsageWidgetAnalytics.retryClicked();
                onRetry();
              }}
            >
              {BUSINESS_USAGE_WIDGET_COPY.retry}
            </Button>
          ) : null}
        </div>
      ) : null}

      {!loading && !isError ? (
        <>
          <ul className="m-0 grid list-none grid-cols-1 gap-md p-0 sm:grid-cols-2 lg:grid-cols-3">
            <Metric
              label={BUSINESS_USAGE_WIDGET_COPY.totalAudits}
              value={formatBusinessUsageNumber(totalAudits)}
            />
            <Metric
              label={BUSINESS_USAGE_WIDGET_COPY.monthlyAudits}
              value={formatBusinessUsageNumber(monthlyAudits)}
            />
            <Metric
              label={BUSINESS_USAGE_WIDGET_COPY.creditsUsed}
              value={formatBusinessUsageNumber(creditsUsed)}
            />
            <Metric
              label={BUSINESS_USAGE_WIDGET_COPY.creditsRemaining}
              value={formatBusinessUsageNumber(creditsRemaining)}
            />
            <Metric
              label={BUSINESS_USAGE_WIDGET_COPY.storageUsed}
              value={`${formatBusinessUsageStorage(storageUsedGb)} ${BUSINESS_USAGE_WIDGET_COPY.gb}`}
            />
            <Metric
              label={BUSINESS_USAGE_WIDGET_COPY.activeMembers}
              value={formatBusinessUsageNumber(activeMembers)}
            />
          </ul>

          <div className="flex flex-col gap-lg">
            <ProgressBlock
              label={BUSINESS_USAGE_WIDGET_COPY.creditsProgress}
              valueLabel={`${formatBusinessUsageNumber(creditsUsed)} ${BUSINESS_USAGE_WIDGET_COPY.of} ${formatBusinessUsageNumber(creditsGrant)}`}
              percent={creditsPct}
            />
            <ProgressBlock
              label={BUSINESS_USAGE_WIDGET_COPY.storageProgress}
              valueLabel={`${formatBusinessUsageStorage(storageUsedGb)} ${BUSINESS_USAGE_WIDGET_COPY.of} ${formatBusinessUsageStorage(storageQuotaGb)} ${BUSINESS_USAGE_WIDGET_COPY.gb}`}
              percent={storagePct}
            />
            <ProgressBlock
              label={BUSINESS_USAGE_WIDGET_COPY.monthlyAuditsProgress}
              valueLabel={`${formatBusinessUsageNumber(monthlyAudits)} ${BUSINESS_USAGE_WIDGET_COPY.of} ${formatBusinessUsageNumber(monthlyAuditSoftCap)}`}
              percent={auditsPct}
            />
          </div>

          {chartSeries.length > 0 ? (
            <div className="flex flex-col gap-md">
              <Caption className="font-semibold text-foreground">
                {BUSINESS_USAGE_WIDGET_COPY.chartTitle}
              </Caption>
              <MockBarChart series={chartSeries} max={chartMax} />
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex flex-col gap-sm rounded-md border border-border p-md">
      <Caption className="font-semibold text-muted-foreground">{label}</Caption>
      <BodySmall className="text-body font-semibold text-foreground">
        {value}
      </BodySmall>
    </li>
  );
}

function ProgressBlock({
  label,
  valueLabel,
  percent,
}: {
  label: string;
  valueLabel: string;
  percent: number;
}) {
  return (
    <div className="flex flex-col gap-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-sm">
        <Caption className="font-semibold text-foreground">{label}</Caption>
        <Caption className="text-muted-foreground">{valueLabel}</Caption>
      </div>
      <Progress
        value={percent}
        label={`${label}: ${valueLabel}`}
        showValue
      />
    </div>
  );
}

function MockBarChart({
  series,
  max,
}: {
  series: BusinessUsageChartPoint[];
  max: number;
}) {
  return (
    <div className="flex flex-col gap-md rounded-md border border-border p-md">
      <p className="sr-only">{BUSINESS_USAGE_WIDGET_COPY.chartSummary}</p>
      <div
        className="flex h-40 items-end gap-sm"
        role="img"
        aria-label={BUSINESS_USAGE_WIDGET_COPY.chartSummary}
      >
        {series.map((point) => {
          const heightPct = businessUsageProgressPercent(point.value, max);
          return (
            <div
              key={point.label}
              className="flex min-w-0 flex-1 flex-col items-center gap-sm"
            >
              <div className="flex h-32 w-full items-end justify-center">
                <div
                  className="w-full max-w-8 rounded-sm bg-primary"
                  style={
                    {
                      height: `${heightPct}%`,
                    } as React.CSSProperties
                  }
                  aria-hidden
                />
              </div>
              <Caption className="text-muted-foreground">{point.label}</Caption>
              <span className="sr-only">
                {point.label}: {formatBusinessUsageNumber(point.value)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Text alternative for screen reader / mobile clarity */}
      <table className="sr-only">
        <caption>{BUSINESS_USAGE_WIDGET_COPY.chartSummary}</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Audits</th>
          </tr>
        </thead>
        <tbody>
          {series.map((point) => (
            <tr key={point.label}>
              <td>{point.label}</td>
              <td>{formatBusinessUsageNumber(point.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="m-0 grid list-none grid-cols-7 gap-sm p-0 md:hidden">
        {series.map((point) => (
          <li key={point.label} className="flex flex-col items-center gap-sm">
            <Caption className="text-muted-foreground">{point.label}</Caption>
            <BodySmall className="font-semibold text-foreground">
              {formatBusinessUsageNumber(point.value)}
            </BodySmall>
          </li>
        ))}
      </ul>
    </div>
  );
}
