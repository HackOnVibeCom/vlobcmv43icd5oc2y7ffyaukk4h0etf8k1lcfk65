const env = (name: string) => process.env[name]?.trim();

// High-throughput, high-RPM & high-TPM model ladder for Google AI Studio free and production tiers
const MODEL_DEFAULTS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-2.5-flash-lite",
  "gemini-1.5-pro",
  "gemini-2.0-pro-exp-02-05",
];

export function getGeminiConfig() {
  const baseUrl = env("GEMINI_API_BASE_URL") ?? "https://generativelanguage.googleapis.com/v1beta";
  
  // Multi-API-Key Support: Supports comma-separated keys or GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc.
  const rawKey = env("GEMINI_API_KEY") || "";
  const extraKeys = [
    env("GEMINI_API_KEY_1"),
    env("GEMINI_API_KEY_2"),
    env("GEMINI_API_KEY_3"),
    env("GEMINI_API_KEY_4"),
    env("GEMINI_API_KEY_5"),
  ].filter(Boolean) as string[];

  const allKeys = [
    ...rawKey.split(",").map(k => k.trim()).filter(Boolean),
    ...extraKeys,
  ];

  const apiKey = allKeys[Math.floor(Math.random() * (allKeys.length || 1))] || rawKey;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Add it in environment settings.");
  }

  // Allow per-slot model overrides, fall back to defaults
  const models = MODEL_DEFAULTS.map(
    (fallback, i) => env(`GEMINI_MODEL_${i + 1}`) ?? fallback
  );

  return { baseUrl: baseUrl.replace(/\/$/, ""), models, apiKey, allKeys: allKeys.length > 0 ? allKeys : [apiKey] };
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
