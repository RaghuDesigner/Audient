"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { inputShellVariants } from "@/components/ui/input-variants";
import { toast } from "@/components/ui/toast";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  PREFERENCES_CARD_COPY,
  PREFERENCES_CARD_SAVED_FLASH_MS,
  type PreferencesCardField,
  type PreferencesCardState,
} from "@/config/preferences-card";
import {
  SETTINGS_APPEARANCE_LABELS,
  SETTINGS_APPEARANCE_OPTIONS,
  SETTINGS_DATE_FORMAT_LABELS,
  SETTINGS_DATE_FORMAT_OPTIONS,
  SETTINGS_LANGUAGE_LABELS,
  SETTINGS_LANGUAGE_OPTIONS,
  SETTINGS_TIMEZONE_OPTIONS,
  type SettingsAppearance,
  type SettingsDateFormat,
  type SettingsLanguage,
  type SettingsTimezone,
} from "@/config/settings-screen";
import { preferencesCardAnalytics } from "@/lib/analytics/preferences-card-events";
import { useTheme, type Theme } from "@/providers/theme-provider";
import {
  clonePreferencesCardValues,
  preferencesCardValuesEqual,
  type PreferencesCardValues,
} from "@/utils/preferences-card";
import { cn } from "@/utils/cn";

const selectClass = cn(
  inputShellVariants({ variant: "default", size: "md" }),
  "w-full cursor-pointer appearance-none bg-background",
);

export type PreferencesCardProps = {
  language: SettingsLanguage;
  timezone: SettingsTimezone;
  appearance: SettingsAppearance;
  dateFormat: SettingsDateFormat;
  /** External override; omit for internal state machine. */
  state?: PreferencesCardState;
  onSave: (values: PreferencesCardValues) => void | Promise<void>;
  /** Reports in-progress edits for parent unsaved-change guards. */
  onDirtyChange?: (dirty: boolean) => void;
  onRetry?: () => void;
  className?: string;
};

/**
 * COMPONENT-045 — Preferences Card.
 * Language / timezone / appearance / date format — mock + useTheme.
 */
export function PreferencesCard({
  language,
  timezone,
  appearance,
  dateFormat,
  state: stateProp,
  onSave,
  onDirtyChange,
  onRetry,
  className,
}: PreferencesCardProps) {
  const { setTheme } = useTheme();
  const viewed = React.useRef(false);
  const savedTimer = React.useRef<number | null>(null);
  const dirtyReported = React.useRef(false);

  const savedValues = React.useMemo<PreferencesCardValues>(
    () => ({ language, timezone, appearance, dateFormat }),
    [appearance, dateFormat, language, timezone],
  );

  const [internalState, setInternalState] =
    React.useState<PreferencesCardState>("default");
  const [draft, setDraft] = React.useState(() =>
    clonePreferencesCardValues(savedValues),
  );

  const state = stateProp ?? internalState;
  const isControlled = stateProp != null;
  const setState = (next: PreferencesCardState) => {
    if (!isControlled) setInternalState(next);
  };

  const editing = state === "editing" || state === "saving";
  const saving = state === "saving";
  const isError = state === "error";
  const dirty = editing && !preferencesCardValuesEqual(draft, savedValues);

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

  React.useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    preferencesCardAnalytics.viewed();
  }, []);

  React.useEffect(() => {
    if (editing || saving) return;
    setDraft(clonePreferencesCardValues(savedValues));
  }, [editing, saving, savedValues]);

  React.useEffect(() => {
    return () => {
      if (savedTimer.current != null) {
        window.clearTimeout(savedTimer.current);
      }
    };
  }, []);

  const updateField = <K extends PreferencesCardField>(
    field: K,
    value: PreferencesCardValues[K],
  ) => {
    setDraft((prev) => {
      if (prev[field] === value) return prev;
      preferencesCardAnalytics.preferenceChanged({
        preference: field,
        value: String(value),
      });
      return { ...prev, [field]: value };
    });
  };

  const startEdit = () => {
    setDraft(clonePreferencesCardValues(savedValues));
    setState("editing");
  };

  const cancelEdit = () => {
    if (saving) return;
    setDraft(clonePreferencesCardValues(savedValues));
    setState("default");
  };

  const saveEdit = async () => {
    if (saving || !dirty) return;
    const after = clonePreferencesCardValues(draft);
    setState("saving");
    try {
      await onSave(after);
      setTheme(after.appearance as Theme);
      toast.success(PREFERENCES_CARD_COPY.saved);
      setState("saved");
      if (savedTimer.current != null) {
        window.clearTimeout(savedTimer.current);
      }
      savedTimer.current = window.setTimeout(() => {
        setState("default");
      }, PREFERENCES_CARD_SAVED_FLASH_MS);
    } catch {
      setState("editing");
      toast.error(PREFERENCES_CARD_COPY.saveError);
    }
  };

  return (
    <section
      className={cn(
        "flex w-full flex-col gap-lg rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg",
        className,
      )}
      aria-busy={saving || undefined}
      aria-labelledby="preferences-card-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-md">
        <h3
          id="preferences-card-title"
          className="text-h4 font-semibold text-foreground"
        >
          {PREFERENCES_CARD_COPY.title}
        </h3>
        {state === "saved" ? (
          <Caption className="text-success" role="status">
            {PREFERENCES_CARD_COPY.saved}
          </Caption>
        ) : null}
      </div>

      {isError ? (
        <div
          className="flex flex-col gap-md rounded-md border border-border p-md"
          role="alert"
        >
          <BodySmall className="text-foreground">
            {PREFERENCES_CARD_COPY.loadError}
          </BodySmall>
          {onRetry ? (
            <Button type="button" variant="outline" onClick={onRetry}>
              {PREFERENCES_CARD_COPY.retry}
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="grid gap-md sm:grid-cols-2">
            {editing ? (
              <>
                <SelectLabeled
                  id="preferences-language"
                  label={PREFERENCES_CARD_COPY.language}
                  value={draft.language}
                  disabled={saving}
                  onChange={(v) =>
                    updateField("language", v as SettingsLanguage)
                  }
                >
                  {SETTINGS_LANGUAGE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {SETTINGS_LANGUAGE_LABELS[opt]}
                    </option>
                  ))}
                </SelectLabeled>
                <SelectLabeled
                  id="preferences-timezone"
                  label={PREFERENCES_CARD_COPY.timezone}
                  value={draft.timezone}
                  disabled={saving}
                  onChange={(v) =>
                    updateField("timezone", v as SettingsTimezone)
                  }
                >
                  {SETTINGS_TIMEZONE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </SelectLabeled>
                <SelectLabeled
                  id="preferences-appearance"
                  label={PREFERENCES_CARD_COPY.appearance}
                  value={draft.appearance}
                  disabled={saving}
                  onChange={(v) =>
                    updateField("appearance", v as SettingsAppearance)
                  }
                >
                  {SETTINGS_APPEARANCE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {SETTINGS_APPEARANCE_LABELS[opt]}
                    </option>
                  ))}
                </SelectLabeled>
                <SelectLabeled
                  id="preferences-date-format"
                  label={PREFERENCES_CARD_COPY.dateFormat}
                  value={draft.dateFormat}
                  disabled={saving}
                  onChange={(v) =>
                    updateField("dateFormat", v as SettingsDateFormat)
                  }
                >
                  {SETTINGS_DATE_FORMAT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {SETTINGS_DATE_FORMAT_LABELS[opt]}
                    </option>
                  ))}
                </SelectLabeled>
              </>
            ) : (
              <>
                <Readout
                  label={PREFERENCES_CARD_COPY.language}
                  value={SETTINGS_LANGUAGE_LABELS[savedValues.language]}
                />
                <Readout
                  label={PREFERENCES_CARD_COPY.timezone}
                  value={savedValues.timezone}
                />
                <Readout
                  label={PREFERENCES_CARD_COPY.appearance}
                  value={SETTINGS_APPEARANCE_LABELS[savedValues.appearance]}
                />
                <Readout
                  label={PREFERENCES_CARD_COPY.dateFormat}
                  value={SETTINGS_DATE_FORMAT_LABELS[savedValues.dateFormat]}
                />
              </>
            )}
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
                  {PREFERENCES_CARD_COPY.cancel}
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
                  {PREFERENCES_CARD_COPY.save}
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
                {PREFERENCES_CARD_COPY.edit}
              </Button>
            )}
          </div>
        </>
      )}
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

function SelectLabeled({
  id,
  label,
  value,
  disabled,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  const labelId = `${id}-label`;
  return (
    <div className="flex flex-col gap-sm">
      <Caption id={labelId} className="font-semibold text-foreground">
        {label}
      </Caption>
      <select
        id={id}
        className={selectClass}
        value={value}
        disabled={disabled}
        aria-labelledby={labelId}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    </div>
  );
}
