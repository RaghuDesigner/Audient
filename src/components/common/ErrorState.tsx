"use client";

import * as React from "react";

import { ErrorActions } from "@/components/common/ErrorActions";
import { ErrorIllustration } from "@/components/common/ErrorIllustration";
import { BodySmall, Caption } from "@/components/ui/typography";
import type { ErrorIllustrationType } from "@/config/error-illustration";
import type { ErrorSystemAction } from "@/config/error-system-states";
import {
  ERROR_STATE_COPY,
  ERROR_STATE_DEFAULTS,
  type ErrorStateSize,
  type ErrorStateVariant,
} from "@/config/error-state";
import { resolveErrorActionsFromVariant } from "@/utils/error-actions";
import { resolveErrorIllustrationType } from "@/utils/error-illustration";
import { resolveErrorStateContent } from "@/utils/error-state";
import { cn } from "@/utils/cn";

export type ErrorStateProps = {
  /** Core variant — use `custom` when supplying all copy via props. */
  variant: ErrorStateVariant;
  /** Override illustration type when variant is `custom` or extended system key. */
  illustrationType?: ErrorIllustrationType;
  /** Override default error title. */
  title?: string;
  /** Override default description. */
  description?: string;
  /** Override primary action key. */
  primaryAction?: ErrorSystemAction | null;
  /** Override secondary action key. */
  secondaryAction?: ErrorSystemAction | null;
  /** Override primary action label; pass `null` to hide. */
  primaryLabel?: string | null;
  /** Override secondary action label; pass `null` to hide. */
  secondaryLabel?: string | null;
  /** Wired handler — receives action key (Retry, Login, etc.). */
  onPrimaryAction?: (action: ErrorSystemAction) => void;
  onSecondaryAction?: (action: ErrorSystemAction) => void;
  /** Simple handler when action key is not needed. */
  onPrimary?: () => void;
  onSecondary?: () => void;
  /** Opaque correlation id — never pass stack traces or internal errors. */
  errorId?: string | null;
  /** When omitted, follows variant defaults. */
  showErrorId?: boolean;
  loading?: boolean;
  disabled?: boolean;
  /** Override default illustration (decorative). */
  illustration?: React.ReactNode;
  size?: ErrorStateSize;
  /** Page errors use `h1`; inline sections use lower levels. */
  headingLevel?: "h1" | "h2" | "h3" | "h4";
  className?: string;
};

/**
 * COMPONENT-072 — Error State.
 * Illustration · title · description · optional error id · Error Actions.
 * Sanitized copy only — never renders stack traces or internal errors.
 */
export function ErrorState({
  variant,
  illustrationType: illustrationTypeProp,
  title: titleProp,
  description: descriptionProp,
  primaryAction: primaryActionProp,
  secondaryAction: secondaryActionProp,
  primaryLabel: primaryLabelProp,
  secondaryLabel: secondaryLabelProp,
  onPrimaryAction,
  onSecondaryAction,
  onPrimary,
  onSecondary,
  errorId = null,
  showErrorId: showErrorIdProp,
  loading = false,
  disabled = false,
  illustration,
  size = "section",
  headingLevel: headingLevelProp,
  className,
}: ErrorStateProps) {
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const content = resolveErrorStateContent(variant, {
    title: titleProp,
    description: descriptionProp,
    primaryLabel: primaryLabelProp,
    secondaryLabel: secondaryLabelProp,
    showErrorId: showErrorIdProp,
  });
  const resolvedActions = resolveErrorActionsFromVariant(variant);

  const primaryAction =
    primaryActionProp !== undefined
      ? primaryActionProp
      : resolvedActions.primaryAction;
  const secondaryAction =
    secondaryActionProp !== undefined
      ? secondaryActionProp
      : resolvedActions.secondaryAction;
  const primaryLabel =
    primaryLabelProp !== undefined
      ? primaryLabelProp
      : content.primaryLabel ?? resolvedActions.primaryLabel;
  const secondaryLabel =
    secondaryLabelProp !== undefined
      ? secondaryLabelProp
      : content.secondaryLabel ?? resolvedActions.secondaryLabel;

  const headingLevel =
    headingLevelProp ?? (size === "page" ? "h1" : "h2");
  const HeadingTag = headingLevel;

  const illustrationType =
    illustrationTypeProp ?? resolveErrorIllustrationType(variant);

  const displayErrorId =
    Boolean(errorId) &&
    (showErrorIdProp ?? content.showErrorId);

  React.useEffect(() => {
    if (size === "page") {
      headingRef.current?.focus();
    }
  }, [size, content.title]);

  const handlePrimary = React.useCallback(
    (action: ErrorSystemAction) => {
      if (onPrimaryAction) {
        onPrimaryAction(action);
        return;
      }
      onPrimary?.();
    },
    [onPrimary, onPrimaryAction],
  );

  const handleSecondary = React.useCallback(
    (action: ErrorSystemAction) => {
      if (onSecondaryAction) {
        onSecondaryAction(action);
        return;
      }
      onSecondary?.();
    },
    [onSecondary, onSecondaryAction],
  );

  const hasPrimaryHandler = Boolean(onPrimaryAction ?? onPrimary);
  const hasSecondaryHandler = Boolean(onSecondaryAction ?? onSecondary);

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center text-center",
        size === "page"
          ? "mx-auto max-w-md gap-md px-md py-xl sm:py-2xl"
          : "gap-md rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg",
        className,
      )}
      role="alert"
      aria-live="assertive"
    >
      {illustration ?? (
        <ErrorIllustration type={illustrationType} size={size} decorative />
      )}

      <div className="flex max-w-md flex-col gap-sm">
        <HeadingTag
          ref={headingRef}
          tabIndex={size === "page" ? -1 : undefined}
          className={cn(
            "font-bold text-foreground outline-none",
            size === "page"
              ? "text-body sm:text-body-lg"
              : "text-body-sm sm:text-body",
          )}
        >
          {content.title}
        </HeadingTag>
        <BodySmall className="text-muted-foreground">
          {content.description}
        </BodySmall>
        {displayErrorId ? (
          <Caption className="text-muted-foreground">
            {ERROR_STATE_COPY.errorIdLabel}:{" "}
            <span className="font-mono font-semibold text-foreground">
              {errorId}
            </span>
          </Caption>
        ) : null}
      </div>

      <ErrorActions
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
        primaryLabel={primaryLabel}
        secondaryLabel={secondaryLabel}
        onPrimary={hasPrimaryHandler ? handlePrimary : undefined}
        onSecondary={hasSecondaryHandler ? handleSecondary : undefined}
        loading={loading}
        disabled={disabled}
      />
    </div>
  );
}

/** Re-export defaults for Storybook / tests. */
export { ERROR_STATE_DEFAULTS };
