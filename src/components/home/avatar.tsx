"use client";

import * as React from "react";
import { User } from "lucide-react";

import { cn } from "@/utils/cn";

export type AvatarProps = {
  onClick?: () => void;
  className?: string;
  /** Accessible name for the control. */
  label?: string;
  "aria-haspopup"?: React.AriaAttributes["aria-haspopup"];
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
};

/**
 * Guest avatar control (BTN-013) — opens Guest Profile Dropdown via parent.
 */
export const Avatar = React.forwardRef<HTMLButtonElement, AvatarProps>(
  (
    {
      onClick,
      className,
      label = "Account menu",
      "aria-haspopup": ariaHasPopup,
      "aria-expanded": ariaExpanded,
      "aria-controls": ariaControls,
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-haspopup={ariaHasPopup}
        aria-expanded={ariaExpanded}
        aria-controls={ariaControls}
        className={cn(
          "inline-flex size-11 shrink-0 items-center justify-center rounded-full",
          "bg-muted-foreground/80 text-primary-foreground",
          "transition-opacity duration-fast hover:opacity-90",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
      >
        <User className="size-5" aria-hidden />
      </button>
    );
  },
);
Avatar.displayName = "Avatar";
