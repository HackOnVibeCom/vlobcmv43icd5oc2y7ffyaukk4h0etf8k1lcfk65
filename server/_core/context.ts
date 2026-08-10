import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { getClerkSecretKey } from "../config";
import { getUserByOpenId, upsertUser } from "../db";
import { randomUUID } from "node:crypto";
import { getSessionCookieOptions } from "./cookies";

const GUEST_COOKIE_NAME = "pf_guest_image";

function readCookie(header: string | undefined, name: string) {
  const pair = header?.split(";").map(value => value.trim()).find(value => value.startsWith(`${name}=`));
  return pair?.slice(name.length + 1);
}

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  guestId: string | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  const authorization = opts.req.headers.authorization;
  const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : undefined;

  if (token) {
    try {
      const secretKey = getClerkSecretKey();
      const sessionClaims = await verifyToken(token, { secretKey });
      const clerkUserId = sessionClaims.sub;
      if (clerkUserId) {
        let localUser = await getUserByOpenId(clerkUserId);
        if (!localUser) {
          const clerk = createClerkClient({ secretKey });
          const clerkUser = await clerk.users.getUser(clerkUserId);
          await upsertUser({
            openId: clerkUserId,
            name: clerkUser.fullName ?? clerkUser.firstName ?? null,
            email: clerkUser.primaryEmailAddress?.emailAddress ?? null,
            loginMethod: "clerk",
          });
          localUser = await getUserByOpenId(clerkUserId);
        }
        user = localUser ?? null;
      }
    } catch {
      user = null;
    }
  }

  let guestId: string | null = null;
  if (!user) {
    const existingGuestId = readCookie(opts.req.headers.cookie, GUEST_COOKIE_NAME);
    guestId = existingGuestId && /^[a-z0-9-]{20,64}$/i.test(existingGuestId) ? existingGuestId : randomUUID();
    if (!existingGuestId) opts.res.cookie(GUEST_COOKIE_NAME, guestId, { ...getSessionCookieOptions(opts.req), maxAge: 7 * 24 * 60 * 60 * 1000 });
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    guestId,
  };
}
