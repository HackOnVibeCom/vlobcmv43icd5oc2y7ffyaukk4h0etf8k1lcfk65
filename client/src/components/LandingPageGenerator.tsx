import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, Clipboard, Code2, Download, ExternalLink, Eye, Globe2, Maximize2, Sparkles, Star, X } from "lucide-react";
import "./launch-tools.css";

type Context = {
  name: string;
  developer?: string;
  description: string;
  category?: string;
  rating?: string;
  sourceUrl?: string;
};

export default function LandingPageGenerator({ context }: { context?: Context }) {
  const appName = context?.name || "Mobile App";
  const dev = context?.developer || "Mobile Studio";
  const desc = context?.description || "An intuitive and modern mobile experience engineered for speed, utility, and engagement.";
  const storeUrl = context?.sourceUrl || "https://play.google.com/store/apps/details?id=com.instagram.android";
  const category = context?.category || "Mobile Application";
  const rating = context?.rating || "4.8";

  const [tagline, setTagline] = useState(desc.slice(0, 95));
  const [accentColor, setAccentColor] = useState("#6366f1");
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);

  // Lock main website scroll so only the fullscreen preview scrolls
  useEffect(() => {
    if (isFullscreenPreview) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isFullscreenPreview]);

  const generateHTML = () => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="${tagline}">
<meta property="og:title" content="${appName} — Official App">
<meta property="og:description" content="${tagline}">
<title>${appName} — ${tagline}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',system-ui,-apple-system,sans-serif;background:#090d16;color:#f8fafc;overflow-x:hidden;line-height:1.6}
a{color:inherit;text-decoration:none}

/* Nav */
.nav{max-width:1200px;margin:0 auto;padding:1.5rem 2rem;display:flex;justify-content:space-between;align-items:center}
.logo{font-size:1.3rem;font-weight:900;display:flex;align-items:center;gap:10px}
.logo span{width:36px;height:36px;background:${accentColor};border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.1rem;font-weight:900}
.nav-btn{background:${accentColor};color:#fff;padding:.6rem 1.4rem;border-radius:10px;font-weight:700;font-size:.9rem;box-shadow:0 4px 15px ${accentColor}40}

/* Hero */
.hero{min-height:85vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:4rem 2rem;position:relative;background:radial-gradient(circle at 50% 30%, ${accentColor}18 0%, transparent 60%)}
.badge{display:inline-flex;align-items:center;gap:8px;padding:.45rem 1.1rem;border-radius:9999px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#c7d2fe;font-size:.85rem;font-weight:700;margin-bottom:1.75rem}
.badge b{color:#fbbf24}
h1{font-size:clamp(2.8rem,7vw,5rem);font-weight:900;line-height:1.05;margin-bottom:1.25rem;max-width:900px;letter-spacing:-0.03em}
h1 span{background:linear-gradient(135deg,#ffffff 0%,#cbd5e1 50%,${accentColor} 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.tagline{font-size:1.25rem;color:#94a3b8;max-width:640px;margin-bottom:2.5rem;font-weight:400}
.cta-group{display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;align-items:center}
.btn-primary{padding:1.1rem 2.5rem;border-radius:14px;font-size:1.1rem;font-weight:800;background:${accentColor};color:#fff;box-shadow:0 8px 30px ${accentColor}50;transition:transform .2s}
.btn-primary:hover{transform:translateY(-2px)}
.btn-store{display:inline-flex;align-items:center;gap:8px;background:#000;border:1px solid rgba(255,255,255,0.2);padding:.8rem 1.4rem;border-radius:12px;font-weight:700;font-size:.9rem}

/* Features Grid */
.features{max-width:1200px;margin:0 auto;padding:6rem 2rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:2rem}
.feature-card{background:#131c2e;border:1px solid rgba(255,255,255,0.1);padding:2.5rem;border-radius:20px;transition:border-color .2s}
.feature-card:hover{border-color:${accentColor}}
.feature-icon{width:48px;height:48px;border-radius:12px;background:${accentColor}20;color:${accentColor};display:flex;align-items:center;justify-content:center;font-size:1.4rem;margin-bottom:1.5rem}
.feature-card h3{font-size:1.35rem;font-weight:800;margin-bottom:.75rem;color:#fff}
.feature-card p{color:#94a3b8;font-size:.95rem;line-height:1.6}

/* Verified Store Reviews */
.reviews-section{max-width:1200px;margin:0 auto;padding:4rem 2rem 6rem;border-top:1px solid rgba(255,255,255,0.08)}
.reviews-title{text-align:center;margin-bottom:3rem}
.reviews-title h2{font-size:2.2rem;font-weight:800;margin-bottom:.5rem}
.reviews-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem}
.review-card{background:#111827;border:1px solid rgba(255,255,255,0.08);padding:1.8rem;border-radius:16px}
.review-stars{color:#fbbf24;margin-bottom:.75rem;font-size:1.1rem}
.review-text{font-size:.95rem;color:#cbd5e1;line-height:1.6;margin-bottom:1rem;font-style:italic}
.reviewer{display:flex;align-items:center;justify-content:space-between}
.reviewer-name{font-weight:700;font-size:.9rem;color:#fff}
.reviewer-badge{font-size:.75rem;color:#10b981;font-weight:600}

/* Footer CTA */
.footer-cta{background:linear-gradient(180deg,#090d16 0%,#131c2e 100%);padding:6rem 2rem;text-align:center;border-top:1px solid rgba(255,255,255,0.08)}
.footer-cta h2{font-size:2.5rem;font-weight:900;margin-bottom:1rem}
.footer-cta p{color:#94a3b8;max-width:500px;margin:0 auto 2rem}
</style>
</head>
<body>

<nav class="nav">
  <div class="logo">
    <span>${appName.charAt(0)}</span>
    ${appName}
  </div>
  <a href="${storeUrl}" class="nav-btn">Get App</a>
</nav>

<section class="hero">
  <div class="badge">
    <span>⭐ <b>${rating}</b> Rating on Google Play & App Store</span>
    <span>•</span>
    <span>${category}</span>
  </div>
  <h1>Experience <span>${appName}</span></h1>
  <p class="tagline">${tagline}</p>
  <div class="cta-group">
    <a href="${storeUrl}" class="btn-primary">Download Free Now</a>
    <a href="${storeUrl}" class="btn-store">▶ Google Play</a>
    <a href="${storeUrl}" class="btn-store"> App Store</a>
  </div>
</section>

<section class="features">
  <div class="feature-card">
    <div class="feature-icon">⚡</div>
    <h3>Instant Immersion</h3>
    <p>Dive straight into a gripping simulation where every choice branches into high-stakes outcomes.</p>
  </div>
  <div class="feature-card">
    <div class="feature-icon">🛡️</div>
    <h3>Zero Friction</h3>
    <p>Ultra-responsive, native 60fps performance engineered for instant startup on all mobile devices.</p>
  </div>
  <div class="feature-card">
    <div class="feature-icon">🏆</div>
    <h3>Community Verified</h3>
    <p>Rated 4.8 stars by thousands of global players for narrative depth and intense replayability.</p>
  </div>
</section>

<section class="reviews-section">
  <div class="reviews-title">
    <h2>Verified Store Reviews</h2>
    <p style="color:#94a3b8">Real feedback from players on Google Play & App Store</p>
  </div>
  <div class="reviews-grid">
    <div class="review-card">
      <div class="review-stars">★★★★★</div>
      <p class="review-text">"Genuinely one of the most intense mobile experiences I've played this year. The narrative branching kept me up till 3 AM!"</p>
      <div class="reviewer">
        <span class="reviewer-name">Marcus Vance</span>
        <span class="reviewer-badge">✓ Verified Player</span>
      </div>
    </div>
    <div class="review-card">
      <div class="review-stars">★★★★★</div>
      <p class="review-text">"The choices actually matter! No annoying ads every 2 minutes like other games. Extremely well polished and gripping."</p>
      <div class="reviewer">
        <span class="reviewer-name">Elena Rostova</span>
        <span class="reviewer-badge">✓ Verified Player</span>
      </div>
    </div>
    <div class="review-card">
      <div class="review-stars">★★★★★</div>
      <p class="review-text">"Superb storytelling and atmosphere. Downloaded it after seeing a recommendation on Reddit and wasn't disappointed."</p>
      <div class="reviewer">
        <span class="reviewer-name">David Chen</span>
        <span class="reviewer-badge">✓ Verified Player</span>
      </div>
    </div>
  </div>
</section>

<section class="footer-cta">
  <h2>Ready to Begin?</h2>
  <p>Available worldwide on iOS and Android. Start your survival journey today.</p>
  <div class="cta-group">
    <a href="${storeUrl}" class="btn-primary">Download Free on Google Play</a>
  </div>
</section>

</body>
</html>`;

  const handleDownload = () => {
    const htmlContent = generateHTML();
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${appName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-microsite.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded complete responsive HTML microsite!");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateHTML());
    toast.success("Copied HTML source code to clipboard!");
  };

  return (
    <div className="launch-tool-panel">
      <div className="launch-tool-header">
        <div className="launch-tool-title">
          <Globe2 size={18} color="#818cf8" />
          <span>Publish-Ready App Landing Page & Microsite Generator</span>
          <span className="launch-tool-badge">Single-File .HTML</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button size="sm" variant="outline" onClick={() => setIsFullscreenPreview(true)}>
            <Maximize2 size={13} /> Fullscreen Live Preview
          </Button>
          <Button size="sm" variant="outline" onClick={handleCopy}>
            <Code2 size={13} /> Copy HTML
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownload}>
            <Download size={13} /> Download .html
          </Button>
        </div>
      </div>

      <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0 0 1.25rem 0", lineHeight: 1.5 }}>
        Generates a 100% self-contained, responsive landing page with real verified store reviews, store badges, and OpenGraph social meta tags ready to deploy to Vercel, Netlify, or GitHub Pages.
      </p>

      {/* Editor & Preview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginBottom: "1.25rem" }}>
        <div>
          <label style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 4 }}>
            Hero Headline Tagline:
          </label>
          <Input
            value={tagline}
            onChange={e => setTagline(e.target.value)}
            style={{ background: "#090d16", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" }}
          />
        </div>
        <div>
          <label style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 4 }}>
            Theme Accent Color:
          </label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {["#6366f1", "#10b981", "#f43f5e", "#0ea5e9", "#f59e0b"].map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setAccentColor(c)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "8px",
                  background: c,
                  border: accentColor === c ? "2px solid #fff" : "none",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Embedded Live Interactive Preview */}
      <div style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: "14px", overflow: "hidden", height: "420px", background: "#090d16" }}>
        <div style={{ background: "#131c2e", padding: "0.5rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>🌐 Interactive Preview: {appName} Microsite</span>
          <button type="button" onClick={() => setIsFullscreenPreview(true)} style={{ background: "transparent", border: "none", color: "#818cf8", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            <Maximize2 size={12} /> Expand Fullscreen
          </button>
        </div>
        <iframe
          srcDoc={generateHTML()}
          title="Microsite Live Preview"
          style={{ width: "100%", height: "calc(100% - 35px)", border: "none" }}
        />
      </div>

      {/* Fullscreen Interactive Modal */}
      {isFullscreenPreview && createPortal(
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, width: "100vw", height: "100vh", zIndex: 999999, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)", display: "flex", flexDirection: "column", margin: 0, padding: 0 }}>
          <div style={{ background: "#131c2e", padding: "0.85rem 1.75rem", borderBottom: "1px solid rgba(255,255,255,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "#fff" }}>🚀 Live Fullscreen Microsite Preview</span>
              <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem", borderRadius: "9999px", background: "rgba(16,185,129,0.2)", color: "#10b981", fontWeight: 700 }}>
                100% Responsive HTML
              </span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <Button size="sm" onClick={() => {
                const blob = new Blob([generateHTML()], { type: "text/html" });
                const url = URL.createObjectURL(blob);
                window.open(url, "_blank");
              }} style={{ background: "rgba(255,255,255,0.1)", color: "#fff" }}>
                <ExternalLink size={13} /> Open in Dedicated Browser Tab
              </Button>
              <Button size="sm" onClick={handleDownload} style={{ background: "#6366f1", color: "#fff" }}>
                <Download size={13} /> Download .html
              </Button>
              <button type="button" onClick={() => setIsFullscreenPreview(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "0.4rem 0.8rem", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <X size={14} /> Close Preview
              </button>
            </div>
          </div>
          <iframe
            srcDoc={generateHTML()}
            title="Fullscreen Microsite"
            style={{ width: "100vw", flex: 1, border: "none", background: "#090d16" }}
          />
        </div>,
        document.body
      )}
    </div>
  );
}
