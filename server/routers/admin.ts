import { z } from "zod";
import { adminProcedure, router } from "../_core/trpc";
import { findUserForManualPremium, getManualPremiumAudit, setManualPremiumEntitlement } from "../db";

const emailInput = z.object({ email: z.string().trim().toLowerCase().email("Enter a valid member email address.") });
const auditInput = z.object({ search: z.string().trim().max(120).optional() });

export const adminRouter = router({
  findMember: adminProcedure.input(emailInput).query(async ({ input }) => {
    const member = await findUserForManualPremium(input.email);
    return member ?? null;
  }),

  setManualPremium: adminProcedure.input(z.object({
    targetUserId: z.number().int().positive(),
    action: z.enum(["grant", "revoke"]),
    note: z.string().trim().max(280).optional(),
  })).mutation(async ({ ctx, input }) => {
    return setManualPremiumEntitlement({ ...input, grantedByUserId: ctx.user.id });
  }),

  manualPremiumAudit: adminProcedure.input(auditInput).query(({ input }) => getManualPremiumAudit(input.search)),

  manualPremiumAuditExport: adminProcedure.input(auditInput).query(async ({ input }) => ({
    ...(await getManualPremiumAudit(input.search)),
    exportedAt: new Date(),
  })),
});
