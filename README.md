# PITCHFORGE

Turn one app — a store URL, a brief, or a plain description — into launch-ready copy for six platforms at once. No login required to generate, edit, export, or share.

For install/deploy steps, see [RUN.md](./RUN.md). This document covers **what the product actually does.**

---

## Core generation

- **One source, six outputs** — paste a Google Play / App Store URL, upload a PDF/DOCX/TXT/MD brief, or write a manual description. PITCHFORGE extracts the real signal (name, category, features, rating) and drafts copy for:
  - App Store (promotional text, 170 chars)
  - Google Play (short description, 80 chars)
  - Twitter / X (280 chars)
  - Instagram (caption + hashtags, 2,200 chars)
  - LinkedIn (professional post, 1,300 chars)
  - Product Hunt (maker comment, 500 chars)
- **Language selector** — pick a language *before* generating: English, Spanish, French, Hindi, German, Portuguese, or Japanese. Copy is written natively in that language, not machine-translated after the fact. Applies to first generation **and** per-platform regeneration.
- **Per-platform regenerate** — redo a single platform's copy without touching the other five, in whatever language is currently selected.
- **A/B variant generator** — two distinct angles per platform, with an AI critic that picks and explains a winner.
- **Tone toggle** — 6 angles (casual, professional, developer, consumer, bold, minimal) applied to any generated platform copy.

## Quality engines (zero AI, deterministic)

- **ASO scoring** — A–F grade with a per-rule breakdown, auto-expands after generation so the score is the first thing you see.
- **Launch readiness checklist** — 10 pass/warn/fail checks against real extracted signals.
- **iOS keyword field packer** — greedy knapsack solver that fits the best keyword set into the 100-character App Store keyword field.
- **"Why this copy" reasoning panel** — shows exactly which extracted facts shaped each line, so nothing reads as invented.

## Publishing & sharing (per output card — scoped to that card's own text only)

- **Copy button** — copies only that platform's generated text. Never the whole campaign.
- **Upload to `<Platform>` button** — Twitter/X and LinkedIn only, the only two platforms with a real public compose intent:
  - **X** opens fully pre-filled with the text and source link.
  - **LinkedIn**'s official share endpoint accepts a URL only — they deprecated text prefill — so the button copies the text to your clipboard first, then opens LinkedIn's post box with the link attached. Paste, then post.
  - Instagram, App Store Connect, Play Console, and Product Hunt expose no public compose/prefill intent at all. Those cards get **Copy only** — click Copy, then paste into that platform's own post/listing screen (the toast confirms this on click).
- **Additional one-click share links** — WhatsApp, Telegram, Email, Facebook, Reddit (each opens that platform's own native share dialog, pre-filled where the platform allows it).
- **Copy all platforms** — one click copies all 6 finished outputs, formatted, as a single doc.
- **Export markdown** — full 6-platform campaign as a `.md` file.
- **Export PDF** — full 6-platform campaign as an actual downloadable `.pdf` file (via `jspdf`, code-split so it doesn't bloat the main bundle).

## Ongoing use (post-launch)

- **Changelog / "What's New" generator** — version number + change summary → release notes for all 5 relevant platforms at once.
- **Review response drafter** — paste a review + star rating → a developer response draft. Ships with 3 preloaded sample reviews for guest demo mode.

## Guest experience

Every feature above — generation in any of the 7 languages, per-platform copy/upload, all export formats, quality engines, changelog and review tools — works **fully without an account**. No feature is gated behind sign-in except:

- Saving a campaign to a persistent history
- A/B variant generation (needs a saved campaign to regenerate against)
- Auto-publish integrations
- Campaign visuals beyond the 10-visual, 7-day guest allowance (20/month once signed in)

A guest summary card appears after generation showing platform count and a sign-up CTA — informational, not a paywall.

## Access tiers

| | Guest | Free member | Premium |
|---|---|---|---|
| 6-platform copy, any language | ✅ | ✅ | ✅ |
| Per-platform copy + upload buttons | ✅ | ✅ | ✅ |
| Markdown + PDF export | ✅ | ✅ | ✅ |
| Saved campaign history | ❌ | ✅ | ✅ |
| Campaign visuals | 10 / 7 days | 20 / month | Unlimited |
| Custom image prompts | ❌ | ❌ | ✅ |

## What's intentionally *not* built

- **Silent auto-posting** to any platform — every social platform requires an authenticated, OAuth-registered API integration to post without a human clicking "Post" themselves. No workaround exists (and shouldn't — it'd bypass the platform's own review/consent step). What's built instead is the fastest available path to that platform's own post box, pre-filled wherever the platform allows it.
- **LinkedIn text prefill** — LinkedIn's current `share-offsite` endpoint accepts a URL only; the older `shareArticle` endpoint that accepted title/summary text is deprecated and LinkedIn now ignores those parameters. Confirmed by direct test. Clipboard-copy + compose-box-open is the closest working substitute.

## Tech

React (Vite) client, Node/tRPC server, MySQL via Drizzle, Clerk auth, Gemini for text generation, Cloudflare Workers AI (FLUX.1 schnell) for images, jsPDF for PDF export. See [RUN.md](./RUN.md) for setup and deploy.
