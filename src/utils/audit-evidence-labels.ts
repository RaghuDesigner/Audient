/** Human-readable labels for BACKEND-011 evidence metadata in report UI. */

export function evidenceTypeLabel(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  switch (value.toUpperCase()) {
    case "OBSERVED":
      return "Directly observed";
    case "INFERRED":
      return "Inferred from evidence";
    case "UNVERIFIED":
      return "Requires verification";
    default:
      return null;
  }
}

export function confidenceLabel(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  switch (value.toUpperCase()) {
    case "HIGH":
      return "High confidence";
    case "MEDIUM":
      return "Medium confidence";
    case "LOW":
      return "Low confidence";
    default:
      return null;
  }
}
