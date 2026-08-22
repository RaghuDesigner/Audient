"use client";

import * as React from "react";

import { FILE_ACCEPT_ATTR } from "@/utils/file-validation";
import { cn } from "@/utils/cn";

export type UploadCardProps = {
  /** Called when the user activates the tile (before file picker). */
  onSelect?: () => void;
  /** Called after a file is chosen via click or drag-and-drop. */
  onFileSelected?: (file: File) => void;
  className?: string;
  disabled?: boolean;
  /** Imperative open for Replace / Upload Different File. */
  openFilePickerRef?: React.MutableRefObject<(() => void) | null>;
};

/**
 * Screen1 screenshot upload tile — click + drag-and-drop.
 * Visual source of truth: `Assets/Image_Upload.svg`.
 */
export function UploadCard({
  onSelect,
  onFileSelected,
  className,
  disabled = false,
  openFilePickerRef,
}: UploadCardProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const openPicker = React.useCallback(() => {
    if (disabled) return;
    onSelect?.();
    inputRef.current?.click();
  }, [disabled, onSelect]);

  React.useEffect(() => {
    if (!openFilePickerRef) return;
    openFilePickerRef.current = openPicker;
    return () => {
      openFilePickerRef.current = null;
    };
  }, [openFilePickerRef, openPicker]);

  const deliverFile = (file: File | undefined) => {
    if (!file || disabled) return;
    onFileSelected?.(file);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    deliverFile(file);
    event.target.value = "";
  };

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    event.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    const file = event.dataTransfer.files?.[0];
    deliverFile(file);
  };

  return (
    <div className={cn("flex flex-col items-center gap-sm", className)}>
      <p className="text-center text-body-sm text-muted-foreground">
        Upload image or Screenshot
      </p>
      <button
        type="button"
        disabled={disabled}
        onClick={openPicker}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-label="Upload image or screenshot. Accepts PNG, JPG, JPEG, or WEBP up to 10 MB. Drag and drop supported."
        className={cn(
          "block size-upload-tile overflow-hidden rounded-md p-0",
          "transition-opacity duration-fast",
          "hover:opacity-95 active:opacity-90",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-50",
          "motion-reduce:transition-none",
          isDragging && "ring-2 ring-ring ring-offset-2 ring-offset-background",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- Figma export SVG */}
        <img
          src="/brand/Image_Upload.svg"
          alt=""
          width={120}
          height={120}
          className="size-upload-tile"
          aria-hidden
        />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={FILE_ACCEPT_ATTR}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        disabled={disabled}
        onChange={handleInputChange}
      />
    </div>
  );
}
