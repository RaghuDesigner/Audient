"use client";

import { Badge } from "@/components/ui/badge";
import { Caption } from "@/components/ui/typography";
import {
  BUY_CREDITS_CARD_COPY,
  type BuyCreditsPack,
} from "@/config/buy-credits-card";
import { buyCreditsPackPriceLabel } from "@/utils/buy-credits-card";
import { cn } from "@/utils/cn";

export type BuyCreditsPackGridProps = {
  packs: BuyCreditsPack[];
  selectedPackId: string | null;
  groupId: string;
  compact?: boolean;
  disabledAll?: boolean;
  onSelect: (pack: BuyCreditsPack) => void;
};

/**
 * COMPONENT-038 — credit pack radiogroup.
 */
export function BuyCreditsPackGrid({
  packs,
  selectedPackId,
  groupId,
  compact = false,
  disabledAll = false,
  onSelect,
}: BuyCreditsPackGridProps) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={`${groupId}-label`}
      className={cn(
        "mt-md grid gap-sm",
        compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-4",
      )}
    >
      <Caption id={`${groupId}-label`} className="sr-only">
        {BUY_CREDITS_CARD_COPY.selectPack}
      </Caption>
      {packs.map((pack) => {
        const selected = pack.id === selectedPackId;
        const disabled = pack.comingSoon || disabledAll;
        return (
          <button
            key={pack.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onSelect(pack)}
            className={cn(
              "flex min-h-20 flex-col items-start gap-sm rounded-md border p-md text-left",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              selected
                ? "border-primary bg-primary/5"
                : "border-border bg-background",
              disabled && "cursor-not-allowed opacity-60",
            )}
          >
            <span className="flex w-full flex-wrap items-center gap-sm">
              <span className="text-body-sm font-semibold text-foreground">
                {pack.label}
              </span>
              {pack.popular ? (
                <Badge variant="secondary" size="sm" shape="rounded">
                  {BUY_CREDITS_CARD_COPY.mostPopular}
                </Badge>
              ) : null}
              {pack.comingSoon ? (
                <Badge variant="neutral" size="sm" shape="rounded">
                  {BUY_CREDITS_CARD_COPY.comingSoon}
                </Badge>
              ) : null}
            </span>
            {!pack.comingSoon ? (
              <Caption className="tabular-nums text-muted-foreground">
                {buyCreditsPackPriceLabel(pack.priceCents)}
              </Caption>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
