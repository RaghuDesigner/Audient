/**
 * Phase-1 mock Payment Success — SCREEN-015.
 * Confirmation fixtures + query resolver; no Stripe / no API / no entitlements.
 */

import type {
  PaymentSuccessCycle,
  PaymentSuccessPlan,
  PaymentSuccessState,
} from "@/config/payment-success";
import { checkoutSummaryFeatureBullets } from "@/utils/checkout-summary";
import {
  buildPaymentSuccessViewModel,
  hasPaymentSuccessContext,
  parsePaymentSuccessQuery,
  type PaymentSuccessQuery,
  type PaymentSuccessViewModel,
} from "@/utils/payment-success";

export type MockPaymentSuccess = {
  state: PaymentSuccessState;
  plan: PaymentSuccessPlan;
  cycle: PaymentSuccessCycle;
  viewModel: PaymentSuccessViewModel;
  featureBullets: string[];
};

export type MockPaymentSuccessResult =
  | { kind: "ready"; data: MockPaymentSuccess }
  | { kind: "empty" }
  | { kind: "error"; reason: "missing_context" | "forced_error" };

export function getMockPaymentSuccess(input: {
  plan?: PaymentSuccessPlan | null;
  cycle?: PaymentSuccessCycle;
  intentId?: string | null;
  amountCents?: number | null;
  couponCode?: string | null;
  state?: PaymentSuccessState | null;
  from?: Date;
}): MockPaymentSuccess | null {
  const plan = input.plan;
  if (!plan) return null;

  const viewModel = buildPaymentSuccessViewModel({
    plan,
    cycle: input.cycle,
    intentId: input.intentId,
    amountCents: input.amountCents,
    couponCode: input.couponCode,
    from: input.from,
  });

  const state: PaymentSuccessState =
    input.state === "loading" || input.state === "error"
      ? input.state
      : "success";

  return {
    state,
    plan: viewModel.plan,
    cycle: viewModel.cycle,
    viewModel,
    featureBullets: checkoutSummaryFeatureBullets(plan),
  };
}

/** Resolve URL/query params into mock payload or empty/error. */
export function resolveMockPaymentSuccessFromQuery(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
  options?: { from?: Date },
): MockPaymentSuccessResult {
  const query: PaymentSuccessQuery = parsePaymentSuccessQuery(params);

  if (!hasPaymentSuccessContext(query) && query.state !== "error") {
    return { kind: "empty" };
  }

  const data = getMockPaymentSuccess({
    plan: query.plan ?? "pro",
    cycle: query.cycle,
    intentId: query.intentId,
    amountCents: query.amountCents,
    couponCode: query.couponCode,
    state: query.state,
    from: options?.from,
  });

  if (!data) {
    return { kind: "empty" };
  }

  if (query.state === "error" || data.state === "error") {
    return { kind: "error", reason: "forced_error" };
  }

  return { kind: "ready", data };
}

export const MOCK_PAYMENT_SUCCESS_PRO: MockPaymentSuccess =
  getMockPaymentSuccess({
    plan: "pro",
    cycle: "monthly",
    intentId: "mock_pi_success_pro_demo",
  })!;

export const MOCK_PAYMENT_SUCCESS_BUSINESS: MockPaymentSuccess =
  getMockPaymentSuccess({
    plan: "business",
    cycle: "yearly",
    intentId: "mock_pi_success_biz_demo",
  })!;

export const MOCK_PAYMENT_SUCCESS_PRO_COUPON: MockPaymentSuccess =
  getMockPaymentSuccess({
    plan: "pro",
    cycle: "monthly",
    couponCode: "WELCOME",
    intentId: "mock_pi_success_coupon_demo",
  })!;

export const MOCK_PAYMENT_SUCCESS_LOADING: MockPaymentSuccess =
  getMockPaymentSuccess({
    plan: "pro",
    cycle: "monthly",
    state: "loading",
    intentId: "mock_pi_success_loading",
  })!;

export const MOCK_PAYMENT_SUCCESS_ERROR: MockPaymentSuccess =
  getMockPaymentSuccess({
    plan: "pro",
    cycle: "monthly",
    state: "error",
    intentId: "mock_pi_success_error",
  })!;
