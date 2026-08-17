# PITCHFORGE — Run Guide

Full-stack app: React (Vite) client + Node/tRPC server, MySQL via Drizzle, Clerk auth, Gemini for text generation, Cloudflare Workers AI (FLUX.1 schnell) for images. Billing is stubbed to "coming soon" — Stripe removed.

**Live demo:** https://pinchforge.chinmayshinde.tech  
**Demo video:** https://www.youtube.com/watch?v=tRQB1lFF2WA

---

## 1. Requirements

- Node.js 20+
- npm
- A MySQL database (TiDB Serverless free tier recommended, or Railway MySQL plugin, or any MySQL 8+)

---

## 2. Get your keys

| Key | Where to get it |
|---|---|
| `DATABASE_URL` | Your MySQL host connection string |
| `VITE_CLERK_PUBLISHABLE_KEY` | [clerk.com](https://clerk.com) → create app → enable Google sign-in → API Keys |
| `CLERK_SECRET_KEY` | Same Clerk app → API Keys |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) → Get API key (free tier works) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard → right sidebar |
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens → Create Token → "Workers AI" template |
| `JWT_SECRET` | Any long random string — `openssl rand -hex 32` |

AWS S3 / imgbb keys are optional — skip for image persistence to fallback to inline base64.

---

## 3. Local setup

```bash
npm install --legacy-peer-deps
cp .env.example .env
# fill in .env with the keys above
npm run db:push      # creates all tables
npm run dev          # http://localhost:3000
```

**First-run checklist:**
1. Open http://localhost:3000, sign in with Google
2. Set `OWNER_OPEN_ID` to your Clerk user ID in `.env`, restart — unlocks admin panels
3. Generate a test campaign from "Write it in" mode
4. Try generating an image inside a saved campaign

---

## 4. Build for production

```bash
npm run build    # vite build + esbuild server bundle → dist/
npm start        # runs dist/index.js in production mode
```

The client calls the API via a relative `/api/trpc` path — no backend URL is hardcoded anywhere. Whatever domain serves the app, the frontend talks to it automatically.

---

## 5. Deploy to Railway

1. Push this repo to GitHub (`.env` stays out of git — see `.gitignore`)
2. Railway → New Project → Deploy from GitHub repo
3. Build command: `npm install --legacy-peer-deps && npm run build`
4. Start command: `npm start`
5. Variables tab — paste every key from `.env`
6. After first deploy → Railway Shell → `npm run db:push`
7. Clerk dashboard → add your Railway/custom domain to allowed origins
8. TiDB (if used) → Connect → IP allowlist → add `0.0.0.0/0`
9. Smoke test from incognito: generate → export → publish microsite

---

## 6. Common gotchas

- **`npm install` fails** → add `--legacy-peer-deps` (vite 7 peer conflict with a dev-only plugin, harmless)
- **Sign-in loop** → Clerk publishable/secret key mismatch (test vs live keys, or wrong app)
- **"GEMINI_API_KEY is not set"** → `.env` not loaded, restart after editing
- **Image generation 401** → Cloudflare token missing `Workers AI: Edit` permission
- **TiDB "Access denied"** → password contains unencoded special characters (`@ : / % # ?`) — URL-encode them
- **TiDB "Unknown database"** → use `test` (default) or create the named DB first
- **`db:push` times out on new machine** → add your IP to TiDB's allowlist

---

## Feature summary

**Generation**
- 6-platform copy from URL / brief upload / manual description
- 7 languages — English, Spanish, French, Hindi, German, Portuguese, Japanese (native, not translated)
- "Try a sample app" one-click loader for guests
- Per-platform regenerate, A/B variant generator with AI critic auto-pick
- 6-angle tone toggle (casual, professional, developer, consumer, bold, minimal)

**Quality & positioning engines (deterministic — zero AI)**
- ASO scoring — A–F grade, per-rule breakdown, auto-expands after generation
- Launch readiness checklist — 10 pass/warn/fail checks
- Category benchmark score — heuristic comparison against category norms
- iOS keyword field packer — greedy knapsack, 100-char budget, real-time re-optimise
- "Why this copy" reasoning panel — extracted signals → copy explanation

**AI-assisted**
- Competitor positioning map — 3–4 plausible comparables, labeled illustrative

**Publishing & sharing**
- Per-card copy button (scoped to that platform's text only)
- Twitter/X pre-filled compose intent
- LinkedIn clipboard-copy + compose-open (text prefill deprecated by LinkedIn)
- Discord auto-publish via user-owned webhook (signed-in only)
- WhatsApp, Telegram, Email, Facebook, Reddit one-click share
- Copy all platforms — all 6 outputs as a formatted single doc
- Markdown export
- PDF export (real downloadable file via jspdf)
- Public campaign microsite at `/c/slug` (signed-in only to create)

**Ongoing use**
- Changelog / "What's New" generator — version + changes → 5-platform release notes
- Review response drafter — review + stars → tone-matched developer response, 3 sample reviews preloaded

**Guest access**
- Everything above works without an account except saved history, A/B variants, Discord publish, and visuals beyond 10/7-day allowance
- Guest summary card after generation shows real campaign stats with sign-in CTA

---

## Notes

- Never commit `.env` — gitignored. Only `.env.example` (empty placeholders) is tracked.
- `drizzle/` holds schema + migrations — `npm run db:push` applies them.
- Discord auto-publish needs no server-side key — each user pastes their own channel webhook URL (Discord → Channel Settings → Integrations → Webhooks) directly in the app.
- Free-tier hosts may sleep on inactivity — fine for judging, not for production scale.
