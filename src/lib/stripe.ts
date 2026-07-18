import Stripe from "stripe";
import { env, siteUrl } from "@/lib/env";
import type { PlanCalculation } from "@/lib/pricing";
import { updatePlanStripeReferences } from "@/lib/database";

let stripeClient: Stripe | null = null;

export function getStripe() {
  if (!stripeClient) {
    stripeClient = new Stripe(env("STRIPE_SECRET_KEY"));
  }

  return stripeClient;
}

export function checkoutLineItems(calculation: PlanCalculation) {
  const missing = calculation.bins.find((bin) => !bin.stripePriceId);
  if (missing) {
    throw new Error(
      `Missing Stripe Price ID for ${missing.displayLabel}. Configure active pricing in Supabase.`,
    );
  }

  const grouped = new Map<string, number>();
  for (const bin of calculation.bins) {
    grouped.set(bin.stripePriceId!, (grouped.get(bin.stripePriceId!) || 0) + 1);
  }

  return Array.from(grouped).map(([price, quantity]) => ({
    price,
    quantity,
  }));
}

export async function createCheckoutSession({
  calculation,
  profileId,
  propertyId,
  customerPlanId,
  email,
  fullName,
  existingStripeCustomerId,
}: {
  calculation: PlanCalculation;
  profileId: string;
  propertyId: string;
  customerPlanId: string;
  email: string;
  fullName: string;
  existingStripeCustomerId?: string | null;
}) {
  const stripe = getStripe();
  let stripeCustomerId = existingStripeCustomerId || null;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email,
      name: fullName,
      metadata: {
        profile_id: profileId,
      },
    });
    stripeCustomerId = customer.id;
  }

  const metadata = {
    profile_id: profileId,
    property_id: propertyId,
    customer_plan_id: customerPlanId,
    number_of_bins: String(calculation.bins.length),
  };

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: checkoutLineItems(calculation),
    success_url: `${siteUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/?checkout=cancelled#signup`,
    metadata,
    subscription_data: {
      metadata,
    },
    allow_promotion_codes: false,
  });

  await updatePlanStripeReferences({
    customerPlanId,
    stripeCustomerId,
    stripeCheckoutSessionId: session.id,
  });

  return session;
}

export function verifyStripeWebhook(rawBody: string, signature: string | null) {
  if (!signature) {
    throw new Error("Missing Stripe signature");
  }

  return getStripe().webhooks.constructEvent(
    rawBody,
    signature,
    env("STRIPE_WEBHOOK_SECRET"),
  );
}

export async function cancelStripeSubscription(subscriptionId: string) {
  return getStripe().subscriptions.cancel(subscriptionId);
}

export async function createReplacementStripePrices({
  productId,
  firstBinPricePence,
  additionalBinPricePence,
}: {
  productId: string;
  firstBinPricePence: number;
  additionalBinPricePence: number;
}) {
  const stripe = getStripe();
  const [first, additional] = await Promise.all([
    stripe.prices.create({
      product: productId,
      unit_amount: firstBinPricePence,
      currency: "gbp",
      recurring: { interval: "month" },
    }),
    stripe.prices.create({
      product: productId,
      unit_amount: additionalBinPricePence,
      currency: "gbp",
      recurring: { interval: "month" },
    }),
  ]);

  return {
    firstBinStripePriceId: first.id,
    additionalBinStripePriceId: additional.id,
  };
}
