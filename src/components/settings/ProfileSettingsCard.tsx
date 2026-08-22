"use client";

import * as React from "react";

import { UserAvatar } from "@/components/dashboard/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  PROFILE_SETTINGS_CARD_COPY,
  PROFILE_SETTINGS_NAME_MAX_LENGTH,
  PROFILE_SETTINGS_SAVED_FLASH_MS,
  type ProfileSettingsCardState,
} from "@/config/profile-settings-card";
import { profileSettingsCardAnalytics } from "@/lib/analytics/profile-settings-card-events";
import {
  displayOptionalProfileField,
  hasProfileSettingsFieldErrors,
  prepareProfileSettingsSave,
  profileSettingsValuesEqual,
  validateProfileSettingsValues,
  type ProfileSettingsFieldErrors,
  type ProfileSettingsValues,
} from "@/utils/profile-settings-card";
import { cn } from "@/utils/cn";

export type ProfileSettingsCardProps = {
  fullName: string;
  email: string;
  company?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
  /** External override; omit for internal state machine. */
  state?: ProfileSettingsCardState;
  onSave: (values: ProfileSettingsValues) => void | Promise<void>;
  /** Reports in-progress edits for parent unsaved-change guards. */
  onDirtyChange?: (dirty: boolean) => void;
  onChangePhoto?: () => void;
  onRetry?: () => void;
  className?: string;
};

/**
 * COMPONENT-044 — Profile Settings Card.
 * View / edit mock profile — email read-only; no Supabase.
 */
export function ProfileSettingsCard({
  fullName,
  email,
  company = null,
  role = null,
  avatarUrl = null,
  state: stateProp,
  onSave,
  onDirtyChange,
  onChangePhoto,
  onRetry,
  className,
}: ProfileSettingsCardProps) {
  const viewed = React.useRef(false);
  const savedTimer = React.useRef<number | null>(null);
  const dirtyReported = React.useRef(false);

  const savedValues = React.useMemo<ProfileSettingsValues>(
    () => ({
      fullName,
      email,
      company,
      role,
      avatarUrl,
    }),
    [avatarUrl, company, email, fullName, role],
  );

  const [internalState, setInternalState] =
    React.useState<ProfileSettingsCardState>("default");
  const [draft, setDraft] = React.useState<ProfileSettingsValues>(savedValues);
  const [errors, setErrors] = React.useState<ProfileSettingsFieldErrors>({});

  const state = stateProp ?? internalState;
  const isControlled = stateProp != null;
  const setState = (next: ProfileSettingsCardState) => {
    if (!isControlled) setInternalState(next);
  };

  const editing = state === "editing" || state === "saving";
  const saving = state === "saving";
  const isError = state === "error";

  React.useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    profileSettingsCardAnalytics.viewed();
  }, []);

  React.useEffect(() => {
    if (editing || saving) return;
    setDraft(savedValues);
    setErrors({});
  }, [editing, saving, savedValues]);

  React.useEffect(() => {
    return () => {
      if (savedTimer.current != null) {
        window.clearTimeout(savedTimer.current);
      }
    };
  }, []);

  const startEdit = () => {
    setDraft(savedValues);
    setErrors({});
    setState("editing");
    profileSettingsCardAnalytics.editStarted();
  };

  const cancelEdit = () => {
    if (saving) return;
    setDraft(savedValues);
    setErrors({});
    setState("default");
  };

  const saveEdit = async () => {
    if (saving) return;
    const nextErrors = validateProfileSettingsValues(draft);
    setErrors(nextErrors);
    if (hasProfileSettingsFieldErrors(nextErrors)) return;

    const prepared = prepareProfileSettingsSave(draft);
    setState("saving");
    try {
      await onSave(prepared);
      profileSettingsCardAnalytics.updated({
        hasCompany: prepared.company != null,
        hasRole: prepared.role != null,
      });
      toast.success(PROFILE_SETTINGS_CARD_COPY.saved);
      setState("saved");
      if (savedTimer.current != null) {
        window.clearTimeout(savedTimer.current);
      }
      savedTimer.current = window.setTimeout(() => {
        setState("default");
      }, PROFILE_SETTINGS_SAVED_FLASH_MS);
    } catch {
      setState("editing");
      toast.error(PROFILE_SETTINGS_CARD_COPY.saveError);
    }
  };

  const handlePhoto = () => {
    if (onChangePhoto) {
      onChangePhoto();
      return;
    }
    toast.info(PROFILE_SETTINGS_CARD_COPY.photoSoon);
  };

  const dirty = editing && !profileSettingsValuesEqual(draft, savedValues);

  React.useEffect(() => {
    if (!onDirtyChange) return;
    if (dirtyReported.current === dirty) return;
    dirtyReported.current = dirty;
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  React.useEffect(() => {
    return () => {
      if (onDirtyChange && dirtyReported.current) {
        onDirtyChange(false);
      }
    };
  }, [onDirtyChange]);

  return (
    <section
      className={cn(
        "flex w-full flex-col gap-lg rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg",
        className,
      )}
      aria-busy={saving || undefined}
      aria-labelledby="profile-settings-card-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-md">
        <h3
          id="profile-settings-card-title"
          className="text-h4 font-semibold text-foreground"
        >
          {PROFILE_SETTINGS_CARD_COPY.title}
        </h3>
        {state === "saved" ? (
          <Caption className="text-success" role="status">
            {PROFILE_SETTINGS_CARD_COPY.saved}
          </Caption>
        ) : null}
      </div>

      {isError ? (
        <div
          className="flex flex-col gap-md rounded-md border border-border p-md"
          role="alert"
        >
          <BodySmall className="text-foreground">
            {PROFILE_SETTINGS_CARD_COPY.loadError}
          </BodySmall>
          {onRetry ? (
            <Button type="button" variant="outline" onClick={onRetry}>
              {PROFILE_SETTINGS_CARD_COPY.retry}
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-lg sm:flex-row sm:items-start">
            <div className="flex flex-col items-start gap-sm">
              <UserAvatar
                displayName={editing ? draft.fullName : savedValues.fullName}
                avatarUrl={
                  editing ? draft.avatarUrl : savedValues.avatarUrl
                }
                size="lg"
              />
              <Caption className="font-semibold text-foreground">
                {PROFILE_SETTINGS_CARD_COPY.profilePhoto}
              </Caption>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={saving}
                onClick={handlePhoto}
              >
                {PROFILE_SETTINGS_CARD_COPY.changePhoto}
              </Button>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-md">
              {editing ? (
                <>
                  <Input
                    label={PROFILE_SETTINGS_CARD_COPY.fullName}
                    value={draft.fullName}
                    maxLength={PROFILE_SETTINGS_NAME_MAX_LENGTH}
                    errorMessage={errors.fullName}
                    required
                    disabled={saving}
                    autoComplete="name"
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    onBlur={() => {
                      setErrors(validateProfileSettingsValues(draft));
                    }}
                  />
                  <Input
                    label={PROFILE_SETTINGS_CARD_COPY.email}
                    value={draft.email}
                    readOnly
                    helperText={PROFILE_SETTINGS_CARD_COPY.emailReadOnlyHint}
                    autoComplete="email"
                  />
                  <Input
                    label={PROFILE_SETTINGS_CARD_COPY.company}
                    value={draft.company ?? ""}
                    placeholder={PROFILE_SETTINGS_CARD_COPY.notProvided}
                    disabled={saving}
                    autoComplete="organization"
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        company: e.target.value,
                      }))
                    }
                  />
                  <Input
                    label={PROFILE_SETTINGS_CARD_COPY.role}
                    value={draft.role ?? ""}
                    placeholder={PROFILE_SETTINGS_CARD_COPY.notProvided}
                    disabled={saving}
                    autoComplete="organization-title"
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        role: e.target.value,
                      }))
                    }
                  />
                </>
              ) : (
                <>
                  <Readout
                    label={PROFILE_SETTINGS_CARD_COPY.fullName}
                    value={savedValues.fullName}
                  />
                  <Readout
                    label={PROFILE_SETTINGS_CARD_COPY.email}
                    value={savedValues.email}
                    hint={PROFILE_SETTINGS_CARD_COPY.emailReadOnlyHint}
                  />
                  <Readout
                    label={PROFILE_SETTINGS_CARD_COPY.company}
                    value={displayOptionalProfileField(savedValues.company)}
                  />
                  <Readout
                    label={PROFILE_SETTINGS_CARD_COPY.role}
                    value={displayOptionalProfileField(savedValues.role)}
                  />
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-sm border-t border-border pt-lg sm:flex-row sm:justify-end">
            {editing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  fullWidth
                  className="sm:w-auto"
                  onClick={cancelEdit}
                >
                  {PROFILE_SETTINGS_CARD_COPY.cancel}
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  className="text-primary-foreground sm:w-auto"
                  fullWidth
                  isLoading={saving}
                  disabled={saving || !dirty}
                  onClick={() => void saveEdit()}
                >
                  {PROFILE_SETTINGS_CARD_COPY.save}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                fullWidth
                className="sm:w-auto"
                onClick={startEdit}
              >
                {PROFILE_SETTINGS_CARD_COPY.edit}
              </Button>
            )}
          </div>
        </>
      )}
    </section>
  );
}

function Readout({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-sm">
      <Caption className="font-semibold text-foreground">{label}</Caption>
      <BodySmall className="text-foreground">{value}</BodySmall>
      {hint ? (
        <Caption className="text-muted-foreground">{hint}</Caption>
      ) : null}
    </div>
  );
}
