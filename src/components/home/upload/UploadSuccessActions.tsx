"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export type UploadSuccessActionsProps = {
  source: "image" | "url";
  analyzing?: boolean;
  onAnalyze: () => void;
  onUploadDifferent?: () => void;
  analyzeRef?: React.Ref<HTMLButtonElement>;
  className?: string;
};

/**
 * Success CTAs — primary analyze + Upload Different File (image path).
 */
export function UploadSuccessActions({
  source,
  analyzing = false,
  onAnalyze,
  onUploadDifferent,
  analyzeRef,
  className,
}: UploadSuccessActionsProps) {
  const analyzeLabel =
    source === "image" ? "Analyze Image/Screenshot" : "Analyze Website";

  return (
    <div
      className={cn(
        "flex w-full max-w-2xl flex-col items-stretch gap-sm sm:flex-row sm:justify-center",
        className,
      )}
    >
      <Button
        ref={analyzeRef}
        type="button"
        variant="primary"
        size="lg"
        isLoading={analyzing}
        onClick={onAnalyze}
        aria-label={analyzeLabel}
        className="w-full text-primary-foreground sm:w-auto"
      >
        {analyzeLabel}
      </Button>
      {source === "image" && onUploadDifferent ? (
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={analyzing}
          onClick={onUploadDifferent}
          aria-label="Upload Different File"
        >
          Upload Different File
        </Button>
      ) : null}
    </div>
  );
}
