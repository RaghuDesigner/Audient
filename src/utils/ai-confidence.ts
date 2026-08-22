/** Map BACKEND-011 AI confidence enum to UI confidence input. */
export function confidenceLevelToUi(
  level: string | null | undefined,
): "high" | "medium" | "low" | null {
  if (!level) return null;
  const key = level.toUpperCase();
  if (key === "HIGH") return "high";
  if (key === "LOW") return "low";
  if (key === "MEDIUM") return "medium";
  return null;
}
