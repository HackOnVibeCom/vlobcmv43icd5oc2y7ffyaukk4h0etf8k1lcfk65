import { afterEach, describe, expect, it, vi } from "vitest";
import { generateCopyForPlatform } from "./gemini";
import { contextFromText } from "./source";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

describe("source normalization", () => {
  it("derives a campaign context from a written brief without fabricating metadata", () => {
    const context = contextFromText("# Orbit Notes\n\nA calmer way for product teams to capture, sort, and revisit research notes.");

    expect(context).toMatchObject({
      name: "Orbit Notes",
      sourceKind: "manual",
      screenshots: [],
      developer: undefined,
      rating: undefined,
    });
    expect(context.description).toContain("calmer way for product teams");
  });
});

describe("Gemini fallback ordering", () => {
  it("tries every configured model with the first API key before moving to the next key", async () => {
    process.env.GEMINI_API_BASE_URL = "https://gemini.test/v1beta";
    process.env.GEMINI_API_KEY_1 = "first-key";
    process.env.GEMINI_API_KEY_2 = "second-key";
    delete process.env.GEMINI_API_KEY_3;
    delete process.env.GEMINI_API_KEY_4;
    process.env.GEMINI_MODEL_1 = "model-one";
    process.env.GEMINI_MODEL_2 = "model-two";
    delete process.env.GEMINI_MODEL_3;
    delete process.env.GEMINI_MODEL_4;

    const attemptedUrls: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (input: string) => {
      attemptedUrls.push(input);
      if (input.includes("model-two") && input.includes("first-key")) {
        return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: '{"content":"Orbit Notes keeps research in reach."}' }] } }] }), { status: 200 });
      }
      return new Response("unavailable", { status: 503 });
    }));

    const output = await generateCopyForPlatform(
      { name: "Orbit Notes", description: "A calmer way to capture research notes.", screenshots: [], sourceKind: "manual" },
      "twitter"
    );

    expect(output.content).toBe("Orbit Notes keeps research in reach.");
    expect(attemptedUrls).toHaveLength(2);
    expect(attemptedUrls[0]).toContain("model-one");
    expect(attemptedUrls[0]).toContain("first-key");
    expect(attemptedUrls[1]).toContain("model-two");
    expect(attemptedUrls[1]).toContain("first-key");
  });
});
