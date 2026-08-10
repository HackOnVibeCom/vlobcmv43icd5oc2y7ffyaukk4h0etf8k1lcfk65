import express, { type Express, type Request, type Response } from "express";
import Stripe from "stripe";
import { getStripeConfig } from "./config";
import { setUserPlan } from "./db";

export function registerStripeWebhook(app: Express) {
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {
    const { secretKey, webhookSecret } = getStripeConfig();
    if (!secretKey || !webhookSecret) return res.status(503).json({ error: "Stripe webhook is not configured." });

    const signature = req.headers["stripe-signature"];
    if (typeof signature !== "string") return res.status(400).json({ error: "Missing Stripe signature." });

    const stripe = new Stripe(secretKey);
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch {
      return res.status(400).json({ error: "Invalid Stripe signature." });
    }

    if (event.id.startsWith("evt_test_")) {
      console.log("[Webhook] Test event detected, returning verification response");
      return res.json({ verified: true });
    }

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = Number(session.metadata?.user_id ?? session.client_reference_id);
        if (Number.isInteger(userId) && userId > 0) {
          await setUserPlan(userId, "premium", {
            customerId: typeof session.customer === "string" ? session.customer : undefined,
            subscriptionId: typeof session.subscription === "string" ? session.subscription : undefined,
          });
        }
      }

      if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = Number(subscription.metadata.user_id);
        if (Number.isInteger(userId) && userId > 0) await setUserPlan(userId, "free");
      }

      console.log("[Stripe webhook] Processed", event.type, event.id, event.created);
      return res.json({ received: true });
    } catch (error) {
      console.error("[Stripe webhook] Failed", event.type, error);
      return res.status(500).json({ error: "Webhook processing failed." });
    }
  });
}
