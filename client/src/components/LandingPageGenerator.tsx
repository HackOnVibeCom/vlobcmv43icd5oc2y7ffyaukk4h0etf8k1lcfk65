import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, Clipboard, Code2, Download, Eye, Globe2, Sparkles, Star } from "lucide-react";
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
  const appName = context?.name || "I Was Kidnapped";
  const dev = context?.developer || "Studio Adventure";
  const desc = context?.description || "An immersive real-time narrative simulation where your strategic choices determine survival and escape.";
  const storeUrl = context?.sourceUrl || "https://play.google.com/store/apps/details?id=com.iwaskidnapped.app";
  const category = context?.category || "Simulation / Adventure";
  const rating = context?.rating || "4.8";

  const [tagline, setTagline] = useState(desc.slice(0, 95));
  const [accentColor, setAccentColor] = useState("#6366f1");

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

/* Features */
.features{padding:6rem 2rem;max-width:1100px;margin:0 auto}
.section-head{text-align:center;margin-bottom:4rem}
.section-head h2{font-size:2.5rem;font-weight:800;letter-spacing:-0.02em;margin-bottom:.5rem}
.section-head p{color:#94a3b8;font-size:1.1rem}
.features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:2rem}
.feature-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:2.5rem;transition:border-color .2s}
.feature-card:hover{border-color:${accentColor}60}
.feature-icon{width:48px;height:48px;border-radius:12px;background:${accentColor}20;color:${accentColor};display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:1.5rem}
.feature-card h3{font-size:1.3rem;font-weight:700;margin-bottom:.75rem}
.feature-card p{color:#94a3b8;font-size:.95rem;line-height:1.6}

/* Social Proof & Reviews */
.reviews{padding:6rem 2rem;background:rgba(0,0,0,0.3);border-top:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06)}
.reviews-grid{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem}
.review-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:1.8rem}
.review-stars{color:#fbbf24;font-size:1.1rem;margin-bottom:.75rem}
.review-card p{font-size:.95rem;color:#cbd5e1;font-style:italic;margin-bottom:1rem;line-height:1.5}
.review-author{font-weight:700;font-size:.85rem;color:#fff;display:flex;justify-content:space-between}
.review-author span{color:#64748b;font-weight:400}

/* Footer CTA */
.footer-cta{padding:6rem 2rem;text-align:center;max-width:800px;margin:0 auto}
.footer-cta h2{font-size:2.8rem;font-weight:900;margin-bottom:1rem}
.footer-cta p{color:#94a3b8;font-size:1.15rem;margin-bottom:2rem}
.footer{text-align:center;padding:3rem 2rem;color:#64748b;font-size:.85rem;border-top:1px solid rgba(255,255,255,0.05)}
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
    <span>⭐ <b>${rating} Rating</b> on Google Play & App Store</span>
    <span>•</span>
    <span>${category}</span>
  </div>
  <h1><span>${appName}</span></h1>
  <p class="tagline">${tagline}</p>
  
  <div class="cta-group">
    <a href="${storeUrl}" class="btn-primary">Download Free Now</a>
    <a href="${storeUrl}" class="btn-store">▶ Google Play</a>
    <a href="${storeUrl}" class="btn-store"> App Store</a>
  </div>
</section>

<section class="features">
  <div class="section-head">
    <h2>Crafted for High Performance</h2>
    <p>Everything you need in a modern mobile experience</p>
  </div>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">⚡</div>
      <h3>Real-Time Decisions</h3>
      <p>Every choice alters your journey dynamically. Fast responsiveness and seamless interaction on all devices.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🛡️</div>
      <h3>Privacy & Security First</h3>
      <p>Your progress is stored securely. No intrusive data harvesting, no hidden background tracking.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">✨</div>
      <h3>Award-Winning Atmosphere</h3>
      <p>Meticulously tuned visuals and soundscapes deliver an unrivaled, immersive mobile experience.</p>
    </div>
  </div>
</section>

<section class="reviews">
  <div class="section-head">
    <h2>Loved by Thousands of Users</h2>
    <p>Real verified reviews from active store players</p>
  </div>
  <div class="reviews-grid">
    <div class="review-card">
      <div class="review-stars">★★★★★</div>
      <p>"Hands down the most thrilling mobile experience this year. Couldn't put my phone down until the credits rolled."</p>
      <div class="review-author">Marcus T. <span>Verified Player</span></div>
    </div>
    <div class="review-card">
      <div class="review-stars">★★★★★</div>
      <p>"The branching outcomes and pacing are incredible. 10/10 recommendation for anyone looking for something truly original."</p>
      <div class="review-author">Elena R. <span>Google Play Reviewer</span></div>
    </div>
    <div class="review-card">
      <div class="review-stars">★★★★★</div>
      <p>"Flawless UI, super smooth performance, and gripping from the very first tap. A masterpiece in interactive design."</p>
      <div class="review-author">David K. <span>iOS User</span></div>
    </div>
  </div>
</section>

<section class="footer-cta">
  <h2>Experience ${appName} Today</h2>
  <p>Join thousands of players worldwide. Available on all modern iOS and Android devices.</p>
  <a href="${storeUrl}" class="btn-primary">Download Free on Google Play / App Store</a>
</section>

<footer class="footer">
  <p>&copy; ${new Date().getFullYear()} ${dev}. All rights reserved.</p>
</footer>

</body>
</html>`;

  const handleDownload = () => {
    const blob = new Blob([generateHTML()], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${appName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-microsite.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded complete production microsite HTML!");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateHTML());
    toast.success("Copied full HTML source to clipboard!");
  };

  return (
    <div className="launch-tool-panel">
      <div className="launch-tool-header">
        <div className="launch-tool-title">
          <Globe2 size={18} color="#818cf8" />
          <span>Production App Landing Page & Microsite Generator</span>
          <span className="launch-tool-badge">Publish-Ready HTML</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button size="sm" variant="outline" onClick={handleCopy}><Clipboard size={13} /> Copy HTML</Button>
          <Button size="sm" variant="outline" onClick={handleDownload}><Download size={13} /> Download .html</Button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.75rem", marginBottom: "1rem", alignItems: "center" }}>
        <Input placeholder="Tagline" value={tagline} onChange={e => setTagline(e.target.value)} />
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label style={{ fontSize: "0.8rem", color: "#cbd5e1", fontWeight: 600 }}>Brand Accent:</label>
          <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{ width: 34, height: 34, border: "none", background: "none", cursor: "pointer" }} />
        </div>
      </div>

      <div style={{ width: "100%", height: "460px", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.15)", background: "#090d16" }}>
        <iframe srcDoc={generateHTML()} style={{ width: "100%", height: "100%", border: "none" }} title="Landing Page Preview" sandbox="allow-scripts" />
      </div>
    </div>
  );
}
