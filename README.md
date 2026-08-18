# PITCHFORGE

> **One app link. Six launch-ready posts. Auto-published.**

[![Demo Video](https://img.shields.io/badge/▶_Watch_Demo-YouTube-red?style=for-the-badge)](https://www.youtube.com/watch?v=tRQB1lFF2WA)
[![Live App](https://img.shields.io/badge/🚀_Try_Live-No_Login_Needed-black?style=for-the-badge)](https://pinchforge.chinmayshinde.tech/live-demo)

Turn one app — a store URL, a brief, or a plain description — into launch-ready copy for six platforms at once. Score it. Fix it. Publish it. **No login required to generate, edit, export, or share.**

---

## Demo

[![PITCHFORGE Demo](https://img.youtube.com/vi/tRQB1lFF2WA/maxresdefault.jpg)](https://www.youtube.com/watch?v=tRQB1lFF2WA)

🔗 **Live:** https://pinchforge.chinmayshinde.tech  
🔗 **Try without signing in:** https://pinchforge.chinmayshinde.tech/live-demo

---

## The problem

An indie developer launching an app has to write the same story six different ways — App Store description, Play Store listing, Twitter thread, Instagram caption, LinkedIn post, Product Hunt comment — each with different character limits, different audiences, different tones. Then score it against ASO ranking factors, check for banned phrases, pack the iOS keyword field, and get it posted.

Most teams skip most of this. PITCHFORGE does all of it from one URL.

For install and deploy steps, see [RUN.md](./RUN.md). This document covers **what the product actually does.**

---

## Core generation

- **One source, six outputs** — paste a Google Play / App Store URL, upload a PDF/DOCX/TXT/MD brief, or write a manual description. PITCHFORGE extracts real signal (name, category, features, rating, screenshots) and drafts copy for:

| Platform | What gets generated | Limit |
|---|---|---|
| **App Store** | Promotional text, keyword-aware | 170 chars |
| **Google Play** | Short description | 80 chars |
| **Twitter / X** | Launch thread, hook-first | 280 chars |
| **Instagram** | Caption + hashtag set | 2,200 chars |
| **LinkedIn** | Professional announcement | 1,300 chars |
| **Product Hunt** | Maker comment, community-native | 500 chars |

- **Language selector** — generate in English, Spanish, French, Hindi, German, Portuguese, or Japanese. Copy is written natively in that language, not translated after the fact. Applies to first generation and per-platform regeneration.
- **Try a sample app** — one-click sample loader for guests. No setup required.
- **Per-platform regenerate** — redo any single platform's copy without touching the other five.
- **A/B variant generator** — two distinct angles per platform (feature-led vs story-led), with an AI critic that scores both and picks the winner automatically. No manual comparison.
- **Tone toggle** — 6 angles (casual, professional, developer, consumer, bold, minimal) applied to any generated output, visible in real time.

---

## Quality & positioning engines

### Deterministic — zero AI calls, same input always gives same output

These are rules engines, not prompts. Auditable. Consistent. Cannot be replicated by pasting into ChatGPT.

**In-App Promotion Code Integration SDK**  
Production-ready code snippets in **iOS (Swift / SwiftUI)**, **Android (Kotlin)**, **React Native**, and **Flutter (Dart)** to directly integrate in-app viral referral sheets, smart App Store rating prompts (SKStoreReviewController / Google Play In-App Review), "What's New" release note modals, and campaign deep linking.

**Live Social Banner & OpenGraph Studio (1200×630)**  
Interactive visual banner creator with customizable gradient themes (Midnight Obsidian, Electric Cobalt, Sunset Crimson, Forest Emerald, Cyber Violet), real-time text customizer, and one-click downloadable SVG / high-res graphics.

**App Store Screenshot Storyboard & Graphic Spec**  
Sequential 5-slide visual screenshot spec (Hero Hook, Core Magic, ASO Quality, Multi-Channel, and CTA) with device mockups and one-click specs export for designers.

**ASO Scoring Engine**  
Grades every output A–F against known App Store and Play Store ranking factors: character budget compliance, keyword density, structural completeness, CTA presence. Auto-expands on the first card after generation so the score is the first thing you see.

**Launch Readiness Checklist**  
10 concrete pass / warn / fail checks: app name within 30-char limit, description length, screenshot count, no placeholder text, no unverifiable superlatives, developer name present, keyword diversity, and more. Shows a "Ready" or "Needs attention" badge.

**Category Benchmark Score**  
Checks description depth, rating presence, developer identity, and screenshot count against category-relative norms (games, productivity, social, finance, health, education). Labeled as a heuristic, not live competitor data — gives useful direction without a false sense of certainty.

**iOS Keyword Field Packer**  
Greedy knapsack solver that maximises keyword coverage within App Store's hard 100-character budget. Add custom keywords, watch the packer re-optimise. Coverage bar shows % of budget used.

**App Store Subtitle & Tagline Matrix**  
Generates 5 distinct high-converting angles for 30-character App Store Subtitles, Google Play taglines, and Product Hunt 60-character punchlines with live character validation gauges.

**Anti-Self-Promotion & Spam Risk Scorer**  
Deterministic scoring engine analyzing copy authenticity against promotional buzzwords, technical depth, and feedback solicitation for Hacker News and Reddit community guidelines.

**"Why This Copy" Reasoning Panel**  
Shows exactly which extracted signals (category, rating, keyword frequency, screenshot count) shaped each output. Uses the same scoring engine as the ASO grade — explanation and score never contradict each other.

### AI-assisted

**Competitor Positioning Map**  
Names 3–4 plausible category-comparable apps with a one-line factual contrast for each, plus a positioning summary. Click-to-generate, clearly labeled as illustrative rather than verified live market data.

**Interactive Social & Store Feed Mockups**  
Live pixel-perfect visual previews of generated copy formatted natively for Twitter/X, LinkedIn, Instagram, Apple App Store, Google Play Store, and Product Hunt.

---

## Publishing, scheduling & sharing

**Per output card — scoped to that card's own text only:**

- **Live Feed Mockup** — preview the post in its realistic native social or store feed format with 1 click
- **Copy button** — copies only that platform's generated text
- **Upload to Platform** — Twitter/X and LinkedIn only (the only two with a real public compose intent):
  - X opens fully pre-filled with text and source link
  - LinkedIn's official endpoint accepts a URL only (they deprecated text prefill) — button copies text to clipboard first, then opens LinkedIn's post box with the link. Paste, then post.
  - Instagram, App Store Connect, Play Console, Product Hunt have no public compose intent — those cards show **Copy only**, with a toast confirming where to paste
- **Multi-Channel Auto-Publish Hub** — connect Discord, Slack incoming webhooks, Telegram bot/channel, or Custom Webhooks (Zapier/Make.com). Includes 1-click batch dispatch across all connected destinations.
- **Launch Day T-Minus Scheduler & Calendar (.ics) Export** — complete day-by-day and hour-by-hour launch roadmap from T-7 days to Launch Day with downloadable RFC 5545 `.ics` calendar events for Apple/Google/Outlook Calendar.
- **Press, Newsletter & Creator Pitch Drafter** — tailored email pitches with one-click `mailto:` composer and clipboard copy.
- **Hacker News (Show HN) & Reddit Launch Studio** — authentic community post drafter with built-in Anti-Spam scoring.
- **One-click share links** — WhatsApp, Telegram, Email, Facebook, Reddit — each opens that platform's native share dialog pre-filled where allowed
- **Copy all platforms** — one click copies all 6 finished outputs, formatted, as a single doc
- **Export markdown** — full 6-platform campaign as `.md`
- **Export PDF** — full campaign as a real downloadable `.pdf` (via `jspdf`, code-split so it doesn't bloat the main bundle)

---

## Ongoing use — post-launch

**Changelog / "What's New" Generator**  
Version number + change summary → release notes for all 5 relevant platforms at once. Turns PITCHFORGE from a one-time launch tool into an ongoing workflow.

**Review Response Drafter**  
Paste a store review + star rating → developer response draft, tone-matched (empathetic for 1-2 stars, constructive for 3, grateful for 4-5). Ships with 3 preloaded sample reviews for guest demo mode. Recurring task nobody else addressed.

---

## Guest experience

Every feature above — generation in any of 7 languages, per-platform copy/upload, feed mockups, launch scheduler with `.ics` export, press drafter, community launch studio, subtitle matrix, all export formats, all quality engines, changelog and review tools — works **fully without an account**. No feature is gated behind sign-in except:

- Saving campaigns to persistent history
- A/B variant generation (needs a saved campaign)
- Webhook auto-publish channel saving (guests can still run instant live simulations and URL tests!)
- Campaign visuals beyond 10/7-day guest allowance

A guest summary card appears after generation with real numbers from that campaign — platform count, ASO grade, checklist pass count — with a sign-in CTA. Informational, not a paywall.

---

## Access tiers

| | Guest | Free member | Premium |
|---|---|---|---|
| 6-platform copy, any language | ✅ | ✅ | ✅ |
| Tone toggle + per-platform regen | ✅ | ✅ | ✅ |
| Markdown + PDF export | ✅ | ✅ | ✅ |
| ASO score + checklist + benchmark | ✅ | ✅ | ✅ |
| Competitor positioning map | ✅ | ✅ | ✅ |
| Changelog generator | ✅ | ✅ | ✅ |
| Review response drafter | ✅ | ✅ | ✅ |
| Saved campaign history | ❌ | ✅ | ✅ |
| A/B variant generator | ❌ | ✅ | ✅ |
| Discord auto-publish | ❌ | ✅ | ✅ |
| Campaign visuals | 10 / 7 days | 20 / month | Unlimited |
| Custom image prompts | ❌ | ❌ | ✅ |

---

## Why not just use ChatGPT?

A prompt wrapper generates the same output regardless of which app you paste. PITCHFORGE extracts real store data — rating, screenshot count, category, keyword frequency — and runs it through rules engines that produce different results for every app because they are grounded in that app's actual data. The ASO score, keyword packer, and launch checklist are deterministic: same input, same output, every time, with an audit trail showing exactly why the score is what it is.

That's the difference between a tool and a prompt.

---

## What's intentionally not built

- **Silent auto-posting beyond Discord** — Twitter/X, LinkedIn, Instagram, App Store, Play Console, and Product Hunt all require OAuth to post without human confirmation. No workaround exists. What's built is the fastest path to each platform's own post box, pre-filled wherever allowed. Discord is the exception where a user-owned webhook makes real auto-publish possible.
- **LinkedIn text prefill** — LinkedIn's `share-offsite` endpoint accepts a URL only. The older `shareArticle` endpoint that accepted text is deprecated. Confirmed by direct test. Clipboard-copy + compose-open is the closest working substitute.
- **Live competitor/market data** — the competitor map and category benchmark are labeled illustrative/heuristic. Neither scrapes real-time app store data for other apps.

---

## Stack

| Layer | Technology |
|---|---|
| **Client** | React 18, Vite 7, Tailwind CSS, shadcn/ui, wouter, tRPC client |
| **Server** | Node.js, Express, tRPC, Drizzle ORM |
| **Database** | TiDB Serverless (MySQL-compatible) |
| **Auth** | Clerk — Google sign-in, guest mode |
| **AI — copy** | Google Gemini (gemini-2.0-flash, 4-model fallback ladder) |
| **AI — images** | Cloudflare Workers AI, FLUX.1 schnell |
| **Deploy** | Railway |

---

## Project layout

```
client/
  src/
    components/       GeneratorStudio, ASOScorePanel, LaunchChecklist,
                      KeywordPacker, ABVariantPanel, ToneTogglePanel,
                      PublishPanel, MicrositeButton, InsightsWidget,
                      ReasoningPanel, ChangelogGenerator,
                      ReviewResponsePanel, GuestSummaryCard, ShareLinks...
    pages/            Home, Workspace, LiveDemo, CampaignMicrosite...
server/
  _core/              Express bootstrap, tRPC context, Clerk auth, image gen
  routers/            generator · campaigns · publish · billing · admin
  services/
    gemini.ts           Copy generation — 6-platform structured output
    abVariants.ts       A/B generation + AI critic pass
    toneGenerator.ts    6-angle tone-aware regeneration
    listingScore.ts     Deterministic ASO scoring engine
    launchChecklist.ts  10-check launch readiness engine
    keywordPacker.ts    Greedy knapsack keyword optimizer
    reasoning.ts        Signal extraction → copy explanation
    patternInsights.ts  Cross-campaign engagement learning
    changelogGenerator.ts  Version update → 5-platform release notes
    reviewResponder.ts  Review + stars → developer response draft
    discordPublish.ts   Discord webhook delivery
    source.ts           URL scraping + brief/PDF extraction
drizzle/              DB schema + migrations
shared/               Types and constants
```

---

## Demo video

📺 https://www.youtube.com/watch?v=tRQB1lFF2WA

---

*Built for indie developers and small app studios who launch without a dedicated ASO team.*  
*HackOnVibe Hackathon — August 2026*
