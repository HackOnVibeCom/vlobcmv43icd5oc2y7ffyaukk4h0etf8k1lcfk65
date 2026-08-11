import { describe, expect, it, vi } from "vitest";

const adminCalls = vi.hoisted(() => ({ find: vi.fn(), change: vi.fn(), audit: vi.fn() }));

vi.mock("../db", () => ({
  findUserForManualPremium: adminCalls.find,
  setManualPremiumEntitlement: adminCalls.change,
  getManualPremiumAudit: adminCalls.audit,
}));

import { adminRouter } from "./admin";

const owner = { id: 1, openId: "owner", name: "Owner", email: "owner@example.com", loginMethod: "clerk", role: "admin" as const, plan: "premium" as const, stripeCustomerId: null, stripeSubscriptionId: null, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };
const member = { ...owner, id: 52, name: "Campaign Member", email: "member@example.com", role: "user" as const, plan: "free" as const };

describe("owner manual Premium router", () => {
  it("blocks non-owners before they can find or change a member", async () => {
    const caller = adminRouter.createCaller({ user: member } as never);
    await expect(caller.findMember({ email: "member@example.com" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(adminCalls.find).not.toHaveBeenCalled();
  });

  it("blocks a member from reading or exporting the manual Premium audit", async () => {
    const caller = adminRouter.createCaller({ user: member } as never);
    await expect(caller.manualPremiumAudit({ search: "member" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.manualPremiumAuditExport({ search: "member" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(adminCalls.audit).not.toHaveBeenCalled();
  });

  it("finds a member and records a manual Premium grant under the authenticated owner", async () => {
    adminCalls.find.mockResolvedValue({ id: 52, name: "Campaign Member", email: "member@example.com", plan: "free", stripeSubscriptionId: null });
    adminCalls.change.mockResolvedValue({ id: 52, name: "Campaign Member", email: "member@example.com", plan: "premium", stripeSubscriptionId: null });
    const caller = adminRouter.createCaller({ user: owner } as never);
    await expect(caller.findMember({ email: "MEMBER@example.com" })).resolves.toMatchObject({ id: 52, plan: "free" });
    await expect(caller.setManualPremium({ targetUserId: 52, action: "grant", note: "Launch partner access" })).resolves.toMatchObject({ plan: "premium" });
    expect(adminCalls.change).toHaveBeenCalledWith({ targetUserId: 52, grantedByUserId: 1, action: "grant", note: "Launch partner access" });
  });

  it("returns mapped audit records for owners and preserves their search term for CSV export", async () => {
    const audit = { members: [{ id: 9, targetEmail: "premium@example.com", action: "grant" }], events: [{ id: 10, targetEmail: "premium@example.com", action: "grant", note: "Partner" }] };
    adminCalls.audit.mockResolvedValue(audit);
    const caller = adminRouter.createCaller({ user: owner } as never);
    await expect(caller.manualPremiumAudit({ search: "premium" })).resolves.toBe(audit);
    await expect(caller.manualPremiumAuditExport({ search: "premium" })).resolves.toMatchObject({ members: audit.members, events: audit.events });
    expect(adminCalls.audit).toHaveBeenNthCalledWith(1, "premium");
    expect(adminCalls.audit).toHaveBeenNthCalledWith(2, "premium");
  });
});
