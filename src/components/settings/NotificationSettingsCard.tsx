"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  NOTIFICATION_SETTINGS_CARD_COPY,
  NOTIFICATION_SETTINGS_CARD_DESCRIPTIONS,
  NOTIFICATION_SETTINGS_CARD_LABELS,
  NOTIFICATION_SETTINGS_CARD_SAVE_DELAY_MS,
  NOTIFICATION_SETTINGS_CARD_SAVED_FLASH_MS,
  NOTIFICATION_SETTINGS_CARD_TYPES,
  type NotificationSettingsCardState,
  type NotificationSettingsCardType,
} from "@/config/notification-settings-card";
import { notificationSettingsCardAnalytics } from "@/lib/analytics/notification-settings-card-events";
import {
  applyNotificationSettingsCardToggle,
  cloneNotificationSettingsCardPrefs,
  type NotificationSettingsCardPrefs,
} from "@/utils/notification-settings-card";
import { cn } from "@/utils/cn";

export type NotificationSettingsCardProps = {
  preferences: NotificationSettingsCardPrefs;
  descriptions?: Partial<
    Record<NotificationSettingsCardType, string>
  >;
  /** External override; omit for internal state machine. */
  state?: NotificationSettingsCardState;
  disabled?: boolean;
  /**
   * When false, toggles only call `onChange` — parent owns Save/Cancel.
   * Default true (standalone card auto-persists mock prefs).
   */
  autoSave?: boolean;
  onChange: (
    type: NotificationSettingsCardType,
    enabled: boolean,
  ) => void;
  /** Persist full prefs map (mock). Optional — card still shows saving/saved. */
  onSave?: (
    preferences: NotificationSettingsCardPrefs,
  ) => void | Promise<void>;
  onRetry?: () => void;
  className?: string;
};

/**
 * COMPONENT-046 — Notification Settings Card.
 * Seven accessible toggles — mock prefs only; no notification backend.
 */
export function NotificationSettingsCard({
  preferences,
  descriptions,
  state: stateProp,
  disabled = false,
  autoSave = true,
  onChange,
  onSave,
  onRetry,
  className,
}: NotificationSettingsCardProps) {
  const viewed = React.useRef(false);
  const savedTimer = React.useRef<number | null>(null);
  const saveSeq = React.useRef(0);

  const [internalState, setInternalState] =
    React.useState<NotificationSettingsCardState>("default");
  const [draft, setDraft] = React.useState(() =>
    cloneNotificationSettingsCardPrefs(preferences),
  );

  const state = stateProp ?? internalState;
  const isControlled = stateProp != null;
  const setState = (next: NotificationSettingsCardState) => {
    if (!isControlled) setInternalState(next);
  };

  const saving = state === "saving";
  const isError = state === "error";
  const controlsDisabled = disabled || saving || isError;

  React.useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    notificationSettingsCardAnalytics.viewed();
  }, []);

  React.useEffect(() => {
    if (saving) return;
    setDraft(cloneNotificationSettingsCardPrefs(preferences));
  }, [preferences, saving]);

  React.useEffect(() => {
    return () => {
      if (savedTimer.current != null) {
        window.clearTimeout(savedTimer.current);
      }
    };
  }, []);

  const flashSaved = () => {
    setState("saved");
    toast.success(NOTIFICATION_SETTINGS_CARD_COPY.saved);
    if (savedTimer.current != null) {
      window.clearTimeout(savedTimer.current);
    }
    savedTimer.current = window.setTimeout(() => {
      setState("default");
    }, NOTIFICATION_SETTINGS_CARD_SAVED_FLASH_MS);
  };

  const handleToggle = (
    type: NotificationSettingsCardType,
    enabled: boolean,
  ) => {
    if (controlsDisabled) return;
    if (draft[type] === enabled) return;

    const next = applyNotificationSettingsCardToggle(draft, type, enabled);
    setDraft(next);
    notificationSettingsCardAnalytics.preferenceChanged({ type, enabled });
    onChange(type, enabled);

    if (isControlled || !autoSave) return;

    const seq = ++saveSeq.current;
    setState("saving");

    void (async () => {
      try {
        if (onSave) {
          await onSave(next);
        } else {
          await new Promise<void>((resolve) => {
            window.setTimeout(
              resolve,
              NOTIFICATION_SETTINGS_CARD_SAVE_DELAY_MS,
            );
          });
        }
        if (seq !== saveSeq.current) return;
        flashSaved();
      } catch {
        if (seq !== saveSeq.current) return;
        setDraft(cloneNotificationSettingsCardPrefs(preferences));
        setState("error");
        toast.error(NOTIFICATION_SETTINGS_CARD_COPY.saveError);
      }
    })();
  };

  return (
    <section
      className={cn(
        "flex w-full flex-col gap-lg rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg",
        className,
      )}
      aria-busy={saving || undefined}
      aria-labelledby="notification-settings-card-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-md">
        <h3
          id="notification-settings-card-title"
          className="text-h4 font-semibold text-foreground"
        >
          {NOTIFICATION_SETTINGS_CARD_COPY.title}
        </h3>
        {state === "saved" ? (
          <Caption className="text-success" role="status">
            {NOTIFICATION_SETTINGS_CARD_COPY.saved}
          </Caption>
        ) : saving ? (
          <Caption className="text-muted-foreground" role="status">
            {NOTIFICATION_SETTINGS_CARD_COPY.saving}
          </Caption>
        ) : null}
      </div>

      {isError ? (
        <div
          className="flex flex-col gap-md rounded-md border border-border p-md"
          role="alert"
        >
          <BodySmall className="text-foreground">
            {NOTIFICATION_SETTINGS_CARD_COPY.saveError}
          </BodySmall>
          {onRetry ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setState("default");
                setDraft(cloneNotificationSettingsCardPrefs(preferences));
                onRetry();
              }}
            >
              {NOTIFICATION_SETTINGS_CARD_COPY.retry}
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          <BodySmall className="text-muted-foreground">
            {NOTIFICATION_SETTINGS_CARD_COPY.intro}
          </BodySmall>

          <ul className="m-0 flex list-none flex-col gap-md p-0">
            {NOTIFICATION_SETTINGS_CARD_TYPES.map((type) => {
              const labelId = `notification-pref-label-${type}`;
              const descId = `notification-pref-desc-${type}`;
              const stateId = `notification-pref-state-${type}`;
              const checked = draft[type];
              const description =
                descriptions?.[type] ??
                NOTIFICATION_SETTINGS_CARD_DESCRIPTIONS[type];

              return (
                <li
                  key={type}
                  className="flex min-h-11 flex-col gap-sm border-b border-border pb-md last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-md"
                >
                  <div className="min-w-0 flex-1">
                    <Caption
                      id={labelId}
                      className="font-semibold text-foreground"
                    >
                      {NOTIFICATION_SETTINGS_CARD_LABELS[type]}
                    </Caption>
                    <BodySmall
                      id={descId}
                      className="mt-sm text-muted-foreground"
                    >
                      {description}
                    </BodySmall>
                  </div>

                  <div className="flex shrink-0 items-center justify-end gap-sm self-end sm:self-auto">
                    <Caption
                      id={stateId}
                      className="text-muted-foreground"
                    >
                      {checked
                        ? NOTIFICATION_SETTINGS_CARD_COPY.enabled
                        : NOTIFICATION_SETTINGS_CARD_COPY.disabled}
                    </Caption>
                    <Switch
                      checked={checked}
                      disabled={controlsDisabled}
                      aria-labelledby={labelId}
                      aria-describedby={`${descId} ${stateId}`}
                      onCheckedChange={(next) => handleToggle(type, next)}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
