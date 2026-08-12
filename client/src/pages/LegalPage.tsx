import { FileText, ShieldCheck } from "lucide-react";
import { privacySections, termsSections } from "@/content/publicSiteContent";
import { PublicChrome } from "@/components/PublicChrome";
import { PublicReveal } from "@/components/PublicRouteMotion";
import "./home.css";
import "./public-pages.css";

function LegalLayout({ title, intro, sections, icon }: { title: string; intro: string; sections: readonly (readonly [string, string])[]; icon: "privacy" | "terms" }) {
  const Icon = icon === "privacy" ? ShieldCheck : FileText;
  return (
    <PublicChrome><main className="pf-legal">
      <article className="pf-legal__article">
        <PublicReveal><div className="pf-legal__title"><Icon size={23} /><p>Effective August 15, 2026</p><h1>{title}</h1><p>{intro}</p></div></PublicReveal>
        <PublicReveal delay={70}><div className="pf-legal__sections">
          {sections.map(([heading, body]) => <section key={heading}><h2>{heading}</h2><p>{body}</p></section>)}
        </div></PublicReveal>
      </article>
    </main></PublicChrome>
  );
}

export function PrivacyPage() {
  return <LegalLayout title="Privacy Policy" intro="A clear overview of how the current PITCHFORGE workspace uses information to provide campaign drafting, saving, visual access, and account features." sections={privacySections} icon="privacy" />;
}

export function TermsPage() {
  return <LegalLayout title="Terms of Use" intro="The practical rules for using PITCHFORGE responsibly, reviewing generated work, and understanding access allowances." sections={termsSections} icon="terms" />;
}
