/**
 * Buy Credits Card analytics — COMPONENT-038.
 * Dev stub — prefer pack ids + amounts; no PII / payment PAN.
 */

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const buyCreditsCardAnalytics = {
  /** Card impressed — align with credits_viewed. */
  viewed: (props: {
    tier: string;
    creditsRemaining?: number;
    variant?: string;
  }) => {
    track("credits_viewed", props);
    track("buy_credits_card_impressed", props);
  },

  packSelected: (props: {
    packId: string;
    credits: number;
    priceCents: number;
    tier?: string;
  }) => track("credit_pack_selected", props),

  buyClicked: (props: {
    packId: string;
    credits: number;
    priceCents: number;
    tier: string;
    source?: string;
  }) =>
    track("buy_credits_clicked", {
      ...props,
      source: props.source ?? "buy_credits_card",
    }),

  /** Mock success only — real grants via webhook later. */
  purchaseMockSuccess: (props: {
    packId: string;
    credits: number;
    tier: string;
  }) => track("credits_purchased", { ...props, mock: true }),

  retryClicked: (props?: { tier?: string }) =>
    track("buy_credits_card_retry", props),
};
