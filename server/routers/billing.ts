import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { getStripeConfig } from "../config";
import { PRODUCTS, getPremiumPriceId } from "../products";
import { protectedProcedure, router } from "../_core/trpc";

export const billingRouter = router({
  createCheckout: protectedProcedure.mutation(async ({ ctx }) => {
    const { secretKey } = getStripeConfig();
    const premiumPriceId = getPremiumPriceId();
    if (!secretKey || !premiumPriceId) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Premium checkout is not configured yet. Add the Stripe Premium Price ID in project settings.",
      });
    }

    const stripe = new Stripe(secretKey);
    const origin = ctx.req.headers.origin ?? "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: premiumPriceId, quantity: 1 }],
      customer_email: ctx.user.email ?? undefined,
      client_reference_id: ctx.user.id.toString(),
      metadata: {
        user_id: ctx.user.id.toString(),
        customer_email: ctx.user.email ?? "",
        customer_name: ctx.user.name ?? "",
      },
      subscription_data: {
        metadata: { user_id: ctx.user.id.toString(), product_code: PRODUCTS.premium.code },
      },
      allow_promotion_codes: true,
      success_url: `${origin}/workspace?billing=success`,
      cancel_url: `${origin}/workspace?billing=cancelled`,
    });

    if (!session.url) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "PITCHFORGE could not open secure checkout." });
    return { checkoutUrl: session.url };
  }),

  history: protectedProcedure.query(async ({ ctx }) => {
    const { secretKey } = getStripeConfig();
    if (!secretKey || !ctx.user.stripeCustomerId) return [];
    const stripe = new Stripe(secretKey);
    const invoices = await stripe.invoices.list({ customer: ctx.user.stripeCustomerId, status: "paid", limit: 12 });
    return invoices.data.map(invoice => ({
      id: invoice.id,
      createdAt: new Date(invoice.created * 1000),
      amount: new Intl.NumberFormat("en-US", { style: "currency", currency: invoice.currency.toUpperCase() }).format((invoice.amount_paid ?? 0) / 100),
      description: invoice.description ?? PRODUCTS.premium.name,
      status: invoice.status,
    }));
  }),
});
