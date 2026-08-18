import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, Clipboard, Code2, Download, Eye, Globe2, Sparkles } from "lucide-react";
import "./launch-tools.css";

type Context = { name: string; developer?: string; description: string; category?: string; sourceUrl?: string };

export default function LandingPageGenerator({ context }: { context?: Context }) {
  const appName = context?.name || "Your App";
  const dev = context?.developer || "Your Company";
  const desc = context?.description || "The all-in-one solution for modern mobile app promotion.";
  const storeUrl = context?.sourceUrl || "https://apps.apple.com/app/your-app";

  const [tagline, setTagline] = useState(desc.slice(0, 90));
  const [accentColor, setAccentColor] = useState("#6366f1");

  const features = [
    { title: "Lightning Fast", body: "Optimized for speed and performance on every device." },
    { title: "Beautiful Design", body: "Crafted with care for a premium user experience." },
    { title: "Privacy First", body: "Your data stays yours. No tracking, no compromises." },
  ];

  const generateHTML = () => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="${tagline}">
<title>${appName} — ${tagline}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',system-ui,sans-serif;background:#0a0a0f;color:#e2e8f0;overflow-x:hidden}
.hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem;background:linear-gradient(135deg,#0a0a0f 0%,#1a1a2e 50%,#0a0a0f 100%);position:relative}
.hero::after{content:'';position:absolute;top:50%;left:50%;width:600px;height:600px;background:radial-gradient(circle,${accentColor}15 0%,transparent 70%);transform:translate(-50%,-50%);pointer-events:none}
.badge{display:inline-block;padding:.4rem 1rem;border-radius:9999px;background:${accentColor}20;border:1px solid ${accentColor}40;color:${accentColor};font-size:.85rem;font-weight:600;margin-bottom:1.5rem;letter-spacing:.02em}
h1{font-size:clamp(2.5rem,6vw,4.5rem);font-weight:800;line-height:1.1;margin-bottom:1rem;max-width:800px}
.tagline{font-size:1.25rem;color:#94a3b8;max-width:600px;margin-bottom:2.5rem;line-height:1.6}
.cta-row{display:flex;gap:1rem;flex-wrap:wrap;justify-content:center}
.cta-btn{padding:.85rem 2rem;border-radius:12px;font-size:1rem;font-weight:600;cursor:pointer;text-decoration:none;transition:transform .2s,box-shadow .2s}
.cta-btn:hover{transform:translateY(-2px)}
.cta-primary{background:${accentColor};color:#fff;border:none;box-shadow:0 4px 20px ${accentColor}40}
.cta-secondary{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.2)}
.features{padding:6rem 2rem;max-width:1000px;margin:0 auto}
.features h2{text-align:center;font-size:2rem;margin-bottom:3rem}
.features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem}
.feature-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:2rem}
.feature-card h3{font-size:1.15rem;margin-bottom:.5rem;color:#fff}
.feature-card p{color:#94a3b8;line-height:1.6}
.footer{text-align:center;padding:3rem 2rem;border-top:1px solid rgba(255,255,255,.06);color:#64748b;font-size:.85rem}
</style>
</head>
<body>
<section class="hero">
<span class="badge">🚀 Now Available on iOS & Android</span>
<h1>${appName}</h1>
<p class="tagline">${tagline}</p>
<div class="cta-row">
<a href="${storeUrl}" class="cta-btn cta-primary">Download Free</a>
<a href="#features" class="cta-btn cta-secondary">Learn More</a>
</div>
</section>
<section class="features" id="features">
<h2>Why ${appName}?</h2>
<div class="features-grid">
${features.map(f => `<div class="feature-card"><h3>${f.title}</h3><p>${f.body}</p></div>`).join("\n")}
</div>
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
    a.download = `${appName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-landing-page.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded complete landing page HTML!");
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
          <span>App Landing Page & Microsite Generator</span>
          <span className="launch-tool-badge">Downloadable HTML</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button size="sm" variant="outline" onClick={handleCopy}><Clipboard size={13} /> Copy HTML</Button>
          <Button size="sm" variant="outline" onClick={handleDownload}><Download size={13} /> Download .html</Button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
        <Input placeholder="Tagline" value={tagline} onChange={e => setTagline(e.target.value)} />
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Accent:</label>
          <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{ width: 32, height: 32, border: "none", background: "none", cursor: "pointer" }} />
        </div>
      </div>

      <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", background: "#000" }}>
        <iframe srcDoc={generateHTML()} style={{ width: "100%", height: "100%", border: "none" }} title="Landing Page Preview" sandbox="allow-scripts" />
      </div>
    </div>
  );
}
