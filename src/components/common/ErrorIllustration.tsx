"use client";

import Image from "next/image";
import {
  AlertCircle,
  FileQuestion,
  ServerCrash,
  ShieldX,
  WifiOff,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import {
  ERROR_ILLUSTRATION_ACCESSIBLE_LABELS,
  ERROR_ILLUSTRATION_ASSETS,
  ERROR_ILLUSTRATION_SIZE,
  type ErrorIllustrationType,
} from "@/config/error-illustration";
import type { ErrorStateSize } from "@/config/error-state";
import { cn } from "@/utils/cn";

export type ErrorIllustrationProps = {
  type: ErrorIllustrationType;
  size?: ErrorStateSize;
  /** Default `true` — hidden from assistive tech when Error State text is present. */
  decorative?: boolean;
  /** Required when `decorative` is false. */
  accessibleLabel?: string;
  className?: string;
};

const TYPE_ICONS: Record<ErrorIllustrationType, LucideIcon> = {
  not_found: FileQuestion,
  forbidden: ShieldX,
  server_error: ServerCrash,
  network_error: WifiOff,
  maintenance: Wrench,
  generic_error: AlertCircle,
};

/**
 * COMPONENT-073 — Error Illustration.
 * Variant artwork inside a muted container — static, no excessive animation.
 */
export function ErrorIllustration({
  type,
  size = "section",
  decorative = true,
  accessibleLabel,
  className,
}: ErrorIllustrationProps) {
  const dimensions = ERROR_ILLUSTRATION_SIZE[size];
  const assetSrc = ERROR_ILLUSTRATION_ASSETS[type];
  const Icon = TYPE_ICONS[type];
  const label =
    accessibleLabel ?? ERROR_ILLUSTRATION_ACCESSIBLE_LABELS[type];

  const artwork = assetSrc ? (
    <Image
      src={assetSrc}
      alt={decorative ? "" : label}
      width={size === "page" ? 32 : 28}
      height={size === "page" ? 32 : 28}
      className={dimensions.icon}
      aria-hidden={decorative ? true : undefined}
    />
  ) : (
    <Icon
      className={dimensions.icon}
      aria-hidden={decorative ? true : undefined}
    />
  );

  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground",
        dimensions.container,
        className,
      )}
      {...(decorative
        ? { "aria-hidden": true }
        : { role: "img", "aria-label": label })}
    >
      {artwork}
    </div>
  );
}
