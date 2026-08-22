"use client";

import * as React from "react";
import { Check } from "lucide-react";

import {
  BuyCreditsCardError,
  BuyCreditsCardLoading,
  buyCreditsCardChrome,
} from "@/components/billing/BuyCreditsCardStates";
import { BuyCreditsPackGrid } from "@/components/billing/BuyCreditsPackGrid";
import { Button } from "@/components/ui/button";
import { BodySmall, Caption } from "@/components/ui/typography";
import {
  BUY_CREDITS_CARD_COPY,
  BUY_CREDITS_CARD_DEFAULT_BENEFITS,
  type BuyCreditsCardState,
  type BuyCreditsCardTier,
  type BuyCreditsCardVariant,
  type BuyCreditsPack,
} from "@/config/buy-credits-card";
import { buyCreditsCardAnalytics } from "@/lib/analytics/buy-credits-card-events";
import {
  buyCreditsCtaLabel,
  buyCreditsPackPriceLabel,
  defaultBuyCreditsPackId,
  findBuyCreditsPack,
  isBuyCreditsPackSelectable,
  shouldEnableBuyCreditsCta,
} from "@/utils/buy-credits-card";
import { cn } from "@/utils/cn";

export type BuyCreditsCardProps = {
  state: BuyCreditsCardState;
  tier: BuyCreditsCardTier;
  creditsRemaining?: number | null;
  packs: BuyCreditsPack[];
  selectedPackId?: string | null;
  benefits?: readonly string[];
  purchasing?: boolean;
  variant?: BuyCreditsCardVariant;
  onSelectPack?: (packId: string) => void;
  onBuy?: (packId: string) => void;
  onRetry?: () => void;
  className?: string;
  id?: string;
};

/**
 * COMPONENT-038 — Buy Credits Card.
 * Pack selection + mock purchase CTA — Pro/Business only; no Stripe.
 */
export function BuyCreditsCard({
  state,
  tier,
  creditsRemaining = null,
  packs,
  selectedPackId: selectedPackIdProp,
  benefits = BUY_CREDITS_CARD_DEFAULT_BENEFITS,
  purchasing = false,
  variant = "default",
  onSelectPack,
  onBuy,
  onRetry,
  className,
  id,
}: BuyCreditsCardProps) {
  const viewed = React.useRef(false);
  const titleId = React.useId();
  const groupId = React.useId();
  const [internalSelected, setInternalSelected] = React.useState<string | null>(
    () => selectedPackIdProp ?? defaultBuyCreditsPackId(packs),
  );

  const selectedPackId =
    selectedPackIdProp !== undefined ? selectedPackIdProp : internalSelected;
  const selectedPack = findBuyCreditsPack(packs, selectedPackId);
  const compact = variant === "compact";

  React.useEffect(() => {
    if (state === "loading" || state === "error" || viewed.current) return;
    viewed.current = true;
    buyCreditsCardAnalytics.viewed({
      tier,
      creditsRemaining: creditsRemaining ?? undefined,
      variant,
    });
  }, [creditsRemaining, state, tier, variant]);

  if (state === "loading") {
    return <BuyCreditsCardLoading className={className} />;
  }

  if (state === "error") {
    return (
      <BuyCreditsCardError tier={tier} onRetry={onRetry} className={className} />
    );
  }

  const selectPack = (pack: BuyCreditsPack) => {
    if (!isBuyCreditsPackSelectable(pack)) return;
    if (selectedPackIdProp === undefined) {
      setInternalSelected(pack.id);
    }
    buyCreditsCardAnalytics.packSelected({
      packId: pack.id,
      credits: pack.credits,
      priceCents: pack.priceCents,
      tier,
    });
    onSelectPack?.(pack.id);
  };

  const canBuy = shouldEnableBuyCreditsCta({
    selectedPack,
    purchasing,
    state,
  });

  const summary = [
    BUY_CREDITS_CARD_COPY.title,
    creditsRemaining != null
      ? `${creditsRemaining.toLocaleString()} credits remaining`
      : null,
    selectedPack
      ? `${selectedPack.label} for ${buyCreditsPackPriceLabel(selectedPack.priceCents)}`
      : null,
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <section
      id={id}
      className={cn(
        buyCreditsCardChrome,
        state === "out_of_stock" && "border-warning/50",
        className,
      )}
      aria-labelledby={titleId}
      aria-label={summary}
    >
      <h2
        id={titleId}
        className="text-body-sm font-bold text-foreground sm:text-body"
      >
        {BUY_CREDITS_CARD_COPY.title}
      </h2>

      {creditsRemaining != null ? (
        <BodySmall className="mt-sm text-muted-foreground">
          {BUY_CREDITS_CARD_COPY.creditsRemaining}:{" "}
          <span className="font-semibold tabular-nums text-foreground">
            {creditsRemaining.toLocaleString()}
          </span>
        </BodySmall>
      ) : null}

      {state === "out_of_stock" ? (
        <BodySmall className="mt-md text-muted-foreground" role="status">
          {BUY_CREDITS_CARD_COPY.outOfStock}
        </BodySmall>
      ) : null}

      <BuyCreditsPackGrid
        packs={packs}
        selectedPackId={selectedPackId}
        groupId={groupId}
        compact={compact}
        disabledAll={state === "out_of_stock"}
        onSelect={selectPack}
      />

      {selectedPack && !selectedPack.comingSoon ? (
        <div className="mt-md">
          <Caption className="text-muted-foreground">
            {BUY_CREDITS_CARD_COPY.price}
          </Caption>
          <p className="mt-sm text-h3 font-bold tabular-nums text-foreground">
            {buyCreditsPackPriceLabel(selectedPack.priceCents)}
          </p>
        </div>
      ) : null}

      <div className="mt-md">
        <Caption className="text-muted-foreground">
          {BUY_CREDITS_CARD_COPY.benefits}
        </Caption>
        <ul className="mt-sm flex flex-col gap-sm">
          {benefits.map((benefit) => (
            <li
              key={benefit}
              className="flex items-start gap-sm text-info text-foreground sm:text-body-sm"
            >
              <Check
                className="mt-0.5 size-4 shrink-0 text-success"
                aria-hidden
              />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button
        type="button"
        variant="primary"
        size="md"
        className="mt-md w-full text-primary-foreground sm:w-auto"
        disabled={!canBuy}
        aria-busy={purchasing || undefined}
        onClick={() => {
          if (!selectedPack) return;
          buyCreditsCardAnalytics.buyClicked({
            packId: selectedPack.id,
            credits: selectedPack.credits,
            priceCents: selectedPack.priceCents,
            tier,
          });
          onBuy?.(selectedPack.id);
        }}
      >
        {purchasing
          ? BUY_CREDITS_CARD_COPY.purchasing
          : buyCreditsCtaLabel(selectedPack)}
      </Button>
    </section>
  );
}
