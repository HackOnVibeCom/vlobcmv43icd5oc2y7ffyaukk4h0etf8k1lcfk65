const env = (name: string) => process.env[name]?.trim();

// Model fallback ladder — fastest to most capable.
// Override any slot via GEMINI_MODEL_1..4 env vars; defaults cover the common case.
const MODEL_DEFAULTS = [
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
];

export function getGeminiConfig() {
  const baseUrl = env("GEMINI_API_BASE_URL") ?? "https://generativelanguage.googleapis.com/v1beta";
  const apiKey = env("GEMINI_API_KEY");

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Add it in environment settings.");
  }

  // Allow per-slot model overrides, fall back to defaults
  const models = MODEL_DEFAULTS.map(
    (fallback, i) => env(`GEMINI_MODEL_${i + 1}`) ?? fallback
  );

  return { baseUrl: baseUrl.replace(/\/$/, ""), models, apiKey };
}

export function getClerkSecretKey() {
  const secretKey = env("CLERK_SECRET_KEY");
  if (!secretKey) throw new Error("Clerk is not configured on the server.");
  return secretKey;
}

// TODO: placeholder — replace with the real implementation once we confirm
// exactly how server/products.ts and server/routers/billing.ts use this.
// This stub only unblocks the build; it does not wire up real Stripe billing.
export function getStripeConfig() {
  const secretKey = env("STRIPE_SECRET_KEY");
  if (!secretKey) throw new Error("Stripe is not configured on the server.");
  const webhookSecret = env("STRIPE_WEBHOOK_SECRET");
  const premiumPriceId = env("STRIPE_PREMIUM_PRICE_ID");
  return { secretKey, webhookSecret, premiumPriceId };
}
