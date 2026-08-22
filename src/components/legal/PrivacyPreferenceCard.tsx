"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { BodySmall, Caption, H2 } from "@/components/ui/typography";
import {
  PRIVACY_PREFERENCE_CARD_COPY,
  PRIVACY_PREFERENCE_CARD_DESCRIPTIONS,
  PRIVACY_PREFERENCE_CARD_LABELS,
  PRIVACY_PREFERENCE_CARD_TOGGLE_KEYS,
  type PrivacyPreferenceCardToggleKey,
} from "@/config/privacy-preference-card";
import { LEGAL_PRIVACY_COPY } from "@/config/legal-privacy-screen";
import { legalPrivacyAnalytics } from "@/lib/analytics/legal-privacy-events";
import {
  mergePrivacyPreferenceCardValues,
  pickPrivacyPreferenceCardValues,
  privacyPreferenceCardStateLabel,
  toLegalPreferenceKey,
  type PrivacyPreferenceCardValues,
} from "@/utils/privacy-preference-card";
import {
  cloneLegalPrivacyPreferences,
  legalPrivacySectionId,
  readLegalPrivacyPreferencesFromStorage,
  writeLegalPrivacyPreferencesToStorage,
  type LegalPrivacyPreferences,
} from "@/utils/legal-privacy-screen";
import { cn } from "@/utils/cn";

export type PrivacyPreferenceCardProps = {
  preferences: LegalPrivacyPreferences;
  descriptions?: Partial<
    Record<"essential" | PrivacyPreferenceCardToggleKey, string>
  >;
  isGuest?: boolean;
  disabled?: boolean;
  className?: string;
  onChange?: (key: PrivacyPreferenceCardToggleKey, enabled: boolean) => void;
  onSave?: (preferences: LegalPrivacyPreferences) => void | Promise<void>;
  onPreferencesChange?: (preferences: LegalPrivacyPreferences) => void;
};

/**
 * COMPONENT-069 — Privacy Preference Card.
 * Essential (always on) + Analytics + Product Communications — mock localStorage only.
 */
export function PrivacyPreferenceCard({
  preferences,
  descriptions,
  isGuest = true,
  disabled = false,
  className,
  onChange,
  onSave,
  onPreferencesChange,
}: PrivacyPreferenceCardProps) {
  const sectionId = legalPrivacySectionId("preferences");
  const viewed = React.useRef(false);
  const [basePrefs, setBasePrefs] = React.useState<LegalPrivacyPreferences>(
    () => cloneLegalPrivacyPreferences(preferences),
  );
  const [draft, setDraft] = React.useState<PrivacyPreferenceCardValues>(() =>
    pickPrivacyPreferenceCardValues(preferences),
  );
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setBasePrefs(cloneLegalPrivacyPreferences(preferences));
    setDraft(pickPrivacyPreferenceCardValues(preferences));
  }, [preferences]);

  React.useEffect(() => {
    const stored = readLegalPrivacyPreferencesFromStorage();
    if (!stored) return;
    setBasePrefs(stored);
    setDraft(pickPrivacyPreferenceCardValues(stored));
    onPreferencesChange?.(stored);
  }, [onPreferencesChange]);

  React.useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    legalPrivacyAnalytics.preferencesViewed({ isGuest });
  }, [isGuest]);

  const controlsDisabled = disabled || saving;

  const handleToggle = (key: PrivacyPreferenceCardToggleKey, checked: boolean) => {
    setDraft((prev) => {
      const next = { ...prev, [key]: checked };
      legalPrivacyAnalytics.preferenceChanged({
        preferenceKey: toLegalPreferenceKey(key),
        value: checked,
      });
      onChange?.(key, checked);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const merged = mergePrivacyPreferenceCardValues(basePrefs, draft);
    writeLegalPrivacyPreferencesToStorage(merged);
    setBasePrefs(merged);
    onPreferencesChange?.(merged);
    await onSave?.(merged);
    await new Promise((resolve) =>
      setTimeout(resolve, PRIVACY_PREFERENCE_CARD_COPY.saveDelayMs),
    );
    setSaving(false);
    toast.success(LEGAL_PRIVACY_COPY.preferencesSaved);
  };

  const essentialDescription =
    descriptions?.essential ?? PRIVACY_PREFERENCE_CARD_DESCRIPTIONS.essential;

  return (
    <Card
      id={sectionId}
      variant="default"
      padding="lg"
      className={className}
      aria-labelledby={`${sectionId}-title`}
      aria-busy={saving || undefined}
      tabIndex={-1}
    >
      <CardContent className="gap-md">
        <header className="flex flex-col gap-sm">
          <H2 id={`${sectionId}-title`}>
            {LEGAL_PRIVACY_COPY.privacyPreferencesTitle}
          </H2>
          <BodySmall className="text-muted-foreground">
            {LEGAL_PRIVACY_COPY.privacyPreferencesDescription}
          </BodySmall>
        </header>

        <ul className="m-0 flex list-none flex-col gap-md p-0">
          <li className="flex min-h-11 flex-col gap-sm border-b border-border pb-md sm:flex-row sm:items-center sm:justify-between sm:gap-md">
            <div className="min-w-0 flex-1">
              <Caption
                id="privacy-pref-label-essential"
                className="font-semibold text-foreground"
              >
                {PRIVACY_PREFERENCE_CARD_LABELS.essential}
              </Caption>
              <BodySmall
                id="privacy-pref-desc-essential"
                className="mt-sm text-muted-foreground"
              >
                {essentialDescription}
              </BodySmall>
            </div>
            <Caption
              id="privacy-pref-state-essential"
              className="shrink-0 font-semibold text-foreground"
            >
              {PRIVACY_PREFERENCE_CARD_COPY.essentialState}
            </Caption>
          </li>

          {PRIVACY_PREFERENCE_CARD_TOGGLE_KEYS.map((key) => {
            const labelId = `privacy-pref-label-${key}`;
            const descId = `privacy-pref-desc-${key}`;
            const stateId = `privacy-pref-state-${key}`;
            const checked = draft[key];
            const stateLabel = privacyPreferenceCardStateLabel(checked);

            return (
              <li
                key={key}
                className={cn(
                  "flex min-h-11 flex-col gap-sm border-b border-border pb-md last:border-0 last:pb-0",
                  "sm:flex-row sm:items-center sm:justify-between sm:gap-md",
                )}
              >
                <div className="min-w-0 flex-1">
                  <Caption id={labelId} className="font-semibold text-foreground">
                    {PRIVACY_PREFERENCE_CARD_LABELS[key]}
                  </Caption>
                  <BodySmall id={descId} className="mt-sm text-muted-foreground">
                    {descriptions?.[key] ??
                      PRIVACY_PREFERENCE_CARD_DESCRIPTIONS[key]}
                  </BodySmall>
                </div>
                <div className="flex shrink-0 items-center justify-end gap-sm self-end sm:self-auto">
                  <Caption id={stateId} className="text-muted-foreground">
                    {stateLabel}
                  </Caption>
                  <Switch
                    checked={checked}
                    disabled={controlsDisabled}
                    aria-labelledby={labelId}
                    aria-describedby={`${descId} ${stateId}`}
                    onCheckedChange={(next) => handleToggle(key, next)}
                  />
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex justify-end">
          <Button
            type="button"
            disabled={controlsDisabled}
            onClick={() => void handleSave()}
          >
            {LEGAL_PRIVACY_COPY.savePreferences}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
