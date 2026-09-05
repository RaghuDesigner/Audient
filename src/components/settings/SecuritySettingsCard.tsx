"use client";

import * as React from "react";

import { LogoutConfirmDialog } from "@/components/auth/LogoutConfirmDialog";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  SECURITY_SETTINGS_CARD_COPY,
  SECURITY_SETTINGS_CARD_MOCK_DELAY_MS,
  SECURITY_SETTINGS_CARD_SUCCESS_FLASH_MS,
  type SecuritySettingsCardState,
} from "@/config/security-settings-card";
import { securitySettingsCardAnalytics } from "@/lib/analytics/security-settings-card-events";
import {
  displaySecuritySettingsCardValue,
  isSecuritySettingsCardBusy,
} from "@/utils/security-settings-card";
import { cn } from "@/utils/cn";

export type SecuritySettingsCardProps = {
  authProvider: string;
  currentSession: string;
  lastActive: string;
  locationLabel?: string | null;
  /** External override; omit for internal state machine. */
  state?: SecuritySettingsCardState;
  /** Existing mock auth signOut — do not invent a second auth path. */
  onSignOut: () => void | Promise<void>;
  /** Mock clear-all-devices after confirmation. */
  onSignOutAllDevices: () => void | Promise<void>;
  onRetry?: () => void;
  className?: string;
};

/**
 * COMPONENT-047 — Security Settings Card.
 * Session readout + sign-out via existing mock auth — no secrets displayed.
 */
export function SecuritySettingsCard({
  authProvider,
  currentSession,
  lastActive,
  locationLabel,
  state: stateProp,
  onSignOut,
  onSignOutAllDevices,
  onRetry,
  className,
}: SecuritySettingsCardProps) {
  const viewed = React.useRef(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const successTimer = React.useRef<number | null>(null);
  const [errorKind, setErrorKind] = React.useState<"signOut" | "signOutAll">(
    "signOut",
  );
  const [logoutOpen, setLogoutOpen] = React.useState(false);

  const [internalState, setInternalState] =
    React.useState<SecuritySettingsCardState>("default");

  const state = stateProp ?? internalState;
  const isControlled = stateProp != null;
  const setState = (next: SecuritySettingsCardState) => {
    if (!isControlled) setInternalState(next);
  };

  const processing = isSecuritySettingsCardBusy(state);
  const isError = state === "error";
  const confirmOpen =
    state === "confirmation" ||
    (processing && errorKind === "signOutAll");

  React.useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    securitySettingsCardAnalytics.viewed();
  }, []);

  React.useEffect(() => {
    return () => {
      if (successTimer.current != null) {
        window.clearTimeout(successTimer.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (state !== "confirmation") return;
    const frame = window.requestAnimationFrame(() => {
      cancelRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [state]);

  const flashSuccess = (message: string) => {
    setState("success");
    toast.success(message);
    if (successTimer.current != null) {
      window.clearTimeout(successTimer.current);
    }
    successTimer.current = window.setTimeout(() => {
      setState("default");
    }, SECURITY_SETTINGS_CARD_SUCCESS_FLASH_MS);
  };

  const runAction = async (
    kind: "signOut" | "signOutAll",
    action: () => void | Promise<void>,
    successMessage: string,
  ) => {
    if (isControlled) {
      await action();
      return;
    }
    setErrorKind(kind);
    setState("processing");
    try {
      await action();
      flashSuccess(successMessage);
    } catch {
      setState("error");
      toast.error(
        kind === "signOutAll"
          ? SECURITY_SETTINGS_CARD_COPY.signOutAllError
          : SECURITY_SETTINGS_CARD_COPY.signOutError,
      );
    }
  };

  const handleSignOut = () => {
    if (processing || isError || confirmOpen) return;
    setLogoutOpen(true);
  };

  const handleLogoutConfirm = () => {
    setLogoutOpen(false);
    void Promise.resolve(onSignOut());
  };

  const openSignOutAllConfirm = () => {
    if (processing || isError || logoutOpen) return;
    securitySettingsCardAnalytics.signOutAllDevicesClicked();
    setErrorKind("signOutAll");
    setState("confirmation");
  };

  const closeConfirm = () => {
    if (processing) return;
    setState("default");
  };

  const confirmSignOutAll = () => {
    if (processing) return;
    void runAction(
      "signOutAll",
      async () => {
        await Promise.resolve(onSignOutAllDevices());
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, SECURITY_SETTINGS_CARD_MOCK_DELAY_MS);
        });
      },
      SECURITY_SETTINGS_CARD_COPY.signOutAllSuccess,
    );
  };

  const providerLabel = displaySecuritySettingsCardValue(
    authProvider,
    SECURITY_SETTINGS_CARD_COPY.notAvailable,
  );
  const sessionLabel = displaySecuritySettingsCardValue(
    currentSession,
    SECURITY_SETTINGS_CARD_COPY.notAvailable,
  );
  const lastActiveLabel = displaySecuritySettingsCardValue(
    lastActive,
    SECURITY_SETTINGS_CARD_COPY.notAvailable,
  );
  const location =
    locationLabel != null && locationLabel.trim().length > 0
      ? locationLabel.trim()
      : null;

  return (
    <section
      className={cn(
        "flex w-full flex-col gap-lg rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg",
        className,
      )}
      aria-busy={processing || undefined}
      aria-labelledby="security-settings-card-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-md">
        <h3
          id="security-settings-card-title"
          className="text-h4 font-semibold text-foreground"
        >
          {SECURITY_SETTINGS_CARD_COPY.title}
        </h3>
        {state === "success" ? (
          <Caption className="text-success" role="status">
            {errorKind === "signOutAll"
              ? SECURITY_SETTINGS_CARD_COPY.signOutAllSuccess
              : SECURITY_SETTINGS_CARD_COPY.signOutSuccess}
          </Caption>
        ) : processing ? (
          <Caption className="text-muted-foreground" role="status">
            {SECURITY_SETTINGS_CARD_COPY.processing}
          </Caption>
        ) : null}
      </div>

      {isError ? (
        <div
          className="flex flex-col gap-md rounded-md border border-border p-md"
          role="alert"
        >
          <BodySmall className="text-foreground">
            {errorKind === "signOutAll"
              ? SECURITY_SETTINGS_CARD_COPY.signOutAllError
              : SECURITY_SETTINGS_CARD_COPY.signOutError}
          </BodySmall>
          <div className="flex flex-col gap-sm sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setState("default");
                onRetry?.();
              }}
            >
              {SECURITY_SETTINGS_CARD_COPY.retry}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-md">
            <Readout
              label={SECURITY_SETTINGS_CARD_COPY.authProvider}
              value={providerLabel}
            />

            <div className="flex flex-col gap-sm rounded-md border border-border p-md">
              <Caption className="font-semibold text-foreground">
                {SECURITY_SETTINGS_CARD_COPY.currentSession}
              </Caption>
              <BodySmall className="text-foreground">{sessionLabel}</BodySmall>
              <div className="flex flex-col gap-sm sm:flex-row sm:gap-lg">
                <Readout
                  label={SECURITY_SETTINGS_CARD_COPY.lastActive}
                  value={lastActiveLabel}
                />
                {location ? (
                  <Readout
                    label={SECURITY_SETTINGS_CARD_COPY.location}
                    value={location}
                  />
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-sm border-t border-border pt-lg sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              fullWidth
              className="sm:w-auto"
              disabled={processing || confirmOpen}
              isLoading={processing && errorKind === "signOut"}
              onClick={handleSignOut}
            >
              {SECURITY_SETTINGS_CARD_COPY.signOut}
            </Button>
            <Button
              type="button"
              variant="ghost"
              fullWidth
              className="sm:w-auto"
              disabled={processing || logoutOpen}
              onClick={openSignOutAllConfirm}
            >
              {SECURITY_SETTINGS_CARD_COPY.signOutAll}
            </Button>
          </div>
        </>
      )}

      <LogoutConfirmDialog
        open={logoutOpen}
        onOpenChange={(open) => {
          if (processing) return;
          setLogoutOpen(open);
        }}
        onConfirm={handleLogoutConfirm}
      />

      <Modal
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open) closeConfirm();
        }}
        variant="warning"
        size="sm"
        title={SECURITY_SETTINGS_CARD_COPY.confirmTitle}
        description={SECURITY_SETTINGS_CARD_COPY.confirmDescription}
        showCloseButton={!processing}
        preventDismiss={processing}
        footer={
          <div className="flex w-full flex-col-reverse gap-sm sm:flex-row sm:justify-end">
            <Button
              ref={cancelRef}
              type="button"
              variant="outline"
              disabled={processing}
              onClick={closeConfirm}
            >
              {SECURITY_SETTINGS_CARD_COPY.cancel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              isLoading={processing}
              disabled={processing}
              onClick={confirmSignOutAll}
            >
              {processing
                ? SECURITY_SETTINGS_CARD_COPY.processing
                : SECURITY_SETTINGS_CARD_COPY.confirmAction}
            </Button>
          </div>
        }
      />
    </section>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-sm">
      <Caption className="font-semibold text-foreground">{label}</Caption>
      <BodySmall className="text-foreground">{value}</BodySmall>
    </div>
  );
}
