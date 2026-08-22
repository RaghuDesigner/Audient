/**
 * Detect frontend-only mock auth users (ids like `mock-google-user`).
 */

export function isMockAuthUserId(userId: string | null | undefined): boolean {
  if (!userId) return false;
  return userId.startsWith("mock-");
}
