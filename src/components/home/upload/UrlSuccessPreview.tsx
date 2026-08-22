"use client";

import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export type UrlSuccessPreviewProps = {
  url: string;
  onEdit: () => void;
  onRemove: () => void;
  className?: string;
};

/**
 * URL success row — validated HTTPS URL with Edit / Remove.
 */
export function UrlSuccessPreview({
  url,
  onEdit,
  onRemove,
  className,
}: UrlSuccessPreviewProps) {
  return (
    <div
      className={cn(
        "flex w-full max-w-2xl flex-col gap-md rounded-md border border-border bg-background p-md",
        "sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-sm">
        <CheckCircle2
          className="mt-0.5 size-5 shrink-0 text-success"
          aria-hidden
        />
        <div className="min-w-0">
          <p className="text-info font-semibold text-success">
            Website URL
          </p>
          <p className="truncate text-body-sm text-foreground" title={url}>
            {url}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-sm">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onEdit}
          aria-label="Edit website URL"
        >
          Edit
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          aria-label="Remove website URL"
        >
          Remove
        </Button>
      </div>
    </div>
  );
}
