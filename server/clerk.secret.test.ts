import { describe, expect, it } from "vitest";

describe("Clerk server configuration", () => {
  it("authenticates against Clerk's instance endpoint", async () => {
    const secretKey = process.env.CLERK_SECRET_KEY;

    expect(secretKey, "CLERK_SECRET_KEY must be configured").toBeTruthy();

    const response = await fetch("https://api.clerk.com/v1/instance", {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    expect(response.ok, `Clerk returned HTTP ${response.status}`).toBe(true);
  }, 20_000);
});

describe("Gemini generation configuration", () => {
  it("provides a valid endpoint and four distinct configured fallback models", () => {
    const baseUrl = process.env.GEMINI_API_BASE_URL;
    const models = [
      process.env.GEMINI_MODEL_1,
      process.env.GEMINI_MODEL_2,
      process.env.GEMINI_MODEL_3,
      process.env.GEMINI_MODEL_4,
    ];

    expect(baseUrl).toBe("https://generativelanguage.googleapis.com/v1beta");
    expect(models.every(model => Boolean(model?.startsWith("gemini-")))).toBe(true);
    expect(new Set(models).size).toBe(4);
  });

  it("authenticates the primary Gemini key against the model-list endpoint", async () => {
    const baseUrl = process.env.GEMINI_API_BASE_URL;
    const apiKey = process.env.GEMINI_API_KEY_1;

    expect(baseUrl, "GEMINI_API_BASE_URL must be configured").toBeTruthy();
    expect(apiKey, "GEMINI_API_KEY_1 must be configured").toBeTruthy();

    const response = await fetch(`${baseUrl}/models?key=${encodeURIComponent(apiKey!)}`, {
      signal: AbortSignal.timeout(20_000),
    });

    expect(response.ok, `Gemini returned HTTP ${response.status}`).toBe(true);
  }, 25_000);
});
