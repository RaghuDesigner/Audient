"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";

import { BodySmall, H2 } from "@/components/ui/typography";
import { cn } from "@/utils/cn";

export type FailureMessageProps = {
  title: string;
  description: string;
  /** Optional calm refund confirmation (not a second error). */
  refundNote?: string | null;
  className?: string;
  headingRef?: React.Ref<HTMLHeadingElement>;
};

/**
 * SCREEN-003 failure copy — icon + title + description.
 * Assertive alert on mount for WCAG 2.2 AA.
 */
export function FailureMessage({
  title,
  description,
  refundNote,
  className,
  headingRef,
}: FailureMessageProps) {
  return (
    <div
      className={cn(
        "flex w-full max-w-2xl flex-col items-center gap-md text-center",
        className,
      )}
      role="alert"
      aria-live="assertive"
    >
      <span
        className={cn(
          "inline-flex size-11 items-center justify-center rounded-full",
          "bg-error/15 text-error",
        )}
        aria-hidden
      >
        <AlertCircle className="size-5" />
      </span>

      <div className="flex flex-col gap-sm">
        <H2
          ref={headingRef as React.Ref<HTMLElement>}
          tabIndex={-1}
          className="text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {title}
        </H2>
        <BodySmall className="text-muted-foreground">{description}</BodySmall>
        {refundNote ? (
          <BodySmall className="font-semibold text-success">
            {refundNote}
          </BodySmall>
        ) : null}
      </div>
    </div>
  );
}
