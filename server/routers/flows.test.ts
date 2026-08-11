import { afterEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  getCampaignForUser: vi.fn(),
  setCampaignOutput: vi.fn(),
  getImageUsageForPeriod: vi.fn(),
  incrementImageUsage: vi.fn(),
  getGuestImageAllowance: vi.fn(),
  consumeGuestImageCredit: vi.fn(),
  saveCampaignImage: vi.fn(),
  createCampaign: vi.fn(),
}));

const gemini = vi.hoisted(() => ({
  generateCopyForPlatform: vi.fn(),
  generateAllPlatformCopy: vi.fn(),
  createImagePrompt: vi.fn(),
  PLATFORMS: ["appStore", "googlePlay", "twitter", "instagram", "linkedin", "productHunt"],
}));

const imageService = vi.hoisted(() => ({ generateImage: vi.fn() }));

vi.mock("../db", () => db);
vi.mock("../services/gemini", () => gemini);
vi.mock("../_core/imageGeneration", () => imageService);

import { campaignsRouter } from "./campaigns";
import { generatorRouter } from "./generator";
import { getPremiumPriceId } from "../products";

const user = {
  id: 42,
  openId: "clerk-user-42",
  name: "Campaign Member",
  email: "member@example.com",
  loginMethod: "clerk",
  role: "user" as const,
  plan: "free" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const context = { name: "Orbit", description: "A deliberate research workspace for product teams.", screenshots: [], sourceKind: "manual" as const };

afterEach(() => vi.clearAllMocks());

describe("authenticated campaign flows", () => {
  it("returns a saved campaign review only within the signed-in owner boundary", async () => {
    const savedCampaign = { id: 9, userId: 42, name: "Orbit launch", outputs: [], images: [] };
    db.getCampaignForUser.mockResolvedValue(savedCampaign);
    const caller = campaignsRouter.createCaller({ user } as never);

    await expect(caller.get({ campaignId: 9 })).resolves.toEqual(savedCampaign);
    expect(db.getCampaignForUser).toHaveBeenCalledWith(9, 42);
  });

  it("persists an inline campaign-copy edit only for a campaign owned by the caller", async () => {
    db.getCampaignForUser.mockResolvedValue({ id: 9, userId: 42 });
    const caller = campaignsRouter.createCaller({ user } as never);

    await expect(caller.saveOutput({ campaignId: 9, platform: "twitter", content: "Orbit makes research easier to revisit.", characterLimit: 280 })).resolves.toEqual({ success: true });
    expect(db.getCampaignForUser).toHaveBeenCalledWith(9, 42);
    expect(db.setCampaignOutput).toHaveBeenCalledWith(9, expect.objectContaining({ platform: "twitter", characterCount: 39 }));
  });

  it("regenerates a saved platform output from the stored source context", async () => {
    db.getCampaignForUser.mockResolvedValue({ id: 9, contextJson: JSON.stringify(context) });
    gemini.generateCopyForPlatform.mockResolvedValue({ platform: "linkedin", content: "A steadier research practice for product teams.", characterCount: 46, characterLimit: 1300 });
    const caller = generatorRouter.createCaller({ user } as never);

    const result = await caller.regeneratePlatform({ campaignId: 9, platform: "linkedin" });
    expect(result.platform).toBe("linkedin");
    expect(gemini.generateCopyForPlatform).toHaveBeenCalledWith(context, "linkedin");
    expect(db.setCampaignOutput).toHaveBeenCalledWith(9, result);
  });

  it("blocks a free member after the monthly 20-image allowance is exhausted", async () => {
    db.getCampaignForUser.mockResolvedValue({ id: 9, contextJson: JSON.stringify(context) });
    db.getImageUsageForPeriod.mockResolvedValue({ imageGenerationCount: 20 });
    const caller = generatorRouter.createCaller({ user } as never);

    await expect(caller.generateImage({ campaignId: 9 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("returns the signed-in free visual balance and the unlimited Premium state used by the image panel", async () => {
    db.getImageUsageForPeriod.mockResolvedValue({ imageGenerationCount: 6 });
    const freeCaller = generatorRouter.createCaller({ user } as never);
    const premiumCaller = generatorRouter.createCaller({ user: { ...user, plan: "premium" } } as never);

    await expect(freeCaller.imageUsage()).resolves.toMatchObject({ plan: "free", isPremium: false, used: 6, limit: 20, remaining: 14 });
    await expect(premiumCaller.imageUsage()).resolves.toMatchObject({ plan: "premium", isPremium: true, limit: null, remaining: null });
  });
});

describe("guest image allowance", () => {
  const guestContext = { user: null, guestId: "guest-allowance-42" } as never;

  it("reports ten image credits for a new guest without affecting signed-in usage", async () => {
    db.getGuestImageAllowance.mockResolvedValue(undefined);
    const guestCaller = generatorRouter.createCaller(guestContext);
    const signedInCaller = generatorRouter.createCaller({ user } as never);

    await expect(guestCaller.guestImageUsage()).resolves.toMatchObject({ used: 0, limit: 10, remaining: 10 });
    await expect(signedInCaller.guestImageUsage()).resolves.toBeNull();
  });

  it("creates a guest visual through the guest identifier and decrements only the guest allowance", async () => {
    db.getGuestImageAllowance.mockResolvedValue(undefined);
    db.consumeGuestImageCredit.mockResolvedValue({ used: 1, remaining: 9, expiresAt: new Date("2026-08-22T00:00:00.000Z") });
    gemini.createImagePrompt.mockReturnValue("A thoughtful visual direction for Orbit.");
    imageService.generateImage.mockResolvedValue({ url: "https://images.example/guest-orbit.png" });
    const caller = generatorRouter.createCaller(guestContext);

    await expect(caller.generateGuestImage({ context })).resolves.toMatchObject({ url: "https://images.example/guest-orbit.png", remaining: 9 });
    expect(db.consumeGuestImageCredit).toHaveBeenCalledWith("guest-allowance-42", 10);
    expect(db.saveCampaignImage).not.toHaveBeenCalled();
  });

  it("blocks a guest when all ten image credits are used", async () => {
    db.getGuestImageAllowance.mockResolvedValue({ imageGenerationCount: 10 });
    const caller = generatorRouter.createCaller(guestContext);

    await expect(caller.generateGuestImage({ context })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(imageService.generateImage).not.toHaveBeenCalled();
  });
});

describe("Premium product configuration", () => {
  it("reads the Premium checkout price from environment configuration instead of application source", () => {
    const previous = process.env.STRIPE_PREMIUM_PRICE_ID;
    process.env.STRIPE_PREMIUM_PRICE_ID = "price_pitchforge_premium";
    expect(getPremiumPriceId()).toBe("price_pitchforge_premium");
    process.env.STRIPE_PREMIUM_PRICE_ID = previous;
  });
});
