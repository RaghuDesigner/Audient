"use client";

import * as React from "react";

import { LoginModal } from "@/components/auth/LoginModal";
import type { SsoProvider } from "@/config/auth";
import type { LoginIntent, LoginModalSource } from "@/types/auth";

type OpenLoginOptions = {
  source?: LoginModalSource;
  intent?: LoginIntent;
  nextPath?: string;
};

type LoginModalControls = {
  open: boolean;
  source: LoginModalSource;
  intent?: LoginIntent;
  nextPath?: string;
  openLogin: (options?: OpenLoginOptions) => void;
  closeLogin: () => void;
};

const LoginModalContext = React.createContext<LoginModalControls | null>(null);

export type LoginModalProviderProps = {
  children: React.ReactNode;
  /** Called after placeholder OAuth succeeds. */
  onSuccess?: (provider: SsoProvider) => void;
};

/**
 * Mounts a single reusable `LoginModal` outside page sections.
 * Home / marketing CTAs call `openLogin()` — they never embed the modal.
 */
export function LoginModalProvider({
  children,
  onSuccess,
}: LoginModalProviderProps) {
  const [open, setOpen] = React.useState(false);
  const [source, setSource] = React.useState<LoginModalSource>("unknown");
  const [intent, setIntent] = React.useState<LoginIntent | undefined>();
  const [nextPath, setNextPath] = React.useState<string | undefined>("/");

  const openLogin = React.useCallback((options: OpenLoginOptions = {}) => {
    setSource(options.source ?? "marketing_cta");
    setIntent(options.intent);
    setNextPath(options.nextPath ?? "/");
    setOpen(true);
  }, []);

  const closeLogin = React.useCallback(() => {
    setOpen(false);
  }, []);

  const value = React.useMemo<LoginModalControls>(
    () => ({
      open,
      source,
      intent,
      nextPath,
      openLogin,
      closeLogin,
    }),
    [closeLogin, intent, nextPath, open, openLogin, source],
  );

  return (
    <LoginModalContext.Provider value={value}>
      {children}
      <LoginModal
        open={open}
        onOpenChange={setOpen}
        source={source}
        intent={intent}
        nextPath={nextPath}
        onSuccess={onSuccess}
      />
    </LoginModalContext.Provider>
  );
}

export function useLoginModalControls(): LoginModalControls {
  const context = React.useContext(LoginModalContext);
  if (!context) {
    throw new Error(
      "useLoginModalControls must be used within LoginModalProvider",
    );
  }
  return context;
}
