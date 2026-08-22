"use client";

import * as React from "react";

import { ErrorState } from "@/components/common/ErrorState";
import {
  ERROR_SYSTEM_STATE_DEFINITIONS,
  type ErrorSystemAction,
  type ErrorSystemStateType,
} from "@/config/error-system-states";
import { resolveErrorActionsFromSystemType } from "@/utils/error-actions";
import { resolveErrorIllustrationTypeFromSystem } from "@/utils/error-illustration";
import { resolveErrorStateFromSystemType } from "@/utils/error-state";

export type ErrorStatePanelProps = {
  stateType: ErrorSystemStateType;
  errorId?: string | null;
  loading?: boolean;
  disabled?: boolean;
  onPrimaryAction?: (action: ErrorSystemAction) => void;
  onSecondaryAction?: (action: ErrorSystemAction) => void;
  className?: string;
  /** Full-page vs inline card padding. */
  size?: "page" | "section";
};

/**
 * SCREEN-025 adapter — maps system state types to ErrorState presentation.
 * Sanitized copy only — never renders stack traces or internal errors.
 */
export function ErrorStatePanel({
  stateType,
  errorId = null,
  loading = false,
  disabled = false,
  onPrimaryAction,
  onSecondaryAction,
  className,
  size = "page",
}: ErrorStatePanelProps) {
  const def = ERROR_SYSTEM_STATE_DEFINITIONS[stateType];
  const content = resolveErrorStateFromSystemType(stateType);
  const actions = resolveErrorActionsFromSystemType(stateType);

  return (
    <ErrorState
      variant={content.variant}
      illustrationType={resolveErrorIllustrationTypeFromSystem(stateType)}
      title={content.title}
      description={content.description}
      primaryAction={actions.primaryAction}
      secondaryAction={actions.secondaryAction}
      primaryLabel={content.primaryLabel}
      secondaryLabel={content.secondaryLabel}
      showErrorId={content.showErrorId}
      errorId={errorId}
      loading={loading}
      disabled={disabled}
      size={size}
      className={className}
      onPrimaryAction={
        def.primaryAction && onPrimaryAction ? onPrimaryAction : undefined
      }
      onSecondaryAction={
        def.secondaryAction && onSecondaryAction
          ? onSecondaryAction
          : undefined
      }
    />
  );
}
