"use client";

import * as React from "react";

import {
  SHARE_REPORT_MODAL_COPY,
  SHARE_REPORT_MODAL_COPIED_HOLD_MS,
  SHARE_REPORT_MODAL_GENERATE_DELAY_MS,
  type ShareReportModalState,
  type ShareReportModalTier,
  type ShareReportPermission,
  type ShareReportShareOption,
} from "@/config/share-report-modal";
import { shareReportModalAnalytics } from "@/lib/analytics/share-report-modal-events";
import {
  buildMockShareReportUrl,
  canDismissShareReportModal,
  defaultShareReportPermission,
  isValidShareEmail,
} from "@/utils/share-report-modal";

export function useShareReportModalController(input: {
  open: boolean;
  auditId: string;
  tier: ShareReportModalTier;
  stateProp?: ShareReportModalState;
  shareUrlProp?: string | null;
  permissionProp?: ShareReportPermission;
  onPermissionChange?: (permission: ShareReportPermission) => void;
  onGenerateLink?: () => void | Promise<void>;
  onCopyLink?: (url: string) => void | Promise<void>;
  onEmailShare?: (email: string) => void | Promise<void>;
  onClose: () => void;
}) {
  const {
    open,
    auditId,
    tier,
    stateProp,
    shareUrlProp,
    permissionProp,
    onPermissionChange,
    onGenerateLink,
    onCopyLink,
    onEmailShare,
    onClose,
  } = input;

  const openedFor = React.useRef<string | null>(null);
  const timers = React.useRef<number[]>([]);
  const [internalState, setInternalState] =
    React.useState<ShareReportModalState>("default");
  const [internalUrl, setInternalUrl] = React.useState<string | null>(null);
  const [internalPermission, setInternalPermission] =
    React.useState<ShareReportPermission>(defaultShareReportPermission(tier));
  const [activeOption, setActiveOption] =
    React.useState<ShareReportShareOption>("link");
  const [email, setEmail] = React.useState("");
  const [emailError, setEmailError] = React.useState<string | null>(null);

  const stateControlled = stateProp !== undefined;
  const urlControlled = shareUrlProp !== undefined;
  const permissionControlled = permissionProp !== undefined;
  const state = stateControlled ? stateProp : internalState;
  const shareUrl = urlControlled ? (shareUrlProp ?? null) : internalUrl;
  const permission = permissionControlled
    ? (permissionProp as ShareReportPermission)
    : internalPermission;

  const setState = (next: ShareReportModalState) => {
    if (!stateControlled) setInternalState(next);
  };

  React.useEffect(() => () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  React.useEffect(() => {
    if (!open) {
      openedFor.current = null;
      return;
    }
    if (openedFor.current === auditId) return;
    openedFor.current = auditId;
    shareReportModalAnalytics.opened({ auditId, tier });
    setActiveOption("link");
    setEmail("");
    setEmailError(null);
    if (!stateControlled) setInternalState("default");
    if (!urlControlled) setInternalUrl(null);
    if (!permissionControlled) {
      setInternalPermission(defaultShareReportPermission(tier));
    }
  }, [open, auditId, tier, stateControlled, urlControlled, permissionControlled]);

  const dismiss = () => {
    if (!canDismissShareReportModal(state)) return;
    shareReportModalAnalytics.closed({ auditId, tier });
    onClose();
  };

  const handleGenerate = async () => {
    setState("generating");
    try {
      await onGenerateLink?.();
      await new Promise<void>((r) => {
        timers.current.push(
          window.setTimeout(r, SHARE_REPORT_MODAL_GENERATE_DELAY_MS),
        );
      });
      const url = buildMockShareReportUrl(auditId);
      if (!urlControlled) setInternalUrl(url);
      setState("link_generated");
      shareReportModalAnalytics.linkGenerated({ auditId, permission, tier });
    } catch (err) {
      setState("error");
      shareReportModalAnalytics.failed({
        auditId,
        reason: err instanceof Error ? err.message : "generate_failed",
      });
    }
  };

  const handleCopy = async () => {
    const url = shareUrl ?? buildMockShareReportUrl(auditId);
    if (!shareUrl && !urlControlled) setInternalUrl(url);
    try {
      await onCopyLink?.(url);
      await navigator.clipboard?.writeText?.(url);
      setState("copied");
      shareReportModalAnalytics.linkCopied({ auditId, permission });
      timers.current.push(
        window.setTimeout(
          () => setState("link_generated"),
          SHARE_REPORT_MODAL_COPIED_HOLD_MS,
        ),
      );
    } catch (err) {
      setState("error");
      shareReportModalAnalytics.failed({
        auditId,
        reason: err instanceof Error ? err.message : "copy_failed",
      });
    }
  };

  return {
    state,
    shareUrl,
    permission,
    activeOption,
    setActiveOption,
    email,
    emailError,
    generating: state === "generating",
    dismiss,
    handleGenerate,
    handleCopy,
    handlePermissionChange: (next: ShareReportPermission) => {
      if (!permissionControlled) setInternalPermission(next);
      onPermissionChange?.(next);
    },
    handleEmailChange: (value: string) => {
      setEmail(value);
      setEmailError(null);
    },
    handleSendEmail: () => {
      if (!isValidShareEmail(email)) {
        setEmailError(SHARE_REPORT_MODAL_COPY.emailInvalid);
        return;
      }
      setEmailError(null);
      void onEmailShare?.(email.trim());
      shareReportModalAnalytics.emailShared({ auditId, tier });
    },
  };
}
