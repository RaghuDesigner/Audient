"use client";

import * as React from "react";

import { ImageSuccessPreview } from "@/components/home/upload/ImageSuccessPreview";
import { UploadSuccessActions } from "@/components/home/upload/UploadSuccessActions";
import { UrlSuccessPreview } from "@/components/home/upload/UrlSuccessPreview";
import { cn } from "@/utils/cn";

export type ImageSuccessData = {
  kind: "image";
  previewUrl: string;
  fileName: string;
  fileSize: number;
};

export type UrlSuccessData = {
  kind: "url";
  url: string;
};

export type UploadSuccessData = ImageSuccessData | UrlSuccessData;

export type UploadSuccessProps = {
  data: UploadSuccessData;
  analyzing?: boolean;
  onAnalyze: () => void;
  onRemove: () => void;
  onReplaceImage?: () => void;
  onUploadDifferent?: () => void;
  onEditUrl?: () => void;
  className?: string;
};

const SUCCESS_COPY = {
  image: {
    primary: "Image uploaded successfully.",
    secondary: "Ready to analyze.",
  },
  url: {
    primary: "Website validated successfully.",
    secondary: "Ready for AI Audit.",
  },
} as const;

/**
 * SCREEN-002 — Guest Home Upload Success (state of SCREEN-001).
 * Replaces the upload / URL input region only.
 */
export function UploadSuccess({
  data,
  analyzing = false,
  onAnalyze,
  onRemove,
  onReplaceImage,
  onUploadDifferent,
  onEditUrl,
  className,
}: UploadSuccessProps) {
  const analyzeRef = React.useRef<HTMLButtonElement>(null);
  const copy = SUCCESS_COPY[data.kind];
  const liveMessage = `${copy.primary} ${copy.secondary}`;

  const focusKey = data.kind === "image" ? data.fileName : data.url;

  React.useEffect(() => {
    analyzeRef.current?.focus();
  }, [focusKey]);

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center gap-lg",
        className,
      )}
      role="region"
      aria-label="Upload success"
    >
      <p className="sr-only" role="status" aria-live="polite">
        {liveMessage}
      </p>

      <div className="flex flex-col items-center gap-sm text-center">
        <p className="text-body-sm font-semibold text-success">
          {copy.primary}
        </p>
        <p className="text-info text-muted-foreground sm:text-body-sm">
          {copy.secondary}
        </p>
      </div>

      {data.kind === "image" ? (
        <ImageSuccessPreview
          previewUrl={data.previewUrl}
          fileName={data.fileName}
          fileSize={data.fileSize}
          onRemove={onRemove}
          onReplace={onReplaceImage ?? (() => undefined)}
        />
      ) : (
        <UrlSuccessPreview
          url={data.url}
          onEdit={onEditUrl ?? (() => undefined)}
          onRemove={onRemove}
        />
      )}

      <UploadSuccessActions
        source={data.kind}
        analyzing={analyzing}
        onAnalyze={onAnalyze}
        onUploadDifferent={
          data.kind === "image" ? onUploadDifferent : undefined
        }
        analyzeRef={analyzeRef}
      />
    </div>
  );
}
