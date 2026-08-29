"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { UploadCard } from "@/components/home/upload-card";
import { UploadFailure } from "@/components/home/upload/UploadFailure";
import { UploadSuccess } from "@/components/home/upload/UploadSuccess";
import type { UploadSuccessData } from "@/components/home/upload/UploadSuccess";
import { UrlInput } from "@/components/home/url-input";
import { useAuth } from "@/hooks/use-auth";
import { useRealAuditApi } from "@/hooks/use-real-audit-api";
import { useAccountOptional } from "@/providers/account-provider";
import { uploadAnalytics } from "@/lib/analytics/upload-events";
import { createAuditRequest } from "@/lib/audits/client";
import { useLoginModalControls } from "@/providers/login-modal-provider";
import { useUpgradePlansModal } from "@/providers/upgrade-plans-modal-provider";
import { toast } from "@/components/ui/toast";
import {
  FILE_ACCEPT_ATTR,
  validateImageFile,
} from "@/utils/file-validation";
import { canAccessUrlInput, type MembershipContext } from "@/utils/membership";
import { auditProcessingRoute } from "@/utils/audit-processing-route";
import { mockUploadImage } from "@/utils/mock-upload";
import type {
  ImageFailureReason,
  UrlFailureReason,
} from "@/utils/upload-errors";
import { validateHttpsUrl } from "@/utils/url-validation";
import { cn } from "@/utils/cn";

type IdleState = {
  mode: "idle";
  urlDraft: string;
};

type ImageSuccessState = {
  mode: "image_success";
  file: File;
  previewUrl: string;
};

type UrlSuccessState = {
  mode: "url_success";
  url: string;
};

type UrlEditingState = {
  mode: "url_editing";
  urlDraft: string;
};

type ImageFailureState = {
  mode: "image_failure";
  reason: ImageFailureReason;
  file: File | null;
  fileName: string;
};

type UrlFailureState = {
  mode: "url_failure";
  reason: UrlFailureReason;
  urlDraft: string;
};

type EntryState =
  | IdleState
  | ImageSuccessState
  | UrlSuccessState
  | UrlEditingState
  | ImageFailureState
  | UrlFailureState;

function createMockAuditId(): string {
  return `mock-${Date.now().toString(36)}`;
}

/**
 * Guest Home audit entry — idle · success · failure (SCREEN-002 / SCREEN-003).
 * Validation + mock upload live outside UI components.
 */
function resolveMembership(
  isGuest: boolean,
  planTier: MembershipContext | undefined,
): MembershipContext {
  if (isGuest || !planTier) return "GUEST";
  return planTier;
}

export function AuditEntry({ className }: { className?: string }) {
  const router = useRouter();
  const { openLogin } = useLoginModalControls();
  const { openUpgrade } = useUpgradePlansModal();
  const { isGuest, user, isLoading: authLoading } = useAuth();
  const useRealApi = useRealAuditApi();
  const accountCtx = useAccountOptional();
  const planTier =
    accountCtx?.account?.planTier ??
    accountCtx?.effectiveUser?.planTier ??
    user?.planTier;
  const membership = resolveMembership(
    isGuest || authLoading,
    planTier,
  );
  const urlAllowed =
    !isGuest &&
    !authLoading &&
    (accountCtx?.account != null
      ? accountCtx.account.limits.urlAuditsEnabled &&
        accountCtx.account.membershipStatus !== "cancelled"
      : canAccessUrlInput(membership));
  const idlePickerRef = React.useRef<(() => void) | null>(null);
  const replaceInputRef = React.useRef<HTMLInputElement>(null);
  const urlInputFocusRef = React.useRef(false);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [retrying, setRetrying] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [pendingOpenPicker, setPendingOpenPicker] = React.useState(false);
  const [state, setState] = React.useState<EntryState>({
    mode: "idle",
    urlDraft: "",
  });

  const openPlansModal = React.useCallback(() => {
    openUpgrade({
      source: "url_gate",
      reason: "url_gate",
      focusTier: "PRO",
    });
  }, [openUpgrade]);

  const handleUrlProtectedAction = React.useCallback(
    (urlDraft = "") => {
      if (isGuest || membership === "GUEST") {
        openLogin({
          source: "url_gate",
          nextPath: "/",
          intent: {
            type: "url_audit",
            payload: urlDraft,
          },
        });
        return;
      }

      openPlansModal();
    },
    [isGuest, membership, openLogin, openPlansModal],
  );

  const previewUrl =
    state.mode === "image_success" ? state.previewUrl : null;

  React.useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  React.useEffect(() => {
    if (!pendingOpenPicker) return;
    if (state.mode !== "idle" && state.mode !== "url_editing") return;
    idlePickerRef.current?.();
    setPendingOpenPicker(false);
  }, [pendingOpenPicker, state.mode]);

  const resetToIdle = React.useCallback((urlDraft = "") => {
    setRetrying(false);
    setUploading(false);
    setState({ mode: "idle", urlDraft });
  }, []);

  const applyImageFile = React.useCallback(
    async (file: File, replaced = false) => {
      const sync = validateImageFile(file);
      if (!sync.ok) {
        uploadAnalytics.failed(sync.reason);
        setState({
          mode: "image_failure",
          reason: sync.reason,
          file,
          fileName: file.name,
        });
        return;
      }

      setUploading(true);
      const result = await mockUploadImage(file);
      setUploading(false);

      if (!result.ok) {
        uploadAnalytics.failed(result.reason);
        setState({
          mode: "image_failure",
          reason: result.reason,
          file,
          fileName: file.name,
        });
        return;
      }

      setState({
        mode: "image_success",
        file,
        previewUrl: result.previewUrl,
      });

      if (replaced) {
        uploadAnalytics.replaced();
      } else {
        uploadAnalytics.success("image");
      }
    },
    [],
  );

  const handleUrlSubmit = (raw: string) => {
    if (!urlAllowed) {
      handleUrlProtectedAction(raw);
      return;
    }

    const result = validateHttpsUrl(raw);
    if (!result.ok) {
      uploadAnalytics.validationFailed(result.reason);
      setState({
        mode: "url_failure",
        reason: result.reason,
        urlDraft: raw,
      });
      return;
    }

    setState({ mode: "url_success", url: result.href });
    uploadAnalytics.success("url");
  };

  const startAudit = React.useCallback(
    async (input: {
      inputType: "SCREENSHOT" | "URL";
      websiteUrl?: string;
      imageFile?: File;
    }) => {
      setAnalyzing(true);
      uploadAnalytics.auditStarted(
        input.inputType === "URL" ? "url" : "image",
      );

      if (!useRealApi) {
        router.push(auditProcessingRoute(createMockAuditId()));
        return;
      }

      try {
        let imageDataUrl: string | null = null;
        if (input.inputType === "SCREENSHOT" && input.imageFile) {
          imageDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () =>
              reject(new Error("Unable to read screenshot for analysis"));
            reader.readAsDataURL(input.imageFile!);
          });
        }

        const created = await createAuditRequest({
          inputType: input.inputType,
          websiteUrl: input.websiteUrl ?? null,
          imageDataUrl,
        });
        accountCtx?.refresh();
        router.push(auditProcessingRoute(created.auditId));
      } catch (error) {
        setAnalyzing(false);
        toast.error(
          error instanceof Error ? error.message : "Unable to start audit",
        );
      }
    },
    [accountCtx, router, useRealApi],
  );

  const handleAnalyze = () => {
    if (state.mode === "image_success") {
      void startAudit({
        inputType: "SCREENSHOT",
        imageFile: state.file,
      });
      return;
    }

    if (state.mode !== "url_success") return;

    // Pro / Business — start URL audit (same path as image).
    if (urlAllowed) {
      void startAudit({ inputType: "URL", websiteUrl: state.url });
      return;
    }

    // Guest — login gate with resume intent.
    if (isGuest || membership === "GUEST") {
      openLogin({
        source: "url_gate",
        nextPath: "/",
        intent: {
          type: "url_audit",
          payload: state.url,
        },
      });
      return;
    }

    // Free — upgrade prompt (URL audits require Pro+).
    openPlansModal();
  };

  const handleImageRetry = async () => {
    if (state.mode !== "image_failure") return;
    uploadAnalytics.retry("image");
    if (!state.file) {
      setPendingOpenPicker(true);
      resetToIdle();
      return;
    }
    setRetrying(true);
    await applyImageFile(state.file, false);
    setRetrying(false);
  };

  const handleUrlRetry = () => {
    if (state.mode !== "url_failure") return;
    uploadAnalytics.retry("url");
    handleUrlSubmit(state.urlDraft);
  };

  const successData: UploadSuccessData | null =
    state.mode === "image_success"
      ? {
          kind: "image",
          previewUrl: state.previewUrl,
          fileName: state.file.name,
          fileSize: state.file.size,
        }
      : state.mode === "url_success"
        ? { kind: "url", url: state.url }
        : null;

  const sharedReplaceInput = (
    <input
      ref={replaceInputRef}
      type="file"
      accept={FILE_ACCEPT_ATTR}
      className="sr-only"
      tabIndex={-1}
      aria-hidden
      onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) void applyImageFile(file, true);
        event.target.value = "";
      }}
    />
  );

  if (successData) {
    return (
      <div className={cn("w-full", className)}>
        <UploadSuccess
          data={successData}
          analyzing={analyzing}
          onAnalyze={handleAnalyze}
          onRemove={() => {
            uploadAnalytics.removed(successData.kind);
            resetToIdle();
          }}
          onReplaceImage={() => replaceInputRef.current?.click()}
          onUploadDifferent={() => {
            resetToIdle();
            setPendingOpenPicker(true);
          }}
          onEditUrl={() => {
            if (state.mode === "url_success") {
              setState({
                mode: "url_editing",
                urlDraft: state.url,
              });
            }
          }}
        />
        {sharedReplaceInput}
      </div>
    );
  }

  if (state.mode === "image_failure") {
    return (
      <div className={cn("w-full", className)}>
        <UploadFailure
          reason={state.reason}
          fileName={state.fileName}
          retrying={retrying || uploading}
          onRetry={() => void handleImageRetry()}
          onReplace={() => replaceInputRef.current?.click()}
          onRemove={() => {
            uploadAnalytics.removed("image");
            resetToIdle();
          }}
        />
        {sharedReplaceInput}
      </div>
    );
  }

  if (state.mode === "url_failure") {
    return (
      <div
        className={cn(
          "flex w-full flex-col items-center gap-lg",
          className,
        )}
      >
        <UploadFailure
          reason={state.reason}
          urlDraft={state.urlDraft}
          retrying={retrying}
          onRetry={handleUrlRetry}
          onReplace={() => {
            if (!urlAllowed) {
              openPlansModal();
              return;
            }
            urlInputFocusRef.current = true;
            setState({
              mode: "url_editing",
              urlDraft: state.urlDraft,
            });
          }}
          onRemove={() => {
            uploadAnalytics.removed("url");
            resetToIdle();
          }}
        />
        <UrlInput
          value={state.urlDraft}
          gated={!urlAllowed}
          disabled={retrying}
          onProtectedAction={() => handleUrlProtectedAction(state.urlDraft)}
          onChange={(value) => {
            // Clear failure treatment on edit; retain typed URL.
            setState({ mode: "url_editing", urlDraft: value });
          }}
          onSubmit={handleUrlSubmit}
        />
      </div>
    );
  }

  const urlDraft =
    state.mode === "idle" || state.mode === "url_editing"
      ? state.urlDraft
      : "";

  return (
    <div
      className={cn("flex w-full flex-col items-center gap-lg", className)}
    >
      <div className="flex w-full flex-col items-center gap-sm">
        <UploadCard
          disabled={uploading}
          openFilePickerRef={idlePickerRef}
          onFileSelected={(file) => void applyImageFile(file, false)}
        />
        {uploading ? (
          <p className="text-info text-muted-foreground" role="status">
            Uploading…
          </p>
        ) : null}
      </div>

      <p
        className="text-info text-muted-foreground"
        role="separator"
        aria-label="or"
      >
        or
      </p>

      <UrlInput
        value={urlDraft}
        gated={!urlAllowed}
        disabled={uploading}
        autoFocus={
          urlAllowed &&
          state.mode === "url_editing" &&
          urlInputFocusRef.current
        }
        onProtectedAction={handleUrlProtectedAction}
        onChange={(value) => {
          urlInputFocusRef.current = false;
          setState({ mode: "idle", urlDraft: value });
        }}
        onSubmit={handleUrlSubmit}
      />
    </div>
  );
}
