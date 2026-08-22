/**
 * BACKEND-012A — production boot-time fail-closed.
 * Runs on server startup (next dev / next start / serverless cold start).
 * Local development (NODE_ENV !== production) is unaffected.
 */

export async function register(): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const { assertProductionSafeOrThrow } = await import("@/lib/config/runtime");
  assertProductionSafeOrThrow();
}
