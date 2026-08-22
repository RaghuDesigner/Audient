"use client";

import * as React from "react";

import { isMockAuthUserId } from "@/lib/account/is-mock-auth-user";
import { useAuth } from "@/hooks/use-auth";
import type { AccountSnapshot } from "@/types/account";
import type { AuthUser } from "@/types/auth";

type AccountContextValue = {
  account: AccountSnapshot | null;
  isLoading: boolean;
  error: string | null;
  /** Auth user with planTier hydrated from membership when available. */
  effectiveUser: AuthUser | null;
  refresh: () => void;
};

const AccountContext = React.createContext<AccountContextValue | null>(null);

/**
 * Hydrates real membership/credits for Supabase-authenticated users.
 * Mock auth users keep mock app state (no /api/me).
 */
export function AccountProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [account, setAccount] = React.useState<AccountSnapshot | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [revision, bump] = React.useReducer((n: number) => n + 1, 0);

  const shouldLoadReal =
    isAuthenticated &&
    Boolean(user) &&
    !isMockAuthUserId(user?.id) &&
    !authLoading;

  React.useEffect(() => {
    if (!shouldLoadReal || !user) {
      setAccount(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    void (async () => {
      try {
        const response = await fetch("/api/me", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          if (!cancelled) {
            setAccount(null);
            setError(body?.error ?? "Unable to load account");
          }
          return;
        }
        const body = (await response.json()) as { account: AccountSnapshot };
        if (!cancelled) {
          setAccount(body.account);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setAccount(null);
          setError("Unable to load account");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [revision, shouldLoadReal, user]);

  const effectiveUser = React.useMemo<AuthUser | null>(() => {
    if (!user) return null;
    if (!account) return user;
    return {
      ...user,
      email: account.email ?? user.email,
      fullName: account.displayName ?? user.fullName,
      avatarUrl: account.avatarUrl ?? user.avatarUrl,
      planTier: account.planTier,
    };
  }, [account, user]);

  const value = React.useMemo<AccountContextValue>(
    () => ({
      account,
      isLoading: shouldLoadReal ? isLoading : false,
      error,
      effectiveUser,
      refresh: bump,
    }),
    [account, effectiveUser, error, isLoading, shouldLoadReal],
  );

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
}

export function useAccount(): AccountContextValue {
  const ctx = React.useContext(AccountContext);
  if (!ctx) {
    throw new Error("useAccount must be used within AccountProvider");
  }
  return ctx;
}

/** Safe optional access when provider may be absent in isolated tests. */
export function useAccountOptional(): AccountContextValue | null {
  return React.useContext(AccountContext);
}
