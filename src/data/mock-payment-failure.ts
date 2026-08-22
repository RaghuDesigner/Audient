/**
 * Phase-1 mock Payment Failure — SCREEN-016.
 * Decline fixtures + query resolver; no Stripe / no API / no entitlements.
 */

import type {
  PaymentFailureCycle,
  PaymentFailurePlan,
  PaymentFailureReason,
  PaymentFailureState,
} from "@/config/payment-failure";
import { checkoutSummaryFeatureBullets } from "@/utils/checkout-summary";
import {
  buildPaymentFailureViewModel,
  hasPaymentFailureContext,
  parsePaymentFailureQuery,
  type PaymentFailureQuery,
  type PaymentFailureViewModel,
} from "@/utils/payment-failure";

export type MockPaymentFailure = {
  state: PaymentFailureState;
  plan: PaymentFailurePlan;
  cycle: PaymentFailureCycle;
  reason: PaymentFailureReason;
  viewModel: PaymentFailureViewModel;
  featureBullets: string[];
};

export type MockPaymentFailureResult =
  | { kind: "ready"; data: MockPaymentFailure }
  | { kind: "empty" }
  | { kind: "error"; reason: "missing_context" | "forced_error" };

export function getMockPaymentFailure(input: {
  plan?: PaymentFailurePlan | null;
  cycle?: PaymentFailureCycle;
  reason?: PaymentFailureReason;
  intentId?: string | null;
  amountCents?: number | null;
  couponCode?: string | null;
  state?: PaymentFailureState | null;
}): MockPaymentFailure | null {
  const plan = input.plan;
  if (!plan) return null;

  const viewModel = buildPaymentFailureViewModel({
    plan,
    cycle: input.cycle,
    reason: input.reason,
    intentId: input.intentId,
    amountCents: input.amountCents,
    couponCode: input.couponCode,
  });

  let state: PaymentFailureState = "failure";
  if (input.state === "loading" || input.state === "error" || input.state === "retrying") {
    state = input.state;
  }

  return {
    state,
    plan: viewModel.plan,
    cycle: viewModel.cycle,
    reason: viewModel.reason,
    viewModel,
    featureBullets: checkoutSummaryFeatureBullets(plan),
  };
}

/** Resolve URL/query into mock payload or empty/error. */
export function resolveMockPaymentFailureFromQuery(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): MockPaymentFailureResult {
  const query: PaymentFailureQuery = parsePaymentFailureQuery(params);

  if (!hasPaymentFailureContext(query) && query.state !== "error") {
    return { kind: "empty" };
  }

  const data = getMockPaymentFailure({
    plan: query.plan ?? "pro",
    cycle: query.cycle,
    reason: query.reason,
    intentId: query.intentId,
    amountCents: query.amountCents,
    couponCode: query.couponCode,
    state: query.state,
  });

  if (!data) {
    return { kind: "empty" };
  }

  if (query.state === "error" || data.state === "error") {
    return { kind: "error", reason: "forced_error" };
  }

  return { kind: "ready", data };
}

export const MOCK_PAYMENT_FAILURE_DECLINED: MockPaymentFailure =
  getMockPaymentFailure({
    plan: "pro",
    cycle: "monthly",
    reason: "declined",
    intentId: "mock_pi_fail_declined",
  })!;

export const MOCK_PAYMENT_FAILURE_NETWORK: MockPaymentFailure =
  getMockPaymentFailure({
    plan: "pro",
    cycle: "monthly",
    reason: "network",
    intentId: "mock_pi_fail_network",
  })!;

export const MOCK_PAYMENT_FAILURE_TIMEOUT: MockPaymentFailure =
  getMockPaymentFailure({
    plan: "business",
    cycle: "yearly",
    reason: "timeout",
    intentId: "mock_pi_fail_timeout",
  })!;

export const MOCK_PAYMENT_FAILURE_SESSION: MockPaymentFailure =
  getMockPaymentFailure({
    plan: "pro",
    cycle: "monthly",
    reason: "session_expired",
    intentId: "mock_pi_fail_session",
  })!;

export const MOCK_PAYMENT_FAILURE_UNKNOWN: MockPaymentFailure =
  getMockPaymentFailure({
    plan: "business",
    cycle: "monthly",
    reason: "unknown",
    intentId: "mock_pi_fail_unknown",
  })!;

export const MOCK_PAYMENT_FAILURE_METHOD: MockPaymentFailure =
  getMockPaymentFailure({
    plan: "pro",
    cycle: "monthly",
    reason: "method_unavailable",
    intentId: "mock_pi_fail_method",
  })!;

export const MOCK_PAYMENT_FAILURE_LOADING: MockPaymentFailure =
  getMockPaymentFailure({
    plan: "pro",
    cycle: "monthly",
    reason: "declined",
    state: "loading",
    intentId: "mock_pi_fail_loading",
  })!;

export const MOCK_PAYMENT_FAILURE_ERROR: MockPaymentFailure =
  getMockPaymentFailure({
    plan: "pro",
    cycle: "monthly",
    reason: "unknown",
    state: "error",
    intentId: "mock_pi_fail_error",
  })!;
