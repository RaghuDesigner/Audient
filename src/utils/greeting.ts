/**
 * Time-based welcome greeting — COMPONENT-014 §3.
 * Uses browser local timezone (not UTC).
 */

export type GreetingPeriod = "morning" | "afternoon" | "evening";

export function greetingPeriodFromDate(date: Date = new Date()): GreetingPeriod {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  return "evening";
}

export function greetingLabel(period: GreetingPeriod): string {
  switch (period) {
    case "morning":
      return "Good Morning";
    case "afternoon":
      return "Good Afternoon";
    case "evening":
      return "Good Evening";
  }
}

/**
 * e.g. "Good Morning, Alex" or "Good Morning" when name is missing.
 */
export function buildWelcomeGreeting(
  displayName: string | null | undefined,
  date: Date = new Date(),
): string {
  const label = greetingLabel(greetingPeriodFromDate(date));
  const name = displayName?.trim();
  if (!name) return label;
  return `${label}, ${name}`;
}

/** Initials for avatar fallback — first letters of up to two words. */
export function initialsFromName(
  displayName: string | null | undefined,
): string {
  const name = displayName?.trim();
  if (!name) return "?";
  const parts = name.split(/\s+/).filter(Boolean);
  const first = parts[0];
  if (!first) return "?";
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  const second = parts[1] ?? "";
  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
}
