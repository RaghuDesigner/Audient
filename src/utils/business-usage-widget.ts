/**
 * COMPONENT-056 — Business Usage Widget helpers.
 * Progress math + formatting — no React / no API.
 */

export type BusinessUsageChartPoint = {
  label: string;
  value: number;
};

export type BusinessUsageMetrics = {
  totalAudits: number;
  monthlyAudits: number;
  creditsUsed: number;
  creditsRemaining: number;
  creditsGrant: number;
  storageUsedGb: number;
  storageQuotaGb: number;
  activeMembers: number;
  chartSeries: BusinessUsageChartPoint[];
};

export function formatBusinessUsageNumber(value: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(Math.max(0, value));
}

export function formatBusinessUsageStorage(gb: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
  }).format(Math.max(0, gb));
}

/** 0–100 for Progress. */
export function businessUsageProgressPercent(
  used: number,
  total: number,
): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, (used / total) * 100));
}

export function businessUsageChartMax(
  series: BusinessUsageChartPoint[],
): number {
  const max = series.reduce((acc, p) => Math.max(acc, p.value), 0);
  return max > 0 ? max : 1;
}
