/**
 * Delete Confirmation Modal analytics — COMPONENT-026.
 * Dev stub — no PII beyond audit id.
 */

type Props = Record<string, string | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const deleteConfirmationAnalytics = {
  /** Modal opened — user intent to delete. */
  started: (props: { auditId: string }) =>
    track("delete_started", props),

  /** Cancel, Esc, or backdrop dismiss. */
  cancelled: (props: { auditId: string }) =>
    track("delete_cancelled", props),

  /** User activated destructive confirm (request started). */
  confirmed: (props: { auditId: string }) =>
    track("delete_confirmed", props),

  /** Optional — parent after mock/API success. */
  succeeded: (props: { auditId: string }) =>
    track("delete_succeeded", props),

  /** Optional — parent after mock/API failure. */
  failed: (props: { auditId: string; reason?: string }) =>
    track("delete_failed", props),
};
