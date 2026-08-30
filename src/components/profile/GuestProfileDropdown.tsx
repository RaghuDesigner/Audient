"use client";

import * as React from "react";

import { Avatar } from "@/components/home/avatar";
import { DisabledMenuItem } from "@/components/profile/DisabledMenuItem";
import { MenuItem } from "@/components/profile/MenuItem";
import { guestMenuAnalytics } from "@/lib/analytics/guest-menu-events";
import { useAuth } from "@/hooks/use-auth";
import { useLoginModalControls } from "@/providers/login-modal-provider";
import { cn } from "@/utils/cn";

const DISABLED_ITEMS = [
  "Profile",
  "History",
  "Manage Plan",
  "Account Settings",
] as const;

export type GuestProfileDropdownProps = {
  className?: string;
};

/**
 * COMPONENT-001 / SCREEN-002 — Profile Dropdown.
 *
 * Guest:
 * - Login is enabled
 * - Profile / History / Manage Plan / Account Settings are disabled
 *
 * Authenticated:
 * - Shows signed-in email
 * - Dashboard / Profile / History / Manage Plan / Account Settings
 * - Logout
 */
export function GuestProfileDropdown({
  className,
}: GuestProfileDropdownProps) {
  const { user, isGuest, isAuthenticated, signOut } = useAuth();
  const { openLogin } = useLoginModalControls();

  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const loginRef = React.useRef<HTMLButtonElement>(null);
  const menuId = React.useId();
  const skipFocusRestore = React.useRef(false);

  const close = React.useCallback((reason: string, restoreFocus = true) => {
    setOpen((wasOpen) => {
      if (wasOpen) {
        guestMenuAnalytics.closed(reason);
      }
      return false;
    });

    if (restoreFocus && !skipFocusRestore.current) {
      queueMicrotask(() => triggerRef.current?.focus());
    }

    skipFocusRestore.current = false;
  }, []);

  const openMenu = React.useCallback(() => {
    setOpen(true);
    guestMenuAnalytics.opened();
  }, []);

  const toggle = React.useCallback(() => {
    if (open) {
      close("trigger");
    } else {
      openMenu();
    }
  }, [close, open, openMenu]);

  const handleLogin = React.useCallback(() => {
    guestMenuAnalytics.loginClicked();
    skipFocusRestore.current = true;
    close("login", false);
    openLogin({ source: "guest_menu", nextPath: "/dashboard" });
  }, [close, openLogin]);

  const handleLogout = React.useCallback(async () => {
    close("logout", false);
    await signOut();
  }, [close, signOut]);

  React.useEffect(() => {
    if (!open) return;

    if (isGuest) {
      loginRef.current?.focus();
    }

    const onPointerDown = (event: MouseEvent | PointerEvent) => {
      const target = event.target as Node | null;

      if (target && rootRef.current?.contains(target)) {
        return;
      }

      close("outside");
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close("escape");
        return;
      }

      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "Home" ||
        event.key === "End"
      ) {
        event.preventDefault();
        loginRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [close, isGuest, open]);

  const displayName = user?.email ?? user?.fullName ?? "member";

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <Avatar
        ref={triggerRef}
        label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={toggle}
      />

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className={cn(
            "absolute right-0 top-full z-dropdown mt-sm w-max whitespace-nowrap",
            "rounded-md border border-border bg-popover py-sm text-popover-foreground",
            "shadow-md",
          )}
        >
          {isAuthenticated && user ? (
            <>
              <div
                className={cn(
                  "px-md py-sm",
                  "border-b border-border",
                  "text-body-sm text-muted-foreground",
                )}
                role="menuitem"
                aria-disabled="true"
              >
                Signed in as
                <span className="block font-semibold text-foreground">
                  {displayName}
                </span>
              </div>

              <MenuItem onSelect={() => window.location.assign("/dashboard")}>
                Dashboard
              </MenuItem>

              <MenuItem onSelect={() => window.location.assign("/profile")}>
                Profile
              </MenuItem>

              <MenuItem onSelect={() => window.location.assign("/history")}>
                History
              </MenuItem>

              <MenuItem onSelect={() => window.location.assign("/billing")}>
                Manage Plan
              </MenuItem>

              <MenuItem onSelect={() => window.location.assign("/settings")}>
                Account Settings
              </MenuItem>

              <div className="my-sm border-t border-border" />

              <MenuItem
                onSelect={() => void handleLogout()}
                className="text-error"
              >
                Log out
              </MenuItem>
            </>
          ) : (
            <>
              <MenuItem ref={loginRef} onSelect={handleLogin}>
                Login
              </MenuItem>

              {DISABLED_ITEMS.map((label) => (
                <DisabledMenuItem key={label}>{label}</DisabledMenuItem>
              ))}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}