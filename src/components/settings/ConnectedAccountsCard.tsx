"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { BodySmall, Caption } from "@/components/ui/typography";
import { SSO_PROVIDER_ICONS } from "@/config/auth";
import {
  CONNECTED_ACCOUNTS_CARD_COPY,
  CONNECTED_ACCOUNTS_CARD_PROVIDER_LABELS,
  CONNECTED_ACCOUNTS_CARD_PROVIDERS,
  type ConnectedAccountsCardProvider,
} from "@/config/connected-accounts-card";
import { connectedAccountsCardAnalytics } from "@/lib/analytics/connected-accounts-card-events";
import {
  connectedAccountsCardActionForStatus,
  connectedAccountsCardActionLabel,
  connectedAccountsCardStatusLabel,
  type ConnectedAccountsCardAction,
  type ConnectedAccountsCardMap,
} from "@/utils/connected-accounts-card";
import { cn } from "@/utils/cn";

export type ConnectedAccountsCardProps = {
  accounts: ConnectedAccountsCardMap;
  loading?: boolean;
  /** Show Connect / Disconnect CTAs (mock only). Default true. */
  showActions?: boolean;
  onProviderAction?: (
    provider: ConnectedAccountsCardProvider,
    action: ConnectedAccountsCardAction,
  ) => void;
  className?: string;
};

/**
 * COMPONENT-048 — Connected Accounts Card.
 * Mock Google / Apple / Microsoft link status — no OAuth / no Supabase Auth.
 */
export function ConnectedAccountsCard({
  accounts,
  loading = false,
  showActions = true,
  onProviderAction,
  className,
}: ConnectedAccountsCardProps) {
  const viewed = React.useRef(false);

  React.useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    connectedAccountsCardAnalytics.viewed();
  }, []);

  const handleAction = (
    provider: ConnectedAccountsCardProvider,
    action: ConnectedAccountsCardAction,
  ) => {
    if (loading) return;
    connectedAccountsCardAnalytics.providerActionClicked({ provider, action });
    if (onProviderAction) {
      onProviderAction(provider, action);
      return;
    }
    toast.info(CONNECTED_ACCOUNTS_CARD_COPY.comingSoon);
  };

  return (
    <section
      className={cn(
        "flex w-full flex-col gap-lg rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg",
        className,
      )}
      aria-busy={loading || undefined}
      aria-labelledby="connected-accounts-card-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-md">
        <h3
          id="connected-accounts-card-title"
          className="text-h4 font-semibold text-foreground"
        >
          {CONNECTED_ACCOUNTS_CARD_COPY.title}
        </h3>
        {loading ? (
          <Caption className="text-muted-foreground" role="status">
            {CONNECTED_ACCOUNTS_CARD_COPY.loading}
          </Caption>
        ) : null}
      </div>

      <BodySmall className="text-muted-foreground">
        {CONNECTED_ACCOUNTS_CARD_COPY.intro}
      </BodySmall>

      <ul className="m-0 flex list-none flex-col gap-md p-0">
        {CONNECTED_ACCOUNTS_CARD_PROVIDERS.map((provider) => {
          const status = accounts[provider];
          const connected = status === "connected";
          const action = connectedAccountsCardActionForStatus(status);
          const name = CONNECTED_ACCOUNTS_CARD_PROVIDER_LABELS[provider];
          const statusText = connectedAccountsCardStatusLabel(status);
          const nameId = `connected-account-name-${provider}`;
          const statusId = `connected-account-status-${provider}`;

          return (
            <li
              key={provider}
              className="flex min-h-11 flex-col gap-sm rounded-md border border-border p-md sm:flex-row sm:items-center sm:justify-between sm:gap-md"
            >
              <div className="flex min-w-0 items-start gap-md">
                {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG */}
                <img
                  src={SSO_PROVIDER_ICONS[provider]}
                  alt=""
                  width={24}
                  height={24}
                  className="mt-0.5 size-6 shrink-0"
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <BodySmall
                    id={nameId}
                    className="font-semibold text-foreground"
                  >
                    {name}
                  </BodySmall>
                  <Caption
                    id={statusId}
                    className={cn(
                      "mt-sm",
                      connected ? "text-success" : "text-muted-foreground",
                    )}
                  >
                    {statusText}
                  </Caption>
                </div>
              </div>

              {showActions ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  fullWidth
                  className="min-h-11 sm:w-auto"
                  disabled={loading}
                  aria-labelledby={`${nameId} ${statusId}`}
                  onClick={() => handleAction(provider, action)}
                >
                  {connectedAccountsCardActionLabel(action)}
                </Button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
