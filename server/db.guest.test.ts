import { describe, expect, it, vi } from "vitest";
const guestDb = vi.hoisted(() => {
  const limit = vi.fn();
  const where = vi.fn(() => ({ limit }));
  const from = vi.fn(() => ({ where }));
  const select = vi.fn(() => ({ from }));
  const onDuplicateKeyUpdate = vi.fn();
  const values = vi.fn(() => ({ onDuplicateKeyUpdate }));
  const insert = vi.fn(() => ({ values }));
  const updateWhere = vi.fn();
  const set = vi.fn(() => ({ where: updateWhere }));
  const update = vi.fn(() => ({ set }));
  return { select, from, where, limit, insert, values, onDuplicateKeyUpdate, update, set, updateWhere };
});

vi.mock("drizzle-orm/mysql2", () => ({ drizzle: vi.fn(() => guestDb) }));

import { consumeGuestImageCredit, isGuestImageAllowanceActive } from "./db";

describe("guest image allowance expiry", () => {
  const now = new Date("2026-08-15T00:00:00.000Z");

  it("treats an allowance at or before its expiry as unavailable so a new seven-day window can begin", () => {
    expect(isGuestImageAllowanceActive({ expiresAt: new Date("2026-08-14T23:59:59.999Z") }, now)).toBe(false);
    expect(isGuestImageAllowanceActive({ expiresAt: now }, now)).toBe(false);
  });

  it("keeps a future guest allowance active within its seven-day window", () => {
    expect(isGuestImageAllowanceActive({ expiresAt: new Date("2026-08-22T00:00:00.000Z") }, now)).toBe(true);
  });

  it("resets an expired allowance and starts a fresh seven-day ten-credit window when the next image is consumed", async () => {
    const previousUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = "mysql://guest-allowance-test";
    const freshExpiry = new Date("2026-08-22T00:00:00.000Z");
    guestDb.limit
      .mockResolvedValueOnce([{ guestId: "guest-42", imageGenerationCount: 10, expiresAt: new Date("2026-08-14T00:00:00.000Z") }])
      .mockResolvedValueOnce([{ guestId: "guest-42", imageGenerationCount: 1, expiresAt: freshExpiry }]);
    guestDb.updateWhere.mockResolvedValue([{ affectedRows: 1 }]);

    await expect(consumeGuestImageCredit("guest-42", 10, now)).resolves.toMatchObject({ used: 1, remaining: 9, expiresAt: freshExpiry });
    expect(guestDb.insert).toHaveBeenCalledTimes(1);
    expect(guestDb.onDuplicateKeyUpdate).toHaveBeenCalledWith(expect.objectContaining({ set: expect.objectContaining({ imageGenerationCount: 0, expiresAt: freshExpiry }) }));

    process.env.DATABASE_URL = previousUrl;
  });
});
