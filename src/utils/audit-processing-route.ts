/**
 * Audit processing / report route builders — shared navigation helpers.
 */

export function auditReportRoute(auditId: string): string {
  return `/audit/${auditId}/report`;
}

export function auditProcessingRoute(
  auditId: string,
  options?: { fail?: string },
): string {
  const base = `/audit/${auditId}`;
  if (!options?.fail) return base;
  return `${base}?fail=${encodeURIComponent(options.fail)}`;
}
