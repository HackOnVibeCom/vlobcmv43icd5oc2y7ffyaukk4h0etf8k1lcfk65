# PITCHFORGE — Run Guide

Full-stack app: React (Vite) client + Node/tRPC server, MySQL via Drizzle, Clerk auth, Gemini for text generation, Cloudflare Workers AI (FLUX.1 schnell) for images. Billing is stubbed to "coming soon" — Stripe removed.

## 1. Requirements

- Node.js 20+
- npm (or pnpm, project was built with pnpm but npm works fine)
- A MySQL database (PlanetScale free tier, Railway MySQL plugin, or any MySQL host)

## 2. Get your keys

| Key | Where to get it |
|---|---|
| `DATABASE_URL` | Your MySQL host connection string |
| `VITE_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` | [clerk.com](https://clerk.com) → create app → enable Google sign-in as a social provider → API Keys page |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) → Get API key (free tier works) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard → right sidebar on any domain, or Workers & Pages overview |
| `CLOUDFLARE_API_TOKEN` | Cloudflare dashboard → My Profile → API Tokens → Create Token → "Workers AI" template (or custom token with `Account.Workers AI:Edit`) |
| `JWT_SECRET` | Any long random string, e.g. `openssl rand -hex 32` |

AWS S3 keys are optional — leave blank to skip persistent image storage (generated images just won't survive a server restart).

## 3. Local setup

```bash
npm install
cp .env.example .env
# fill in .env with the keys above
npm run db:push      # creates/migrates tables in DATABASE_URL
npm run dev           # starts dev server at http://localhost:3000
```

## 4. Verify it works

- Open http://localhost:3000
- Sign in with Google (via Clerk)
- Generate a campaign — text comes from Gemini, images come from Cloudflare Workers AI
- Check the Billing panel shows "Payments coming soon" (expected — no live checkout)

## 5. Build for production

```bash
npm run build     # builds client (vite) + bundles server (esbuild) into dist/
npm start          # runs dist/index.js
```

The client calls the API via a relative `/api/trpc` path — no backend URL is hardcoded anywhere in the frontend. Whatever domain serves this app, the frontend automatically talks to it. No extra config needed when you deploy.

## 6. Deploy (Railway example)

1. Push this code to your GitHub repo (`.env` stays out of git — see `.gitignore`)
2. Create a new Railway project, link the repo
3. Add a MySQL plugin (or point `DATABASE_URL` at an external MySQL host)
4. In Railway → Variables, paste every key from your local `.env`
5. Build command: `npm run build` — Start command: `npm start`
6. After first deploy, run `npm run db:push` once against the production `DATABASE_URL` (via Railway's shell, or locally with the production `DATABASE_URL` set temporarily)
7. Copy the Railway-issued public URL, paste it wherever judges/reviewers need it

## Notes

- Never commit `.env` — it's gitignored. Only `.env.example` (placeholders) is tracked.
- `patches/wouter@3.7.1.patch` is a required package patch (adds route tracking) — don't delete it, `package.json`'s `pnpm.patchedDependencies` depends on it if you use pnpm. Harmless if unused under npm.
- `drizzle/` holds the DB schema and migrations — `npm run db:push` applies them.
- Free-tier hosts (Railway free, Cloudflare Workers AI free) may sleep on inactivity or hit rate limits under heavy demo traffic — fine for judging, not built for scale.
