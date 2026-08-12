import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import GeneratorStudio from "@/components/GeneratorStudio";
import { PublicChrome } from "@/components/PublicChrome";
import { PublicReveal } from "@/components/PublicRouteMotion";
import { SourceToSurfaceStory } from "@/components/SourceToSurfaceStory";
import TestExamples, { type CampaignExample } from "@/components/TestExamples";
import { faqItems, howItWorks, pricingPlans } from "@/content/publicSiteContent";
import "./home.css";
import "./public-pages.css";

const heroImage = "/assets/pitchforge-campaign-desk-hero_6c0f1950.png";

export function AboutPage() {
  return <PublicChrome><main className="pf-route-page">
    <PublicReveal><section className="pf-page-intro pf-page-intro--about"><div><p className="pf-page-kicker">The campaign desk</p><h1>Launch language begins with <span>one source of truth.</span></h1><p className="pf-page-lede">PITCHFORGE turns the useful signal in a store page or brief into copy that works natively across every launch surface.</p><Link className="pf-button" href="/live-demo">Try the live demo <ArrowRight size={17} /></Link></div><div className="pf-page-art"><img src={heroImage} alt="Editorial campaign materials in black, crimson, cobalt, and paper" /><span>CONTEXT<br />TO<br />CAMPAIGN</span></div></section></PublicReveal>
    <PublicReveal delay={70}><section className="pf-story-section"><SourceToSurfaceStory label="Interactive composition showing one source becoming six launch surfaces" scrollLabels /></section></PublicReveal>
    <PublicReveal delay={110}><section className="pf-manifest pf-manifest--page"><p>One source, kept intact.</p><div><h2>Good launch copy does not repeat the same line six times. It lets one <span>real story</span> take the right form for each channel.</h2><div className="pf-route-map" aria-label="One source becomes six campaign surfaces"><span>Source</span><i>→</i><span>AS</span><span>GP</span><span>X</span><span>IG</span><span>LI</span><span>PH</span></div></div></section></PublicReveal>
  </main></PublicChrome>;
}

export function HowItWorksPage() {
  return <PublicChrome><main className="pf-route-page"><PublicReveal><section className="pf-page-heading"><p className="pf-page-kicker">How it works</p><h1>Bring the app context once. Keep the campaign moving.</h1><p>Each stage is visible, editable, and grounded in the source you supplied.</p></section></PublicReveal><PublicReveal delay={60}><section className="pf-story-section pf-story-section--process"><SourceToSurfaceStory label="Interactive source-to-surface process model" /></section></PublicReveal><PublicReveal delay={100}><section className="pf-how pf-how--page"><div className="pf-steps">{howItWorks.map((step, index) => <article className="pf-step" key={step.title}><span className="pf-step__index">0{index + 1}</span><div><h2>{step.title}</h2><p>{step.body}</p></div><span className="pf-step__detail">{step.detail}</span></article>)}</div><Link className="pf-button pf-page-cta" href="/live-demo">See it in the live demo <ArrowDownRight size={17} /></Link></section></PublicReveal></main></PublicChrome>;
}

export function LiveDemoPage() {
  const [preset, setPreset] = useState<CampaignExample | null>(null);
  const selectPreset = (example: CampaignExample) => { setPreset(example); window.setTimeout(() => document.getElementById("studio")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); };
  return <PublicChrome><main className="pf-route-page"><PublicReveal><section className="pf-page-heading"><p className="pf-page-kicker">Live demo</p><h1>Put a working source through the real campaign desk.</h1><p>Use a clearly marked familiar-app reference or paste a source you are authorized to use. The selected source opens in the live generator below.</p></section></PublicReveal><PublicReveal delay={60}><section className="pf-demo pf-demo--page"><TestExamples onSelect={selectPreset} /></section></PublicReveal><section id="studio" className="pf-studio pf-studio--page" aria-label="PITCHFORGE campaign generator"><GeneratorStudio preset={preset} /></section></main></PublicChrome>;
}

export function PricingPage() {
  const [, setLocation] = useLocation();
  return <PublicChrome><main className="pf-route-page"><PublicReveal><section className="pf-page-heading"><p className="pf-page-kicker">Pricing and access</p><h1>Start with the story. Expand only when the work requires it.</h1><p>Guest, free-member, and Premium access each have a clear place in a campaign workflow.</p></section></PublicReveal><PublicReveal delay={80}><section className="pf-pricing pf-pricing--page"><div className="pf-pricing__intro"><h2>Three ways to work with PITCHFORGE.</h2><p>No invented limits. Each tier simply changes how much of the campaign desk you can keep and explore.</p></div><div className="pf-pricing__rail">{pricingPlans.map((plan) => <article className={`pf-price ${plan.tone === "signal" ? "pf-price--signal" : ""}`} key={plan.name}><h3>{plan.name}<span>{plan.price}</span></h3><div><p>{plan.summary}</p><ul>{plan.items.map((item) => <li key={item}>{item}</li>)}</ul></div>{plan.name === "Premium" ? <button className="pf-text-link" onClick={() => setLocation("/workspace")}>Explore Premium <ArrowUpRight size={15} /></button> : plan.name === "Free member" ? <Link className="pf-text-link" href="/live-demo">Create account <ArrowUpRight size={15} /></Link> : <Link className="pf-text-link" href="/live-demo">Start here <ArrowDownRight size={15} /></Link>}</article>)}</div></section></PublicReveal></main></PublicChrome>;
}

export function FaqPage() {
  return <PublicChrome><main className="pf-route-page"><PublicReveal><section className="pf-page-heading"><p className="pf-page-kicker">FAQ</p><h1>The details worth knowing before your launch begins.</h1><p>Product behavior, access limits, and review expectations explained plainly.</p></section></PublicReveal><PublicReveal delay={70}><section className="pf-faq pf-faq--page"><div><h2>Answers before you start.</h2><p>For account-specific questions, use the workspace after you sign in.</p></div><div className="pf-faq__list">{faqItems.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></section></PublicReveal></main></PublicChrome>;
}
