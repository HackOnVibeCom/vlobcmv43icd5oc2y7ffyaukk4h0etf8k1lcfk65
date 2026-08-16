# PITCHFORGE

Turn one app description (store URL, brief, or freeform text) into launch copy, visuals, and SEO/PR assets for every platform — App Store, Google Play, X/Twitter, Instagram, LinkedIn, Product Hunt — plus supporting tooling (scoring, compliance, localization, publishing).

## Stack

| Layer    | Tech |
|---|---|
| Frontend | React + Vite, Tailwind, wouter (routing), TanStack Query via tRPC |
| Backend  | Node (tsx/esbuild), tRPC |
| DB       | MySQL via Drizzle ORM |
| Auth     | Clerk |
| AI text  | Google Gemini (fallback ladder across models) |
| AI image | Cloudflare Workers AI — FLUX.1 [schnell] |
| Storage  | Cloudflare R2, AWS S3, or imgbb.com (no card needed) for generated images — tried in that order. Falls back to inline base64 if none are configured. |
| Publish  | Discord webhook (user-supplied per campaign) |

Payments are **not wired up**: the Premium plan is display-only and its button on the pricing page shows "Coming soon" (disabled). There is no Stripe integration, checkout, or webhook in this codebase — owners can still grant Premium manually per-user via the admin panel (`ManualPremiumPanel.tsx`).

## Project layout

```
client/src/          React app
  components/         Feature panels, one file per feature (see table below)
  pages/               Routed pages (Home, Workspace, CampaignMicrosite, legal, marketing)
  contexts/            ThemeContext (dark/light)
  index.css            Design tokens + all component styles

server/
  routers/             tRPC routers — generator.ts is the main one
  services/            Business logic — one file per feature, pure where possible
  _core/               env, trpc setup, image generation, http bootstrap
  db.ts                Drizzle queries
  config.ts            Gemini/Clerk/Stripe config getters

drizzle/               Schema + migrations
```

## Feature status (29 / 37 wired)

Tier legend: **S** = core/flagship, **A** = high value, **B** = solid, **C** = filler/nice-to-have.

| # | Feature | Tier | Where |
|---|---|---|---|
| 1 | ASO scoring | S | `services/listingScore.ts`, `ASOScorePanel.tsx` |
| 2 | Version diff/history | S | `outputVersions` (router), `VersionHistory.tsx` |
| 3 | Cross-app pattern learning | S | `services/patternInsights.ts`, `InsightsWidget.tsx` |
| 4 | Auto-publish (Discord) | S | `services/discordPublish.ts`, `routers/publish.ts`, `PublishPanel.tsx` |
| 5 | Compliance checker | S | `services/complianceChecker.ts`, `ComplianceChecker.tsx` |
| 6 | Competitor map | S | `services/competitorMap.ts`, `CompetitorMap.tsx` |
| 7 | Localization | S | `services/localization.ts`, `LocalizationPanel.tsx` |
| 8 | A/B auto-pick | S | `services/abVariants.ts`, `ABVariantPanel.tsx` |
| 9 | Launch checklist | S | `services/launchChecklist.ts`, `LaunchChecklist.tsx` |
| 10 | Microsite | S | `routers/campaigns.ts`, `MicrositeButton.tsx`, `pages/CampaignMicrosite.tsx` |
| 11 | Reasoning panel | S | `services/reasoning.ts`, `ReasoningPanel.tsx` |
| 12 | Pricing calculator | S | `pages/PublicPages.tsx` (Pricing) |
| 13 | Character meters | S | inline in `GeneratorStudio.tsx` output cards |
| 14 | Tone/regen control | S | `regeneratePlatform` (router), `GeneratorStudio.tsx` |
| 15 | Export bundle | S | `downloadCampaign()` in `GeneratorStudio.tsx` |
| **16** | **Dark/light theme toggle** | C | `contexts/ThemeContext.tsx`, toggle in `PublicChrome.tsx` |
| **17** | **Onboarding tour** | C | `OnboardingTour.tsx`, mounted in `DashboardLayout.tsx` |
| **18** | **Campaign templates library** | C | `campaignTemplates.ts`, picker in `GeneratorStudio.tsx` |
| 19 | Team/multi-user collaboration | C | *not built* |
| 20 | Browser extension | C | *not built* |
| 21 | Landing page generator | S | *excluded — explicit product decision* |
| 22 | Keyword research | A | `services/keywordResearch.ts`, `KeywordResearch.tsx` |
| 23 | Keyword packer | A | `services/keywordPacker.ts`, `KeywordPacker.tsx` |
| 24 | Readability score | A | `services/readabilityScore.ts`, `ReadabilityScore.tsx` |
| 25 | PR angles | A | `services/prAngles.ts`, `PRAngles.tsx` |
| 26 | FAQ generator | A | `services/faqGenerator.ts`, `FAQGenerator.tsx` |
| 27 | Multi-page site generator | A | *blocked — depends on #21* |
| **28** | **Alt-text / image SEO** | A | `services/altTextGenerator.ts`, `AltTextPanel.tsx` |
| **29** | **Schema-rich review/rating snippet** | A | `services/ratingSnippet.ts`, `RatingSnippet.tsx` |
| 30 | Comparison-page generator | A | *blocked — depends on #21* |
| 31 | SEO preview | A | `services/seoPreview.ts`, `SEOPreview.tsx` |
| **32** | **Meta description char-limit meter** | B | `services/metaLimitMeter.ts`, `MetaLimitMeter.tsx` |
| 33 | Sitemap/robots.txt download | B | *blocked — depends on #21* |
| 34 | Slug/URL suggestion generator | B | *blocked — depends on #21* |
| **35** | **Blog post title/outline generator** | C | `services/blogOutline.ts`, `BlogOutline.tsx` |
| **36** | **Email subject-line SEO scoring** | C | `services/subjectLineScore.ts`, `SubjectLineScorer.tsx` |
| **37** | **Social preview image auto-gen** | C | `services/socialImageGenerator.ts`, `SocialImagePanel.tsx` |

Bold rows = added in the most recent build passes. `#19`/`#20` are the only remaining unblocked, unbuilt features; everything else left is blocked on `#21` (landing page generator), which is intentionally excluded.

## Data flow (per campaign)

1. User picks a source mode: **Store URL**, **Brief upload** (pdf/docx/txt/md), or **Write it in** (manual, with template picker).
2. `generator.prepare` resolves that into a `SourceContext` (name, description, category, rating, screenshots, etc.) — this is the single source of truth every downstream feature reads from.
3. `generator.generatePlatform` (×6) calls Gemini per platform, respecting each platform's character limit.
4. All the scoring/compliance/SEO/PR/localization/alt-text/rating panels run off the same `SourceContext` + generated copy — no re-extraction.
5. Signed-in users can save the campaign (`campaigns.ts` router → MySQL via Drizzle), publish to Discord, generate a public microsite, or export everything as a markdown bundle.

## Auth & billing

- **Clerk** handles sign-in/sign-up (modal), session, and `useAuth()`/`useUser()` on the client; `getClerkSecretKey()` verifies sessions server-side.
- Guests get a limited free image-generation allowance (`guestImageUsage`/`generateGuestImage`); signed-in users get a tracked per-period allowance (`imageUsage`).
- Premium is not purchasable yet — `BillingPanel.tsx` shows a disabled "Coming soon" state, and the Pricing page's Premium card matches it. An owner/admin can still grant Premium manually to a specific user through `ManualPremiumPanel.tsx` (no payment involved).

See `RUN.md` for exact setup steps, required accounts, and every environment variable.
"# PinchForge" 
