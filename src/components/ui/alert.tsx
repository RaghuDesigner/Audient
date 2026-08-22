import * as React from "react";
import { AlertCircle, Info, WifiOff } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/cn";

const alertVariants = cva(
  [
    "relative flex w-full gap-sm rounded-md border px-md py-sm",
    "text-body-sm",
  ].join(" "),
  {
    variants: {
      variant: {
        error:
          "border-destructive/40 bg-destructive/5 text-destructive",
        warning: "border-warning/40 bg-warning/5 text-foreground",
        info: "border-border bg-muted text-foreground",
        offline: "border-border bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "error",
    },
  },
);

export type AlertProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants> & {
    /** Assertive for errors (LOGIN_SCREEN §18 / WCAG). */
    assertive?: boolean;
  };

/**
 * Inline alert — preferred for ERR-AUTH feedback inside MDL-001.
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = "error",
      assertive = variant === "error",
      children,
      ...props
    },
    ref,
  ) => {
    const Icon =
      variant === "offline"
        ? WifiOff
        : variant === "info"
          ? Info
          : AlertCircle;

    return (
      <div
        ref={ref}
        role={assertive ? "alert" : "status"}
        aria-live={assertive ? "assertive" : "polite"}
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    );
  },
);
Alert.displayName = "Alert";
