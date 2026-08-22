"use client";

import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BodySmall, Caption } from "@/components/ui/typography";
import { formatFileSize } from "@/utils/file-validation";
import { cn } from "@/utils/cn";

export type ImageSuccessPreviewProps = {
  previewUrl: string;
  fileName: string;
  fileSize: number;
  onRemove: () => void;
  onReplace: () => void;
  className?: string;
};

/**
 * Image success row — thumbnail, filename title, size, Replace / Remove.
 * Typography + Button variants only (DESIGN_TOKENS / shadcn).
 */
export function ImageSuccessPreview({
  previewUrl,
  fileName,
  fileSize,
  onRemove,
  onReplace,
  className,
}: ImageSuccessPreviewProps) {
  return (
    <div
      className={cn(
        "flex w-full max-w-2xl flex-col gap-md rounded-md border border-border bg-background p-md",
        "sm:flex-row sm:items-center",
        className,
      )}
    >
      <div
        className={cn(
          "relative mx-auto shrink-0 overflow-hidden rounded-md border border-border bg-muted",
          "size-upload-tile sm:mx-0",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
        <img
          src={previewUrl}
          alt={`Preview of ${fileName}`}
          className="size-full object-cover"
        />
        <span
          className={cn(
            "absolute left-sm top-sm inline-flex size-5 items-center justify-center",
            "rounded-full bg-success text-success-foreground shadow-sm",
          )}
          aria-hidden
        >
          <CheckCircle2 className="size-4" />
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-md">
        <div className="min-w-0 text-center sm:text-left">
          <BodySmall
            as="p"
            className="truncate font-semibold"
            title={fileName}
          >
            {fileName}
          </BodySmall>
          <Caption className="mt-sm">{formatFileSize(fileSize)}</Caption>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-sm sm:justify-start">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReplace}
            aria-label="Replace image"
          >
            Replace
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onRemove}
            aria-label="Remove image"
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
