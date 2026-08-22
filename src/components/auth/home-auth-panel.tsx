"use client";

import Link from "next/link";
import * as React from "react";

import { LoginModal } from "@/components/auth/LoginModal";
import { Button } from "@/components/ui/button";
import { BodyMedium, Caption, H1 } from "@/components/ui/typography";
import { AUTH_ROUTES } from "@/config/auth";
import { useAuth } from "@/hooks/use-auth";

/**
 * Landing auth chrome — guest browsing + login entry (SCREEN-001/002).
 * Full audit UI lands later; this proves guest mode and session wiring.
 */
export function HomeAuthPanel() {
  const { user, isGuest, isLoading, isAuthenticated, signOut } = useAuth();
  const [loginOpen, setLoginOpen] = React.useState(false);

  if (isLoading) {
    return (
      <Caption className="text-muted-foreground" aria-live="polite">
        Checking session…
      </Caption>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex flex-col items-center gap-md">
        <BodyMedium>
          Signed in as {user.email ?? user.fullName ?? "member"}
        </BodyMedium>
        <div className="flex flex-wrap items-center justify-center gap-sm">
          <Button asChild variant="primary">
            <Link href="/dashboard">Open dashboard</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void signOut()}
          >
            Log out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-md">
      <Caption>You are browsing as a guest</Caption>
      <div className="flex flex-wrap items-center justify-center gap-sm">
        <Button type="button" variant="primary" onClick={() => setLoginOpen(true)}>
          Log in
        </Button>
        <Button asChild variant="outline">
          <Link href={AUTH_ROUTES.signIn}>Sign-in page</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/dashboard">Try protected route</Link>
        </Button>
      </div>
      {isGuest ? (
        <LoginModal
          open={loginOpen}
          onOpenChange={setLoginOpen}
          nextPath="/"
          source="guest_menu"
        />
      ) : null}
    </div>
  );
}

export function HomeHero() {
  return (
    <header className="flex flex-col items-center gap-sm text-center">
      <H1>Audient</H1>
      <BodyMedium className="max-w-md text-muted-foreground">
        AI-powered UX audits. Guests can explore; sign in to unlock your
        dashboard and credits.
      </BodyMedium>
    </header>
  );
}
