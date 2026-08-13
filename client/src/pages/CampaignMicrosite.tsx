import { trpc } from "@/lib/trpc";
import { useParams } from "wouter";
import { Globe, Star } from "lucide-react";

const PLATFORM_LABELS: Record<string, string> = {
  appStore: "App Store",
  googlePlay: "Google Play",
  twitter: "Twitter / X",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  productHunt: "Product Hunt",
};

export default function CampaignMicrosite() {
  const params = useParams<{ slug: string }>();
  const site = trpc.campaigns.getMicrosite.useQuery({ slug: params.slug ?? "" }, { enabled: Boolean(params.slug) });

  if (site.isLoading) {
    return (
      <main className="microsite-page">
        <div className="microsite-loading">Loading campaign…</div>
      </main>
    );
  }

  if (!site.data || site.data.isPublic !== "true") {
    return (
      <main className="microsite-page">
        <div className="microsite-loading">This campaign page is unavailable.</div>
      </main>
    );
  }

  const { campaign, outputs } = site.data;
  let ctx: { name?: string; developer?: string; description?: string; rating?: string; category?: string } = {};
  try { ctx = JSON.parse(campaign.contextJson); } catch {}

  return (
    <main className="microsite-page">
      <nav className="microsite-nav">
        <a href="/" className="microsite-brand"><span>PF</span>PITCHFORGE</a>
        <a href="/workspace" className="microsite-cta">Launch your app →</a>
      </nav>

      <header className="microsite-hero">
        <div className="microsite-meta">
          <span className="studio__serial">Campaign page</span>
          {ctx.category && <span className="microsite-category">{ctx.category}</span>}
        </div>
        <h1>{ctx.name ?? campaign.name}</h1>
        {ctx.developer && <p className="microsite-dev">by {ctx.developer}</p>}
        {ctx.rating && (
          <div className="microsite-rating">
            <Star size={14} fill="currentColor" />
            <span>{ctx.rating}</span>
          </div>
        )}
        {ctx.description && <p className="microsite-desc">{ctx.description.slice(0, 240)}{ctx.description.length > 240 ? "…" : ""}</p>}
      </header>

      <section className="microsite-outputs">
        {outputs.map(output => (
          <article key={output.platform} className="microsite-card">
            <header className="microsite-card__head">
              <Globe size={13} />
              <span>{PLATFORM_LABELS[output.platform] ?? output.platform}</span>
              <small>{output.characterCount}/{output.characterLimit} chars</small>
            </header>
            <p className="microsite-card__copy">{output.content}</p>
          </article>
        ))}
      </section>

      <footer className="microsite-footer">
        <p>Made with <a href="/">PITCHFORGE</a> — one link, six launch-ready posts.</p>
      </footer>
    </main>
  );
}
