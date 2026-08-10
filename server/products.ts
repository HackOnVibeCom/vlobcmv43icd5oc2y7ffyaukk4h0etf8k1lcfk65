import { getStripeConfig } from "./config";

export const PRODUCTS = {
  premium: {
    code: "premium",
    name: "PITCHFORGE Premium",
    entitlement: "Unlimited campaign image generation and custom image prompts.",
  },
} as const;

export function getPremiumPriceId() {
  return getStripeConfig().premiumPriceId;
}
