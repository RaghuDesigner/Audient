"use client";

import * as React from "react";
import type { Session, User } from "@supabase/supabase-js";

import {
  AUTH_ROUTES,
  isSupabaseAuthClientEnabled,
  shouldUseMockOAuth,
  toSupabaseOAuthProvider,
  USE_MOCK_AUTH,
  type SsoProvider,
} from "@/config/auth";
import { mapAuthError } from "@/lib/auth/map-error";
import { mapSupabaseUser } from "@/lib/auth/map-user";
import {
  clearMockSession,
  createMockAuthUser,
  persistMockSession,
  readMockSession,
} from "@/lib/auth/mock-session";
import { clearMockMembership } from "@/lib/auth/mock-membership";
import { clearMockNotificationReadState } from "@/lib/notifications/mock-read-state";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  AuthPlanTier,
  AuthState,
  AuthUser,
  EmailAuthMode,
  LoginModalError,
} from "@/types/auth";
import { sanitizeAuthRedirect } from "@/utils/auth-redirect";
import { saveLoginIntent } from "@/utils/login-intent";

type SignInWithOAuthOptions = {
  provider: SsoProvider;
  next?: string;
  intentPayload?: string;
  /** Mock SSO only — Free · Pro · Business. Ignored for real OAuth. */
  planTier?: AuthPlanTier;
};

type SignInWithEmailOptions = {
  email: string;
  password: string;
  mode?: EmailAuthMode;
};

type AuthContextValue = {
  state: AuthState;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  signInWithOAuth: (
    options: SignInWithOAuthOptions,
  ) => Promise<{ error: LoginModalError | null }>;
  signInWithEmail: (
    options: SignInWithEmailOptions,
  ) => Promise<{ error: LoginModalError | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

function toAuthState(user: AuthUser | null): AuthState {
  if (user) {
    return { status: "authenticated", user, guestId: null };
  }
  return { status: "guest", user: null, guestId: null };
}

/**
 * Auth session provider.
 * Default: mock session when `USE_MOCK_AUTH`.
 * Controlled path: Google uses Supabase OAuth when
 * `NEXT_PUBLIC_REAL_OAUTH_DEV_PATH=true` without flipping mock off.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>({
    status: "loading",
    user: null,
    guestId: null,
  });

  const supabaseEnabled = isSupabaseAuthClientEnabled();
  const supabase = React.useMemo(
    () => (supabaseEnabled ? createSupabaseBrowserClient() : null),
    [supabaseEnabled],
  );

  const applyUser = React.useCallback((user: User | null) => {
    setState(toAuthState(user ? mapSupabaseUser(user) : null));
  }, []);

  React.useEffect(() => {
    let mounted = true;

    if (USE_MOCK_AUTH) {
      const mockUser = readMockSession();
      if (mockUser) {
        setState(toAuthState(mockUser));
        return;
      }
      if (!supabase) {
        setState(toAuthState(null));
        return;
      }
      // Hybrid: no mock session — hydrate from Supabase if present.
      void supabase.auth.getUser().then(({ data }) => {
        if (mounted) applyUser(data.user);
      });
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(
        (_event: string, session: Session | null) => {
          if (readMockSession()) return;
          applyUser(session?.user ?? null);
        },
      );
      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    if (!supabase) return;

    void supabase.auth.getUser().then(({ data }) => {
      if (mounted) applyUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        applyUser(session?.user ?? null);
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [applyUser, supabase]);

  const signInWithOAuth = React.useCallback(
    async ({
      provider,
      next,
      intentPayload,
      planTier,
    }: SignInWithOAuthOptions) => {
      const safeNext = sanitizeAuthRedirect(
        next ?? intentPayload ?? AUTH_ROUTES.afterLogin,
        AUTH_ROUTES.afterLogin,
      );

      saveLoginIntent({
        type: safeNext === "/" ? "home" : "deep_link",
        payload: safeNext,
      });

      if (shouldUseMockOAuth(provider)) {
        clearMockMembership();
        const mockUser = createMockAuthUser(provider, planTier ?? "FREE");
        persistMockSession(mockUser);
        setState(toAuthState(mockUser));
        return { error: null };
      }

      if (!supabase) {
        return {
          error: {
            code: "UNKNOWN" as const,
            message: "Auth client unavailable.",
            provider,
          },
        };
      }

      const redirectTo = new URL(AUTH_ROUTES.callback, window.location.origin);
      redirectTo.searchParams.set("next", safeNext);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: toSupabaseOAuthProvider(provider),
        options: {
          redirectTo: redirectTo.toString(),
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        return { error: mapAuthError(error, provider) };
      }

      return { error: null };
    },
    [supabase],
  );

  const signInWithEmail = React.useCallback(
    async ({ email, password, mode = "sign_in" }: SignInWithEmailOptions) => {
      if (USE_MOCK_AUTH && !supabase) {
        return {
          error: {
            code: "UNKNOWN" as const,
            message: "Email auth is disabled in mock mode. Use SSO buttons.",
            provider: "email" as const,
          },
        };
      }

      if (!supabase) {
        return {
          error: {
            code: "UNKNOWN" as const,
            message: "Auth client unavailable.",
            provider: "email" as const,
          },
        };
      }

      if (mode === "sign_up") {
        const emailRedirectTo = new URL(
          AUTH_ROUTES.callback,
          window.location.origin,
        ).toString();

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo },
        });

        if (error) {
          return { error: mapAuthError(error, "email") };
        }

        return { error: null };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: mapAuthError(error, "email") };
      }

      return { error: null };
    },
    [supabase],
  );

  const signOut = React.useCallback(async () => {
    clearMockSession();
    clearMockMembership();
    clearMockNotificationReadState();
    setState(toAuthState(null));

    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Server route still clears cookies.
      }
      window.location.assign(AUTH_ROUTES.signOut);
      return;
    }

    window.location.assign(AUTH_ROUTES.afterLogout);
  }, [supabase]);

  const refreshSession = React.useCallback(async () => {
    if (USE_MOCK_AUTH) {
      const mockUser = readMockSession();
      if (mockUser) {
        setState(toAuthState(mockUser));
        return;
      }
    }

    if (!supabase) {
      setState(toAuthState(null));
      return;
    }

    const { data, error } = await supabase.auth.refreshSession();
    if (!error) {
      applyUser(data.session?.user ?? null);
    }
  }, [applyUser, supabase]);

  const value = React.useMemo<AuthContextValue>(() => {
    const user = state.status === "authenticated" ? state.user : null;
    return {
      state,
      user,
      isAuthenticated: state.status === "authenticated",
      isGuest: state.status === "guest",
      isLoading: state.status === "loading",
      signInWithOAuth,
      signInWithEmail,
      signOut,
      refreshSession,
    };
  }, [refreshSession, signInWithEmail, signInWithOAuth, signOut, state]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
