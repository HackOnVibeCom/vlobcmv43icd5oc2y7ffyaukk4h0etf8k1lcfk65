import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { Link } from "wouter";
import { HeroMotionOverlay } from "@/components/HeroMotionOverlay";
import { PublicChrome } from "@/components/PublicChrome";
import { PublicReveal } from "@/components/PublicRouteMotion";

const heroImage = "/assets/pitchforge-campaign-desk-hero_6c0f1950.png";

const destinations = [
  ["About PITCHFORGE", "Why one source needs six native launch surfaces.", "/about"],
  ["How it works", "From source to editable campaign in three clear moves.", "/how-it-works"],
  ["Live demo", "Put a source through the real campaign desk.", "/live-demo"],
  ["Pricing", "Guest, free member, and Premium access explained.", "/pricing"],
] as const;

export default function Home() {
  const heroSection = useRef<HTMLElement>(null);
  const heroVisual = useRef<HTMLDivElement>(null);

  return <PublicChrome><main>
    <section ref={heroSection} className="pf-hero pf-hero--immersive" aria-labelledby="pitchforge-title"><div className="pf-hero__copy"><h1 id="pitchforge-title">One app story. <em>Six</em> launch surfaces.</h1><p>Turn a store page or product brief into platform-native launch copy without rebuilding the story for every channel.</p><div className="pf-hero__actions"><Link href="/live-demo" className="pf-button">Try the live demo <ArrowRight size={17} /></Link><Link href="/how-it-works" className="pf-text-link">See how it works <ArrowRight size={15} /></Link></div></div><div ref={heroVisual} className="pf-hero__visual" aria-label="Editorial campaign desk showing the PITCHFORGE creative workflow"><span className="pf-hero__tag">ONE SOURCE<br />SIX PLACES</span><img src={heroImage} alt="Editorial campaign desk with crimson and cobalt paper campaign materials" /><HeroMotionOverlay targetRef={heroVisual} scrollTargetRef={heroSection} /><div className="pf-hero__note"><strong>Context in.<br />Campaign out.</strong><span>Store page, brief, or manual description. One working source of truth.</span></div></div></section>
    <PublicReveal><section className="pf-directory" aria-labelledby="explore-title"><div><p className="pf-page-kicker">Explore PITCHFORGE</p><h2 id="explore-title">Every decision has its own page.</h2></div><div className="pf-directory__links">{destinations.map(([title, body, href]) => <Link href={href} key={href}><span>{title}</span><small>{body}</small><ArrowRight size={16} /></Link>)}</div></section></PublicReveal>
  </main></PublicChrome>;
}
