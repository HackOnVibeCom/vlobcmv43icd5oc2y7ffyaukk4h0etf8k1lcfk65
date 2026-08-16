import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/react";
import { ArrowUpRight, Menu } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { PublicMotionLayer } from "./PublicMotionLayer";
import { PublicRouteTransition } from "./PublicRouteMotion";

const navItems = [
  ["About", "/about"],
  ["How it works", "/how-it-works"],
  ["Live demo", "/live-demo"],
  ["Pricing", "/pricing"],
  ["FAQ", "/faq"],
] as const;

export function PublicChrome({ children }: { children: ReactNode }) {
  const { isSignedIn } = useAuth();
  const [, setLocation] = useLocation();

  return <div className="pf-site">
    <PublicMotionLayer />
    <nav className="pf-nav" aria-label="Primary navigation">
      <Link className="pf-brand" href="/"><img src="/assets/pitchforge-logo-final.png" alt="PITCHFORGE" className="pf-brand__logo" />PITCHFORGE</Link>
      <div className="pf-nav__utility">
        <div className="pf-nav__product-links" aria-label="Explore PITCHFORGE pages">
          {navItems.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
        </div>
        <details className="pf-nav__mobile-pages">
          <summary><Menu size={15} /> Pages</summary>
          <div>{navItems.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</div>
        </details>
        <div className="pf-nav__account-actions">
          {isSignedIn ? <><button onClick={() => setLocation("/workspace")}>Workspace <ArrowUpRight size={14} /></button><UserButton /></> : <><SignInButton mode="modal"><button>Sign in</button></SignInButton><SignUpButton mode="modal"><button className="pf-nav__cta"><span className="pf-nav__signup-wide">Create account</span><span className="pf-nav__signup-compact">Sign up</span><ArrowUpRight size={14} /></button></SignUpButton></>}
        </div>
      </div>
    </nav>
    <PublicRouteTransition>{children}</PublicRouteTransition>
    <PublicFooter />
  </div>;
}

export function PublicFooter() {
  return <footer className="pf-footer">
    <div><div className="pf-footer__brand">PITCH<span>FORGE</span></div><p className="pf-footer__close">From one source to every surface your launch needs to reach.</p></div>
    <div className="pf-footer__links"><Link href="/about">About</Link><Link href="/how-it-works">How it works</Link><Link href="/live-demo">Live demo</Link><Link href="/pricing">Pricing</Link><Link href="/faq">FAQ</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div>
    <div className="pf-footer__lower"><span>© 2026 PITCHFORGE. All rights reserved.</span><span>Generated copy and visuals require human review before publication.</span></div>
  </footer>;
}
