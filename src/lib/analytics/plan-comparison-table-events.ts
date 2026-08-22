/**
 * Plan Comparison Table analytics — COMPONENT-035.
 * Dev stub — prefer ids + enums; no PII / payment details.
 */

type Props = Record<string, string | number | boolean | undefined>;

function track(event: string, props?: Props): void {
  if (process.env.NODE_ENV === "development") {
    console.info(`[analytics] ${event}`, props ?? {});
  }
}

export const planComparisonTableAnalytics = {
  /** Table impressed — align with plan_compared. */
  compared: (props: {
    currentPlan?: string | null;
    recommendedPlan?: string | null;
    variant?: string;
    billingInterval?: string;
  }) => {
    track("plan_compared", {
      currentPlan: props.currentPlan ?? undefined,
      recommendedPlan: props.recommendedPlan ?? undefined,
      variant: props.variant,
      billingInterval: props.billingInterval,
    });
    track("plan_comparison_table_impressed", {
      currentPlan: props.currentPlan ?? undefined,
      recommendedPlan: props.recommendedPlan ?? undefined,
      variant: props.variant,
    });
  },

  upgradeClicked: (props: {
    currentPlan?: string | null;
    targetPlan: "pro" | "business";
    source?: string;
  }) =>
    track("upgrade_clicked", {
      currentPlan: props.currentPlan ?? undefined,
      targetPlan: props.targetPlan,
      source: props.source ?? "plan_comparison_table",
    }),
};
