import { describe, expect, it, vi } from "vitest";

const stripeCalls = vi.hoisted(() => ({ createCheckout: vi.fn(), listInvoices: vi.fn() }));

vi.mock("stripe", () => ({
  default: class StripeMock {
    checkout = { sessions: { create: stripeCalls.createCheckout } };
    invoices = { list: stripeCalls.listInvoices };
  },
}));

vi.mock("../config", () => ({ getStripeConfig: () => ({ secretKey: "sk_test_router", webhookSecret: "whsec_test", premiumPriceId: "price_premium" }) }));
vi.mock("../products", () => ({ getPremiumPriceId: () => "price_premium", PRODUCTS: { premium: { code: "premium", name: "PITCHFORGE Premium" } } }));

import { billingRouter } from "./billing";

const user = {
  id: 42,
  openId: "clerk-user-42",
  name: "Campaign Member",
  email: "member@example.com",
  loginMethod: "clerk",
  role: "user" as const,
  plan: "free" as const,
  stripeCustomerId: "cus_pitchforge",
  stripeSubscriptionId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("billing router", () => {
  it("creates a subscription checkout bound to the signed-in member and the configured Premium price", async () => {
    stripeCalls.createCheckout.mockResolvedValue({ url: "https://checkout.stripe.test/session" });
    const caller = billingRouter.createCaller({ user, req: { headers: { origin: "https://pitchforge.test" } } } as never);

    await expect(caller.createCheckout()).resolves.toEqual({ checkoutUrl: "https://checkout.stripe.test/session" });
    expect(stripeCalls.createCheckout).toHaveBeenCalledWith(expect.objectContaining({
      mode: "subscription",
      customer_email: "member@example.com",
      client_reference_id: "42",
      line_items: [{ price: "price_premium", quantity: 1 }],
      success_url: "https://pitchforge.test/workspace?billing=success",
      cancel_url: "https://pitchforge.test/workspace?billing=cancelled",
    }));
  });

  it("maps paid invoices into the payment-history contract without returning Stripe internals", async () => {
    stripeCalls.listInvoices.mockResolvedValue({ data: [{ id: "in_001", created: 1_700_000_000, currency: "usd", amount_paid: 1200, description: "PITCHFORGE Premium", status: "paid" }] });
    const caller = billingRouter.createCaller({ user } as never);

    await expect(caller.history()).resolves.toEqual([{ id: "in_001", createdAt: new Date(1_700_000_000_000), amount: "$12.00", description: "PITCHFORGE Premium", status: "paid" }]);
  });
});
