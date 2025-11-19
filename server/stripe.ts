import Stripe from "stripe";
import { NANNY_SUBSCRIPTION } from "./products";

// Initialize Stripe with secret key from environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-10-29.clover",
});

/**
 * Create a Stripe checkout session for nanny subscription
 */
export async function createSubscriptionCheckout(params: {
  userId: string;
  userEmail: string;
  userName: string;
  profileId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card", "ideal"],
    line_items: [
      {
        price_data: {
          currency: NANNY_SUBSCRIPTION.currency,
          product_data: {
            name: NANNY_SUBSCRIPTION.name,
            description: NANNY_SUBSCRIPTION.description,
          },
          recurring: {
            interval: NANNY_SUBSCRIPTION.interval,
          },
          unit_amount: NANNY_SUBSCRIPTION.priceAmount,
        },
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: NANNY_SUBSCRIPTION.trialPeriodDays,
      metadata: {
        userId: params.userId.toString(),
        profileId: params.profileId.toString(),
      },
    },
    customer_email: params.userEmail,
    client_reference_id: params.userId.toString(),
    metadata: {
      userId: params.userId.toString(),
      profileId: params.profileId.toString(),
      userEmail: params.userEmail,
      userName: params.userName,
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    allow_promotion_codes: true,
  });

  return session;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Construct webhook event from request
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

export { stripe };
