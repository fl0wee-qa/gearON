import Stripe from "stripe";

import { env, stripeEnabled } from "@/lib/env";

let stripeClient: Stripe | null = null;

export function getStripeServer() {
  if (!stripeEnabled || !env.STRIPE_SECRET_KEY) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY);
  }

  return stripeClient;
}
