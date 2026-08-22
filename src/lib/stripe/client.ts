import "server-only";

import Stripe from "stripe";

import { requireStripeSecretKey } from "@/lib/stripe/env";

let stripeSingleton: Stripe | null = null;

/**
 * Server-only Stripe SDK client (test or live based on secret key).
 */
export function getStripe(): Stripe {
  if (stripeSingleton) return stripeSingleton;
  stripeSingleton = new Stripe(requireStripeSecretKey(), {
    apiVersion: "2025-02-24.acacia",
    typescript: true,
    appInfo: { name: "Audient", version: "0.1.0" },
  });
  return stripeSingleton;
}
