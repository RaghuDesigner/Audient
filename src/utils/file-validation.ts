/**
 * Client-side image validation for Guest Home upload.
 * Messages come from `upload-errors.ts` — do not hardcode copy here.
 */

import {
  getUploadFailureCopy,
  type ImageFailureReason,
} from "@/utils/upload-errors";

export const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export const ACCEPTED_IMAGE_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
] as const;

/** Maximum upload size — 10 MB. */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const FILE_ACCEPT_ATTR =
  "image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp";

export type ImageValidationResult =
  | { ok: true }
  | { ok: false; reason: ImageFailureReason };

function extensionOf(name: string): string {
  const index = name.lastIndexOf(".");
  if (index < 0) return "";
  return name.slice(index).toLowerCase();
}

export function isAcceptedImageFile(file: File): boolean {
  const mimeOk = (ACCEPTED_IMAGE_MIME_TYPES as readonly string[]).includes(
    file.type,
  );
  const extOk = (ACCEPTED_IMAGE_EXTENSIONS as readonly string[]).includes(
    extensionOf(file.name),
  );
  return mimeOk || extOk;
}

/** Sync checks: type + size only. */
export function validateImageFile(
  file: File | null | undefined,
): ImageValidationResult {
  if (!file || file.size <= 0) {
    return { ok: false, reason: "corrupted" };
  }
  if (!isAcceptedImageFile(file)) {
    return { ok: false, reason: "unsupported_type" };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, reason: "too_large" };
  }
  return { ok: true };
}

export function getImageFailureMessage(reason: ImageFailureReason): string {
  const copy = getUploadFailureCopy(reason);
  return formatMessage(copy.primary, copy.secondary);
}

function formatMessage(primary: string, secondary?: string): string {
  return secondary ? `${primary} ${secondary}` : primary;
}

/** Human-readable file size (e.g. 1.2 MB, 340 KB). */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}
