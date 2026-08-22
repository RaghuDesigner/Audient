"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export type FailureActionsProps = {
  retryAllowed?: boolean;
  retrying?: boolean;
  detailsOpen: boolean;
  onRetry?: () => void;
  onUploadAnother: () => void;
  onBackHome: () => void;
  onToggleDetails: () => void;
  className?: string;
};

/**
 * SCREEN-003 recovery CTAs — Retry · Upload Another File · Back Home · Error Details.
 */
export function FailureActions({
  retryAllowed = true,
  retrying = false,
  detailsOpen,
  onRetry,
  onUploadAnother,
  onBackHome,
  onToggleDetails,
  className,
}: FailureActionsProps) {
  return (
    <div
      className={cn(
        "flex w-full max-w-2xl flex-col items-stretch gap-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-sm sm:flex-row sm:flex-wrap sm:justify-center">
        {retryAllowed && onRetry ? (
          <Button
            type="button"
            variant="primary"
            size="lg"
            isLoading={retrying}
            onClick={onRetry}
            aria-label="Retry audit"
            className="w-full text-primary-foreground sm:w-auto"
          >
            Retry
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={retrying}
          onClick={onUploadAnother}
          aria-label="Upload Another File"
          className="w-full sm:w-auto"
        >
          Upload Another File
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          disabled={retrying}
          onClick={onBackHome}
          aria-label="Back Home"
          className="w-full sm:w-auto"
        >
          Back Home
        </Button>
      </div>

      <div className="flex justify-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={retrying}
          onClick={onToggleDetails}
          aria-expanded={detailsOpen}
          aria-controls="audit-failure-details"
          className="gap-sm"
        >
          Error Details
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-fast",
              detailsOpen && "rotate-180",
            )}
            aria-hidden
          />
        </Button>
      </div>
    </div>
  );
}
