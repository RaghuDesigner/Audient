"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/ui/error-banner";
import {
  formatFailureAnnouncement,
  getUploadFailureCopy,
  isImageFailureReason,
  type UploadFailureReason,
} from "@/utils/upload-errors";
import { cn } from "@/utils/cn";

export type UploadFailureProps = {
  reason: UploadFailureReason;
  /** Retained filename for image failures (Replace / Retry context). */
  fileName?: string;
  /** Retained URL draft for URL failures. */
  urlDraft?: string;
  retrying?: boolean;
  onRetry: () => void;
  onReplace: () => void;
  onRemove: () => void;
  className?: string;
};

/**
 * SCREEN-003 — Guest Home Upload Failure (upload area only).
 * ErrorBanner + Retry / Replace / Remove recovery actions.
 */
export function UploadFailure({
  reason,
  fileName,
  urlDraft,
  retrying = false,
  onRetry,
  onReplace,
  onRemove,
  className,
}: UploadFailureProps) {
  const bannerRef = React.useRef<HTMLDivElement>(null);
  const copy = getUploadFailureCopy(reason);
  const isImage = isImageFailureReason(reason);
  const announcement = formatFailureAnnouncement(copy);

  React.useEffect(() => {
    bannerRef.current?.focus();
  }, [reason, fileName, urlDraft]);

  return (
    <div
      className={cn("flex w-full flex-col items-center gap-md", className)}
      role="region"
      aria-label="Upload error"
    >
      <span className="sr-only">{announcement}</span>
      <ErrorBanner
        ref={bannerRef}
        message={copy.primary}
        description={copy.secondary}
        actions={
          <>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={retrying}
              onClick={onRetry}
              aria-label={isImage ? "Retry upload" : "Retry URL validation"}
            >
              Retry
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={retrying}
              onClick={onReplace}
              aria-label={isImage ? "Replace file" : "Edit website URL"}
            >
              Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={retrying}
              onClick={onRemove}
              aria-label={isImage ? "Remove file" : "Remove website URL"}
            >
              Remove
            </Button>
          </>
        }
      >
        {isImage && fileName ? (
          <p className="truncate text-info text-muted-foreground">
            File:{" "}
            <span className="font-semibold text-foreground">{fileName}</span>
          </p>
        ) : null}
        {!isImage && urlDraft ? (
          <p className="truncate text-info text-muted-foreground" title={urlDraft}>
            URL:{" "}
            <span className="font-semibold text-foreground">{urlDraft}</span>
          </p>
        ) : null}
      </ErrorBanner>
    </div>
  );
}
