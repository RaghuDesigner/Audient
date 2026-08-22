/**
 * Guest Home upload / URL failure codes + copy (home_upload_failure.md).
 * Keep messages here — UI must not invent strings.
 */

export const IMAGE_FAILURE_REASONS = [
  "unsupported_type",
  "too_large",
  "corrupted",
  "network",
  "timeout",
] as const;

export type ImageFailureReason = (typeof IMAGE_FAILURE_REASONS)[number];

export const URL_FAILURE_REASONS = [
  "empty",
  "invalid",
  "private",
] as const;

export type UrlFailureReason = (typeof URL_FAILURE_REASONS)[number];

export type UploadFailureReason = ImageFailureReason | UrlFailureReason;

export type UploadFailureCopy = {
  primary: string;
  secondary?: string;
};

const IMAGE_FAILURE_COPY: Record<ImageFailureReason, UploadFailureCopy> = {
  unsupported_type: {
    primary: "Unsupported file format.",
  },
  too_large: {
    primary: "Maximum file size exceeded.",
  },
  corrupted: {
    primary: "Unable to upload image.",
  },
  network: {
    primary: "Unable to upload image.",
    secondary: "Please try again.",
  },
  timeout: {
    primary: "Unable to upload image.",
    secondary: "Please try again.",
  },
};

const URL_FAILURE_COPY: Record<UrlFailureReason, UploadFailureCopy> = {
  empty: {
    primary: "Invalid website URL.",
  },
  invalid: {
    primary: "Invalid website URL.",
  },
  private: {
    primary: "Website cannot be reached.",
  },
};

export function isImageFailureReason(
  reason: UploadFailureReason,
): reason is ImageFailureReason {
  return (IMAGE_FAILURE_REASONS as readonly string[]).includes(reason);
}

export function getUploadFailureCopy(
  reason: UploadFailureReason,
): UploadFailureCopy {
  if (isImageFailureReason(reason)) {
    return IMAGE_FAILURE_COPY[reason];
  }
  return URL_FAILURE_COPY[reason];
}

export function formatFailureAnnouncement(copy: UploadFailureCopy): string {
  return copy.secondary
    ? `${copy.primary} ${copy.secondary}`
    : copy.primary;
}
