"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { BodySmall } from "@/components/ui/typography";
import { cn } from "@/utils/cn";

export type FaqItemProps = {
  id: string;
  question: string;
  answer: string;
  expanded: boolean;
  onToggle: (id: string) => void;
  buttonId: string;
  panelId: string;
  disabled?: boolean;
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  className?: string;
};

/**
 * COMPONENT-064 — FAQ Item.
 * Single expandable Q&A row — WCAG accordion disclosure pattern.
 */
export const FaqItem = React.forwardRef<HTMLButtonElement, FaqItemProps>(
  function FaqItem(
    {
      id,
      question,
      answer,
      expanded,
      onToggle,
      buttonId,
      panelId,
      disabled = false,
      onKeyDown,
      className,
    },
    ref,
  ) {
    return (
      <div className={cn("w-full", className)}>
        <button
          ref={ref}
          id={buttonId}
          type="button"
          disabled={disabled}
          className={cn(
            "flex min-h-11 w-full items-center justify-between gap-md",
            "text-left text-body-sm font-semibold text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            disabled && "cursor-not-allowed opacity-60",
          )}
          aria-expanded={expanded}
          aria-controls={panelId}
          aria-disabled={disabled || undefined}
          onClick={() => onToggle(id)}
          onKeyDown={onKeyDown}
        >
          <span>{question}</span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none",
              expanded && "rotate-180",
            )}
            aria-hidden
          />
        </button>
        {expanded ? (
          <BodySmall
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            className="mt-sm text-muted-foreground"
          >
            {answer}
          </BodySmall>
        ) : null}
      </div>
    );
  },
);

FaqItem.displayName = "FaqItem";
