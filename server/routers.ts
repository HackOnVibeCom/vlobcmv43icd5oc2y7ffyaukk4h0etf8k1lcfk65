import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { campaignsRouter } from "./routers/campaigns";
import { billingRouter } from "./routers/billing";
import { adminRouter } from "./routers/admin";
import { generatorRouter } from "./routers/generator";
import { publishRouter } from "./routers/publish";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(() => ({ success: true } as const)),
  }),
  campaigns: campaignsRouter,
  billing: billingRouter,
  admin: adminRouter,
  generator: generatorRouter,
  publish: publishRouter,
});

export type AppRouter = typeof appRouter;
