"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Footer } from "@/components/layout/footer";
import { SkipLink } from "@/components/layout/skip-link";
import { ConnectedAccountsCard } from "@/components/settings/ConnectedAccountsCard";
import { DangerZoneCard } from "@/components/settings/DangerZoneCard";
import { NotificationSettingsCard } from "@/components/settings/NotificationSettingsCard";
import { PreferencesCard } from "@/components/settings/PreferencesCard";
import { ProfileSettingsCard } from "@/components/settings/ProfileSettingsCard";
import { SaveChangesButton } from "@/components/settings/SaveChangesButton";
import { SecuritySettingsCard } from "@/components/settings/SecuritySettingsCard";
import { Button } from "@/components/ui/button";
import { inputShellVariants } from "@/components/ui/input-variants";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import { BodySmall, Caption, H1 } from "@/components/ui/typography";
import {
  SETTINGS_AUTH_PROVIDER_LABELS,
  SETTINGS_COPY,
  SETTINGS_DASHBOARD_ROUTE,
  SETTINGS_SECTION_LABELS,
  SETTINGS_SECTIONS,
  type SettingsScreenState,
  type SettingsSectionId,
} from "@/config/settings-screen";
import type { MockSettingsBundle } from "@/data/mock-settings-screen";
import { cloneMockSettingsBundle } from "@/data/mock-settings-screen";
import { useAuth } from "@/hooks/use-auth";
import { useMediaQuery } from "@/hooks/use-media-query";
import { settingsScreenAnalytics } from "@/lib/analytics/settings-screen-events";
import {
  useHeaderCredits,
  useHeaderPlanTier,
} from "@/hooks/use-app-state";
import { useTheme, type Theme } from "@/providers/theme-provider";
import type { NotificationSettingsCardPrefs } from "@/utils/notification-settings-card";
import {
  cloneNotificationSettingsCardPrefs,
  notificationSettingsCardPrefsEqual,
} from "@/utils/notification-settings-card";
import type { PreferencesCardValues } from "@/utils/preferences-card";
import type { ProfileSettingsValues } from "@/utils/profile-settings-card";
import { cn } from "@/utils/cn";

const selectClass = cn(
  inputShellVariants({ variant: "default", size: "md" }),
  "w-full cursor-pointer appearance-none bg-background",
);

export type SettingsScreenProps = {
  data: MockSettingsBundle;
  screenState: SettingsScreenState;
  onRetry?: () => void;
};

/**
 * SCREEN-019 — Settings.
 * Assembles reusable settings cards — mock only; no Supabase / no backend.
 */
export function SettingsScreen({
  data,
  screenState,
  onRetry,
}: SettingsScreenProps) {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { setTheme } = useTheme();
  const isLgUp = useMediaQuery("(min-width: 1024px)");
  const headerTier = useHeaderPlanTier();
  const headerCredits = useHeaderCredits();
  const viewed = React.useRef(false);
  const seenSections = React.useRef(new Set<SettingsSectionId>());

  const [saved, setSaved] = React.useState(() => cloneMockSettingsBundle(data));
  const [notifDraft, setNotifDraft] = React.useState(() =>
    cloneNotificationSettingsCardPrefs(data.notificationPrefs),
  );
  const [profileDirty, setProfileDirty] = React.useState(false);
  const [preferencesDirty, setPreferencesDirty] = React.useState(false);
  const [cardEpoch, setCardEpoch] = React.useState(0);
  const [section, setSection] = React.useState<SettingsSectionId>("profile");
  const [unsavedOpen, setUnsavedOpen] = React.useState(false);
  const [pendingHref, setPendingHref] = React.useState<string | null>(null);
  const [pendingSection, setPendingSection] =
    React.useState<SettingsSectionId | null>(null);

  const loading = screenState === "loading";
  const isError = screenState === "error";
  const notificationsDirty = !notificationSettingsCardPrefsEqual(
    notifDraft,
    saved.notificationPrefs,
  );
  const dirty = profileDirty || preferencesDirty || notificationsDirty;
  const showGlobalSave = section === "notifications";

  React.useEffect(() => {
    setSaved(cloneMockSettingsBundle(data));
    setNotifDraft(
      cloneNotificationSettingsCardPrefs(data.notificationPrefs),
    );
    setProfileDirty(false);
    setPreferencesDirty(false);
    setCardEpoch((n) => n + 1);
  }, [data]);

  React.useEffect(() => {
    if (viewed.current || loading || isError) return;
    viewed.current = true;
    settingsScreenAnalytics.viewed();
  }, [isError, loading]);

  React.useEffect(() => {
    if (loading || isError) return;
    if (seenSections.current.has(section)) return;
    seenSections.current.add(section);
    settingsScreenAnalytics.sectionViewed(section);
  }, [isError, loading, section]);

  React.useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const requestNavigate = (href: string) => {
    if (!dirty) {
      router.push(href);
      return;
    }
    setPendingHref(href);
    setPendingSection(null);
    setUnsavedOpen(true);
  };

  const requestSection = (next: SettingsSectionId) => {
    if (next === section) return;
    if (!dirty) {
      setSection(next);
      return;
    }
    setPendingSection(next);
    setPendingHref(null);
    setUnsavedOpen(true);
  };

  const discardAndContinue = () => {
    setNotifDraft(
      cloneNotificationSettingsCardPrefs(saved.notificationPrefs),
    );
    setProfileDirty(false);
    setPreferencesDirty(false);
    setCardEpoch((n) => n + 1);
    setUnsavedOpen(false);
    if (pendingSection) {
      setSection(pendingSection);
      setPendingSection(null);
    }
    if (pendingHref) {
      const href = pendingHref;
      setPendingHref(null);
      router.push(href);
    }
  };

  const stayOnPage = () => {
    setUnsavedOpen(false);
    setPendingHref(null);
    setPendingSection(null);
  };

  const handleCancel = () => {
    setNotifDraft(
      cloneNotificationSettingsCardPrefs(saved.notificationPrefs),
    );
    setCardEpoch((n) => n + 1);
    setProfileDirty(false);
    setPreferencesDirty(false);
  };

  const handleSaveNotifications = async () => {
    setSaved((prev) => ({
      ...prev,
      notificationPrefs: cloneNotificationSettingsCardPrefs(notifDraft),
    }));
    settingsScreenAnalytics.notificationPreferencesUpdated();
  };

  const handleProfileSave = async (values: ProfileSettingsValues) => {
    setSaved((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        fullName: values.fullName,
        email: prev.profile.email,
        companyName: values.company,
        role: values.role,
        avatarUrl: values.avatarUrl,
      },
    }));
    setProfileDirty(false);
    settingsScreenAnalytics.profileUpdated();
  };

  const handlePreferencesSave = async (values: PreferencesCardValues) => {
    setSaved((prev) => ({
      ...prev,
      preferences: { ...values },
    }));
    setTheme(values.appearance as Theme);
    setPreferencesDirty(false);
    settingsScreenAnalytics.preferencesUpdated();
  };

  const handleNotificationChange = (
    type: keyof NotificationSettingsCardPrefs,
    enabled: boolean,
  ) => {
    setNotifDraft((prev) => ({ ...prev, [type]: enabled }));
  };

  const handleSignOut = () => {
    settingsScreenAnalytics.signOutClicked();
    void signOut();
  };

  const handleSignOutAll = async () => {
    await signOut();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SkipLink />
      <DashboardHeader
        credits={headerCredits}
        displayName={user?.fullName ?? null}
        tier={headerTier}
        profileNavigation={{
          onAction: (action) => {
            if (action === "logout") {
              settingsScreenAnalytics.signOutClicked();
            }
          },
        }}
      />
      <main
        id="main-content"
        className={cn(
          "mx-auto flex w-full max-w-6xl flex-1 flex-col gap-lg",
          "px-md py-lg lg:px-lg",
        )}
        aria-busy={loading || undefined}
      >
        <nav aria-label="Breadcrumb" className="w-full">
          <ol className="m-0 flex list-none flex-wrap items-center gap-sm p-0 text-body-sm text-muted-foreground">
            <li className="inline-flex items-center gap-sm">
              <button
                type="button"
                className={cn(
                  "rounded-sm underline-offset-4 transition-colors duration-fast",
                  "hover:text-foreground hover:underline",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
                onClick={() => requestNavigate(SETTINGS_DASHBOARD_ROUTE)}
              >
                {SETTINGS_COPY.breadcrumbDashboard}
              </button>
            </li>
            <li className="inline-flex items-center gap-sm">
              <ChevronRight className="size-4 shrink-0 opacity-60" aria-hidden />
              <span
                className="font-semibold text-foreground"
                aria-current="page"
              >
                {SETTINGS_COPY.breadcrumbCurrent}
              </span>
            </li>
          </ol>
        </nav>
        <H1 className="text-foreground">{SETTINGS_COPY.pageTitle}</H1>

        {isError ? (
          <section
            className="flex flex-col items-center gap-md rounded-md border border-border bg-surface p-lg text-center"
            role="alert"
          >
            <BodySmall className="text-foreground">
              {SETTINGS_COPY.loadError}
            </BodySmall>
            <div className="flex w-full flex-col gap-sm sm:w-auto sm:flex-row">
              {onRetry ? (
                <Button
                  type="button"
                  variant="primary"
                  className="text-primary-foreground"
                  onClick={onRetry}
                >
                  {SETTINGS_COPY.retry}
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(SETTINGS_DASHBOARD_ROUTE)}
              >
                {SETTINGS_COPY.back}
              </Button>
            </div>
          </section>
        ) : null}

        {loading ? (
          <div className="grid gap-lg lg:grid-cols-[14rem_1fr]">
            <div className="h-48 animate-pulse rounded-md bg-muted" />
            <div className="flex flex-col gap-md">
              <div className="h-40 animate-pulse rounded-md bg-muted" />
              <div className="h-40 animate-pulse rounded-md bg-muted" />
            </div>
          </div>
        ) : null}

        {!loading && !isError ? (
          <div className="grid gap-lg lg:grid-cols-[14rem_minmax(0,1fr)]">
            {isLgUp ? (
              <nav aria-label={SETTINGS_COPY.sectionNavLabel}>
                <ul className="m-0 flex list-none flex-col gap-sm p-0">
                  {SETTINGS_SECTIONS.map((id) => (
                    <li key={id}>
                      <button
                        type="button"
                        aria-current={section === id ? "page" : undefined}
                        className={cn(
                          "min-h-11 w-full rounded-md px-md py-sm text-left text-body-sm font-medium",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          section === id
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted/50",
                        )}
                        onClick={() => requestSection(id)}
                      >
                        {SETTINGS_SECTION_LABELS[id]}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : (
              <div className="flex flex-col gap-sm">
                <Caption
                  id="settings-section-select-label"
                  className="font-semibold text-foreground"
                >
                  {SETTINGS_COPY.sectionNavLabel}
                </Caption>
                <select
                  className={selectClass}
                  aria-labelledby="settings-section-select-label"
                  value={section}
                  onChange={(e) =>
                    requestSection(e.target.value as SettingsSectionId)
                  }
                >
                  {SETTINGS_SECTIONS.map((id) => (
                    <option key={id} value={id}>
                      {SETTINGS_SECTION_LABELS[id]}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex min-w-0 flex-col gap-lg">
              {section === "profile" ? (
                <ProfileSettingsCard
                  key={`profile-${cardEpoch}`}
                  fullName={saved.profile.fullName}
                  email={saved.profile.email}
                  company={saved.profile.companyName}
                  role={saved.profile.role}
                  avatarUrl={saved.profile.avatarUrl}
                  onDirtyChange={setProfileDirty}
                  onSave={handleProfileSave}
                />
              ) : null}

              {section === "preferences" ? (
                <PreferencesCard
                  key={`preferences-${cardEpoch}`}
                  language={saved.preferences.language}
                  timezone={saved.preferences.timezone}
                  appearance={saved.preferences.appearance}
                  dateFormat={saved.preferences.dateFormat}
                  onDirtyChange={setPreferencesDirty}
                  onSave={handlePreferencesSave}
                />
              ) : null}

              {section === "notifications" ? (
                <NotificationSettingsCard
                  key={`notifications-${cardEpoch}`}
                  preferences={notifDraft}
                  autoSave={false}
                  onChange={handleNotificationChange}
                />
              ) : null}

              {section === "security" ? (
                <SecuritySettingsCard
                  authProvider={
                    SETTINGS_AUTH_PROVIDER_LABELS[saved.authProvider]
                  }
                  currentSession={saved.session.deviceLabel}
                  lastActive={saved.session.lastActiveLabel}
                  locationLabel={saved.session.locationLabel}
                  onSignOut={handleSignOut}
                  onSignOutAllDevices={handleSignOutAll}
                />
              ) : null}

              {section === "connected" ? (
                <ConnectedAccountsCard accounts={saved.connected} />
              ) : null}

              {section === "danger" ? (
                <DangerZoneCard
                  onDeleteConfirm={async () => {
                    toast.success(SETTINGS_COPY.deleteScheduled);
                  }}
                />
              ) : null}

              {showGlobalSave ? (
                <div className="flex flex-col gap-sm border-t border-border pt-lg sm:flex-row sm:items-start sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    className="min-h-11 sm:w-auto"
                    disabled={!notificationsDirty}
                    onClick={handleCancel}
                  >
                    {SETTINGS_COPY.cancel}
                  </Button>
                  <SaveChangesButton
                    dirty={notificationsDirty}
                    fullWidth
                    onSave={handleSaveNotifications}
                  />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </main>
      <Footer />

      <Modal
        open={unsavedOpen}
        onOpenChange={(open) => {
          if (!open) stayOnPage();
        }}
        variant="confirmation"
        size="sm"
        title={SETTINGS_COPY.unsavedTitle}
        description={SETTINGS_COPY.unsavedDescription}
        footer={
          <div className="flex w-full flex-col-reverse gap-sm sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={stayOnPage}>
              {SETTINGS_COPY.unsavedStay}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={discardAndContinue}
            >
              {SETTINGS_COPY.unsavedDiscard}
            </Button>
          </div>
        }
      />
    </div>
  );
}
