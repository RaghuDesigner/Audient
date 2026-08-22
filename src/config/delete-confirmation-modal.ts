/**
 * COMPONENT-026 — Delete Confirmation Modal constants.
 * Default audit-delete copy — override via props for other destructive confirms.
 */

export const DELETE_CONFIRMATION_STATES = [
  "default",
  "deleting",
  "success",
  "error",
] as const;

export type DeleteConfirmationState =
  (typeof DELETE_CONFIRMATION_STATES)[number];

/** Default audit delete copy (COMPONENT_DELETE_CONFIRMATION_MODAL §2). */
export const DELETE_CONFIRMATION_DEFAULTS = {
  title: "Delete Audit?",
  description: "This action cannot be undone.",
  cancelLabel: "Cancel",
  confirmLabel: "Delete Audit",
  deletingLabel: "Deleting…",
  errorMessage: "Couldn’t delete audit. Try again.",
} as const;

/** Optional context line when a website/label is provided. */
export function deleteConfirmationContextLabel(
  auditLabel: string | null | undefined,
): string | null {
  if (!auditLabel) return null;
  const trimmed = auditLabel.trim();
  if (!trimmed) return null;
  return `You’re deleting “${trimmed}”.`;
}
