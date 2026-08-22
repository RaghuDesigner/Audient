"use client";

import * as React from "react";
import { Check, FileDown, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Caption } from "@/components/ui/typography";
import {
  EXPORT_PDF_BUTTON_COPY,
  EXPORT_PDF_BUTTON_MOCK_DELAY_MS,
  EXPORT_PDF_BUTTON_SUCCESS_HOLD_MS,
  EXPORT_PDF_BUTTON_UPGRADE_SOURCE,
  type ExportPdfButtonState,
  type ExportPdfButtonSurface,
  type ExportPdfButtonTier,
  type ExportPdfButtonVariant,
} from "@/config/export-pdf-button";
import { exportPdfButtonAnalytics } from "@/lib/analytics/export-pdf-button-events";
import {
  exportPdfButtonAccessibleName,
  exportPdfButtonLabel,
  exportPdfButtonTooltip,
  isExportPdfButtonInteractive,
  resolveExportPdfButtonState,
  resolveExportPdfClickIntent,
  shouldRenderExportPdfButton,
} from "@/utils/export-pdf-button";
import { cn } from "@/utils/cn";

export type ExportPdfButtonProps = {
  auditId: string;
  tier: ExportPdfButtonTier;
  /** Controlled state; omit for internal mock flow. */
  state?: ExportPdfButtonState;
  pdfReady?: boolean;
  label?: string;
  tooltip?: string;
  errorMessage?: string | null;
  variant?: ExportPdfButtonVariant;
  surface?: ExportPdfButtonSurface;
  onExport?: () => void | Promise<void>;
  onUpgrade?: (source: string) => void;
  onStateChange?: (state: ExportPdfButtonState) => void;
  className?: string;
};

/**
 * COMPONENT-030 — Export PDF Button.
 * Mock export progress → success placeholder. No real PDF generation.
 */
export function ExportPdfButton({
  auditId,
  tier,
  state: stateProp,
  pdfReady = true,
  label,
  tooltip,
  errorMessage = null,
  variant = "button",
  surface = "report",
  onExport,
  onUpgrade,
  onStateChange,
  className,
}: ExportPdfButtonProps) {
  const impressed = React.useRef(false);
  const timers = React.useRef<number[]>([]);
  const [internalState, setInternalState] =
    React.useState<ExportPdfButtonState>("default");
  const isControlled = stateProp !== undefined;

  const resolved = resolveExportPdfButtonState({
    tier,
    pdfReady,
    state: isControlled ? stateProp : internalState,
  });

  const setState = React.useCallback(
    (next: ExportPdfButtonState) => {
      if (!isControlled) setInternalState(next);
      onStateChange?.(next);
    },
    [isControlled, onStateChange],
  );

  React.useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
  }, []);

  React.useEffect(() => {
    if (!shouldRenderExportPdfButton(tier) || impressed.current) return;
    impressed.current = true;
    exportPdfButtonAnalytics.viewed({
      auditId,
      tier,
      surface,
      state: resolved,
    });
  }, [auditId, tier, surface, resolved]);

  if (!shouldRenderExportPdfButton(tier)) return null;

  const displayLabel = exportPdfButtonLabel({ state: resolved, label });
  const accessibleName = exportPdfButtonAccessibleName({
    state: resolved,
    label,
    variant,
  });
  const tip = exportPdfButtonTooltip({ state: resolved, tooltip });
  const interactive = isExportPdfButtonInteractive(resolved);
  const isIcon = variant === "icon";

  const runMockExport = async () => {
    setState("loading");
    exportPdfButtonAnalytics.started({ auditId, tier, surface });
    try {
      await onExport?.();
      await new Promise<void>((resolve) => {
        const id = window.setTimeout(() => resolve(), EXPORT_PDF_BUTTON_MOCK_DELAY_MS);
        timers.current.push(id);
      });
      setState("success");
      exportPdfButtonAnalytics.completed({ auditId, tier, surface });
      const hold = window.setTimeout(() => {
        setState("default");
      }, EXPORT_PDF_BUTTON_SUCCESS_HOLD_MS);
      timers.current.push(hold);
    } catch (err) {
      setState("error");
      exportPdfButtonAnalytics.failed({
        auditId,
        surface,
        reason: err instanceof Error ? err.message : "export_failed",
      });
    }
  };

  const handleClick = () => {
    const intent = resolveExportPdfClickIntent(resolved);
    if (intent === "upgrade") {
      exportPdfButtonAnalytics.upgradeClicked({
        auditId,
        source: EXPORT_PDF_BUTTON_UPGRADE_SOURCE,
        tier,
        surface,
      });
      onUpgrade?.(EXPORT_PDF_BUTTON_UPGRADE_SOURCE);
      return;
    }
    if (intent === "export") {
      void runMockExport();
    }
  };

  const icon =
    resolved === "success" ? (
      <Check className="size-4" aria-hidden />
    ) : resolved === "locked" ? (
      <Lock className="size-4" aria-hidden />
    ) : (
      <FileDown className="size-4" aria-hidden />
    );

  const statusText =
    resolved === "loading"
      ? EXPORT_PDF_BUTTON_COPY.loadingLabel
      : resolved === "success"
        ? EXPORT_PDF_BUTTON_COPY.successStatus
        : resolved === "error"
          ? (errorMessage ?? EXPORT_PDF_BUTTON_COPY.errorDefault)
          : null;

  return (
    <div className={cn("inline-flex flex-col gap-sm", className)}>
      <Button
        type="button"
        variant={resolved === "locked" ? "outline" : "primary"}
        size="sm"
        className={cn(
          resolved !== "locked" && "text-primary-foreground",
          isIcon && "min-w-11 px-sm",
        )}
        title={tip}
        aria-label={accessibleName}
        aria-busy={resolved === "loading"}
        disabled={!interactive}
        isLoading={resolved === "loading"}
        onClick={handleClick}
        iconLeft={resolved === "loading" ? undefined : icon}
      >
        {isIcon ? <span className="sr-only">{displayLabel}</span> : displayLabel}
      </Button>

      {statusText ? (
        <Caption
          role="status"
          aria-live={resolved === "error" ? "assertive" : "polite"}
          className={cn(
            resolved === "error" ? "text-error" : "text-muted-foreground",
          )}
        >
          {statusText}
          {resolved === "error" ? (
            <>
              {" "}
              <button
                type="button"
                className="font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={handleClick}
              >
                {EXPORT_PDF_BUTTON_COPY.retry}
              </button>
            </>
          ) : null}
        </Caption>
      ) : null}
    </div>
  );
}
