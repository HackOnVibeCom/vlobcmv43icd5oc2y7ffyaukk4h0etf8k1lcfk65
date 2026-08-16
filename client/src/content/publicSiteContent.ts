export const howItWorks = [
  {
    title: "Give the story a source",
    body: "Start with a Google Play or App Store link, drop in a PDF, DOCX, or text brief, or describe the app in your own words.",
    detail: "Store page · Brief · Manual context",
  },
  {
    title: "Make the launch language specific",
    body: "PITCHFORGE extracts the useful signal, then drafts platform-aware copy for the App Store, Google Play, X, Instagram, LinkedIn, and Product Hunt.",
    detail: "Six surfaces · One consistent voice",
  },
  {
    title: "Edit, save, and make the campaign visible",
    body: "Refine each channel, revisit saved campaigns, export the copy, and create visuals when your access level includes them.",
    detail: "Review first · Publish with intent",
  },
] as const;

export const pricingPlans = [
  {
    name: "Guest",
    price: "No account",
    summary: "A straightforward way to test the campaign desk before you save work.",
    items: ["Six platform copy drafts, in 7 languages", "Per-platform copy + one-click upload buttons", "Markdown and PDF export", "10 visuals in seven days", "No saved campaign history"],
    tone: "plain",
  },
  {
    name: "Free member",
    price: "No cost",
    summary: "For app teams ready to keep a working campaign library and iterate.",
    items: ["Saved campaigns and revisions", "20 visuals each month", "Platform-level regeneration"],
    tone: "plain",
  },
  {
    name: "Premium",
    price: "For ongoing launches",
    summary: "For teams that need unlimited visual exploration and more prompt control.",
    items: ["Unlimited campaign visuals", "Custom visual prompts", "Priority-ready campaign workspace"],
    tone: "signal",
  },
] as const;

export const faqItems = [
  {
    question: "What can I use as a source?",
    answer: "Use a supported App Store or Google Play URL, upload a PDF, DOCX, or TXT brief, or enter a manual product description. Start with the source that best reflects the app you are launching.",
  },
  {
    question: "Which platforms does PITCHFORGE write for?",
    answer: "Each campaign produces drafts for the App Store, Google Play, X, Instagram, LinkedIn, and Product Hunt. You can revise or regenerate individual platform drafts without losing the campaign context.",
  },
  {
    question: "Can I use PITCHFORGE before I sign in?",
    answer: "Yes. Guests can pick a language, generate all six platform drafts, copy or upload each one directly to its platform, export markdown or PDF, and create up to 10 visuals during a seven-day allowance — no account required. Signing in adds saved campaigns and a monthly free visual allowance.",
  },
  {
    question: "Can I generate copy in another language?",
    answer: "Yes. Choose a language before generating — English, Spanish, French, Hindi, German, Portuguese, or Japanese — and PITCHFORGE writes natively in that language rather than translating afterward. Available to guests and signed-in members alike.",
  },
  {
    question: "How do the per-platform copy and upload buttons work?",
    answer: "Each output card has its own Copy button, which copies only that platform's text. Twitter/X and LinkedIn additionally get an Upload button: X opens pre-filled with the text and link; LinkedIn's official share link only accepts a URL (they removed text prefill), so the button copies your text to the clipboard first, then opens LinkedIn's post box — paste and publish. Instagram, App Store Connect, Play Console, and Product Hunt don't expose any public compose intent, so those cards use Copy only.",
  },
  {
    question: "What is included with a free account?",
    answer: "Free members can save campaigns, revisit and edit outputs, regenerate individual platforms, and create up to 20 campaign visuals per month.",
  },
  {
    question: "Why should I review generated copy and visuals?",
    answer: "Generation is a drafting tool, not publishing approval. Review product facts, brand permissions, image details, tone, and platform requirements before anything goes live.",
  },
] as const;

export const privacySections = [
  ["What this policy covers", "This policy describes the data PITCHFORGE uses to provide its campaign workspace, including public campaign generation, authenticated saved campaigns, visual generation, and optional Premium billing flows."],
  ["Information used to run the product", "Depending on how you use PITCHFORGE, this can include the identity information supplied by your sign-in provider, campaign sources and generated outputs, saved-campaign records, visual-generation usage records, and technical information required to secure and operate the service."],
  ["How information is used", "PITCHFORGE uses this information to generate and save campaigns, apply access allowances, maintain your account experience, process Premium payments when configured, protect the service from misuse, and improve reliability."],
  ["Service providers", "PITCHFORGE uses configured providers for sign-in, payment processing, AI generation, file handling, and hosting. Those providers process information only as needed to provide their related service."],
  ["Your choices", "You can delete saved campaigns from the workspace. For account, billing, or privacy requests that cannot be handled in-product, use the contact channel made available by the site operator."],
  ["Important note", "This is a working product policy drafted for the current PITCHFORGE feature set. The site operator should obtain a qualified legal review before relying on it in a specific jurisdiction or processing regulated data."],
] as const;

export const termsSections = [
  ["Using PITCHFORGE", "You may use PITCHFORGE to draft promotional campaign materials for products and content you are authorized to describe. You are responsible for your source material, final publishing decisions, and compliance with the rules of the platforms where you publish."],
  ["Generated material", "PITCHFORGE provides generated drafts and visuals for review. It does not guarantee factual accuracy, platform approval, non-infringement, or suitability for a particular campaign. Review and revise every output before publication."],
  ["Accounts and allowances", "Guest, free-member, and Premium access each have different product features and visual-generation allowances. PITCHFORGE may enforce those allowances to maintain the service and prevent misuse."],
  ["Premium billing", "If Premium billing is made available, payment processing is handled through the configured payment provider. Pricing, renewal, cancellation, and refund terms shown at checkout govern the applicable transaction."],
  ["Acceptable use", "Do not use PITCHFORGE to violate law, impersonate another person or brand, infringe rights, distribute harmful material, or interfere with the service. Access may be limited when needed to protect the product or its users."],
  ["Important note", "These terms are a working product draft for the current PITCHFORGE feature set. The site operator should obtain a qualified legal review before using them as binding terms in a specific jurisdiction."],
] as const;
