"use client";

import * as React from "react";

import { Avatar } from "@/components/home/avatar";
import { DisabledMenuItem } from "@/components/profile/DisabledMenuItem";
import { MenuItem } from "@/components/profile/MenuItem";
import { guestMenuAnalytics } from "@/lib/analytics/guest-menu-events";
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
 * COMPONENT-001 / SCREEN-002 — Guest Profile Dropdown.
 * Avatar opens menu; Login closes menu and opens Login Modal.
 */
export function GuestProfileDropdown({ className }: GuestProfileDropdownProps) {
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

  React.useEffect(() => {
    if (!open) return;

    loginRef.current?.focus();

    const onPointerDown = (event: MouseEvent | PointerEvent) => {
      const target = event.target as Node | null;
      if (target && rootRef.current?.contains(target)) return;
      close("outside");
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close("escape");
        return;
      }
      // Only Login is enabled — keep focus on it for ArrowUp/Down/Home/End
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
  }, [close, open]);

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
          <MenuItem ref={loginRef} onSelect={handleLogin}>
            Login
          </MenuItem>
          {DISABLED_ITEMS.map((label) => (
            <DisabledMenuItem key={label}>{label}</DisabledMenuItem>
          ))}
        </div>
      ) : null}
    </div>
  );
}
