"use client";

import * as React from "react";

import { FaqItem } from "@/components/common/FaqItem";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FAQ_ACCORDION_ALLOW_MULTIPLE_DEFAULT,
  type FaqAccordionItem,
  type FaqAccordionModule,
  type FaqAccordionState,
} from "@/config/faq-accordion";
import { faqAccordionAnalytics } from "@/lib/analytics/faq-accordion-events";
import {
  faqAccordionDefaultHeading,
  isFaqExpanded,
  shouldRenderFaqAccordion,
  toggleFaqExpandedIds,
} from "@/utils/faq-accordion";
import { cn } from "@/utils/cn";

export type FaqAccordionProps = {
  items: FaqAccordionItem[];
  state?: FaqAccordionState;
  allowMultiple?: boolean;
  expandedIds?: string[];
  defaultExpandedIds?: string[];
  onExpandedChange?: (ids: string[]) => void;
  heading?: string;
  module?: FaqAccordionModule;
  className?: string;
  id?: string;
};

/**
 * COMPONENT-037 — FAQ Accordion.
 * Composes FaqItem (COMPONENT-064) — mock items; WCAG disclosure pattern.
 */
export function FaqAccordion({
  items,
  state = "ready",
  allowMultiple = FAQ_ACCORDION_ALLOW_MULTIPLE_DEFAULT,
  expandedIds: controlledIds,
  defaultExpandedIds = [],
  onExpandedChange,
  heading,
  module = "membership",
  className,
  id,
}: FaqAccordionProps) {
  const [uncontrolledIds, setUncontrolledIds] =
    React.useState<string[]>(defaultExpandedIds);
  const titleId = React.useId();
  const listId = React.useId();
  const buttonRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const expandedIds =
    controlledIds != null ? controlledIds : uncontrolledIds;

  const setExpanded = React.useCallback(
    (next: string[]) => {
      if (controlledIds == null) {
        setUncontrolledIds(next);
      }
      onExpandedChange?.(next);
    },
    [controlledIds, onExpandedChange],
  );

  if (!shouldRenderFaqAccordion(items, state)) {
    return null;
  }

  const resolvedHeading = faqAccordionDefaultHeading(module, heading);

  if (state === "loading") {
    return (
      <section
        className={cn(chrome, className)}
        aria-busy="true"
        aria-label={resolvedHeading}
      >
        <Skeleton className="h-5 w-40" />
        <div className="mt-md flex flex-col gap-md">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </section>
    );
  }

  const toggle = (faqId: string, question: string) => {
    const wasOpen = isFaqExpanded(expandedIds, faqId);
    const next = toggleFaqExpandedIds({
      expandedIds,
      faqId,
      allowMultiple,
    });
    setExpanded(next);
    if (wasOpen) {
      faqAccordionAnalytics.collapsed({ faqId, module });
    } else {
      faqAccordionAnalytics.expanded({ faqId, question, module });
    }
  };

  const onKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const buttons = buttonRefs.current.filter(Boolean) as HTMLButtonElement[];
    if (buttons.length === 0) return;
    const delta = event.key === "ArrowDown" ? 1 : -1;
    const nextIndex = (index + delta + buttons.length) % buttons.length;
    buttons[nextIndex]?.focus();
  };

  return (
    <section
      id={id}
      className={cn(chrome, className)}
      aria-labelledby={titleId}
    >
      <h2
        id={titleId}
        className="text-body-sm font-bold text-foreground sm:text-body"
      >
        {resolvedHeading}
      </h2>

      <ul id={listId} className="mt-md flex flex-col divide-y divide-border">
        {items.map((item, index) => {
          const open = isFaqExpanded(expandedIds, item.id);
          const panelId = `${listId}-panel-${item.id}`;
          const buttonId = `${listId}-trigger-${item.id}`;
          return (
            <li key={item.id} className="py-md first:pt-0 last:pb-0">
              <FaqItem
                ref={(el) => {
                  buttonRefs.current[index] = el;
                }}
                id={item.id}
                question={item.question}
                answer={item.answer}
                expanded={open}
                buttonId={buttonId}
                panelId={panelId}
                onToggle={() => toggle(item.id, item.question)}
                onKeyDown={(event) => onKeyDown(event, index)}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const chrome =
  "w-full rounded-md border border-border bg-surface p-md shadow-sm sm:p-lg";
