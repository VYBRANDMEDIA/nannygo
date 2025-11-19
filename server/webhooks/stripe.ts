import { Request, Response } from "express";
import { constructWebhookEvent } from "../stripe";
import * as db from "../db";

/**
 * Stripe webhook handler
 * Handles subscription events and updates database accordingly
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const signature = req.headers["stripe-signature"];

  if (!signature || Array.isArray(signature)) {
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  try {
    const event = constructWebhookEvent(req.body, signature);

    // Test event detection - MUST return verification response
    if (event.id.startsWith("evt_test_")) {
      console.log("[Webhook] Test event detected, returning verification response");
      return res.json({
        verified: true,
      });
    }

    console.log(`[Webhook] Processing event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const profileId = parseInt(session.metadata?.profileId || "0");

        if (profileId && session.mode === "subscription") {
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;

          // Update nanny profile with Stripe customer and subscription IDs
          await db.updateNannyProfile(profileId, {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: "trialing", // Will be updated by subscription events
          });

          console.log(`[Webhook] Subscription created for profile ${profileId}`);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const profileId = parseInt(subscription.metadata?.profileId || "0");

        if (profileId) {
          const status = subscription.status;
          const trialEnd = subscription.trial_end
            ? new Date(subscription.trial_end * 1000)
            : null;

          await db.updateNannyProfile(profileId, {
            subscriptionStatus: status,
            trialEndsAt: trialEnd,
          });

          console.log(`[Webhook] Subscription ${subscription.id} updated to ${status}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const profileId = parseInt(subscription.metadata?.profileId || "0");

        if (profileId) {
          await db.updateNannyProfile(profileId, {
            subscriptionStatus: "canceled",
            isAvailable: 0, // Automatically set to unavailable
          });

          console.log(`[Webhook] Subscription ${subscription.id} canceled`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          // Find profile by subscription ID and update status
          // Note: This requires a helper function to find by subscription ID
          console.log(`[Webhook] Payment failed for subscription ${subscriptionId}`);
        }
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error);
    res.status(400).json({ error: "Webhook processing failed" });
  }
}
