import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Download, ImageIcon, Palette, Sparkles } from "lucide-react";
import "./launch-tools.css";

type ThemeKey = "obsidian" | "cobalt" | "crimson" | "emerald" | "violet";

type Context = {
  name: string;
  developer?: string;
  description: string;
  category?: string;
  sourceUrl?: string;
};

const THEMES: Record<ThemeKey, { label: string; bg: string; text: string; accent: string; badgeBg: string }> = {
  obsidian: {
    label: "Midnight Obsidian",
    bg: "linear-gradient(135deg, #090d16 0%, #111827 50%, #1f2937 100%)",
    text: "#f9fafb",
    accent: "#6366f1",
    badgeBg: "rgba(99, 102, 241, 0.2)",
  },
  cobalt: {
    label: "Electric Cobalt",
    bg: "linear-gradient(135deg, #022c43 0%, #05445e 50%, #189ab4 100%)",
    text: "#ffffff",
    accent: "#38bdf8",
    badgeBg: "rgba(56, 189, 248, 0.2)",
  },
  crimson: {
    label: "Sunset Crimson",
    bg: "linear-gradient(135deg, #4a0e17 0%, #7f1d1d 50%, #b91c1c 100%)",
    text: "#ffffff",
    accent: "#f87171",
    badgeBg: "rgba(248, 113, 113, 0.2)",
  },
  emerald: {
    label: "Forest Emerald",
    bg: "linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)",
    text: "#ffffff",
    accent: "#34d399",
    badgeBg: "rgba(52, 211, 153, 0.2)",
  },
  violet: {
    label: "Cyber Violet",
    bg: "linear-gradient(135deg, #2e1065 0%, #581c87 50%, #7e22ce 100%)",
    text: "#ffffff",
    accent: "#c084fc",
    badgeBg: "rgba(192, 132, 252, 0.2)",
  },
};

export default function SocialBannerStudio({ context }: { context?: Context }) {
  const [theme, setTheme] = useState<ThemeKey>("obsidian");
  const [headline, setHeadline] = useState(context?.name ? `Introducing ${context.name}` : "Launch Day Announcement");
  const [tagline, setTagline] = useState(context?.description ? context.description.slice(0, 85) : "One app link. Six launch-ready posts. Auto-published.");
  const [badgeText, setBadgeText] = useState("NOW LIVE ON APP STORE & GOOGLE PLAY");
  const bannerRef = useRef<HTMLDivElement>(null);

  const activeTheme = THEMES[theme];

  const handleDownloadSVG = () => {
    const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${activeTheme.bg.includes("#090d16") ? "#090d16" : activeTheme.bg.includes("#022c43") ? "#022c43" : activeTheme.bg.includes("#4a0e17") ? "#4a0e17" : activeTheme.bg.includes("#064e3b") ? "#064e3b" : "#2e1065"}" />
      <stop offset="100%" stop-color="${activeTheme.bg.includes("#1f2937") ? "#1f2937" : activeTheme.bg.includes("#189ab4") ? "#189ab4" : activeTheme.bg.includes("#b91c1c") ? "#b91c1c" : activeTheme.bg.includes("#059669") ? "#059669" : "#7e22ce"}" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" rx="24" />
  <rect x="80" y="80" width="360" height="38" rx="19" fill="${activeTheme.accent}" fill-opacity="0.2" stroke="${activeTheme.accent}" stroke-width="1.5" />
  <text x="100" y="105" fill="${activeTheme.accent}" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="bold" letter-spacing="1">${badgeText}</text>
  <text x="80" y="240" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="56" font-weight="bold">${headline}</text>
  <text x="80" y="320" fill="#cbd5e1" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="normal">${tagline}</text>
  <rect x="80" y="470" width="220" height="60" rx="14" fill="#000000" fill-opacity="0.4" stroke="rgba(255,255,255,0.2)" />
  <text x="105" y="508" fill="#ffffff" font-family="system-ui, sans-serif" font-size="18" font-weight="bold">📱 iOS & Android</text>
  <text x="1020" y="550" fill="rgba(255,255,255,0.4)" font-family="system-ui, sans-serif" font-size="16" text-anchor="end">Crafted with PitchForge</text>
</svg>`;

    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(context?.name || "app").toLowerCase().replace(/[^a-z0-9]/g, "-")}-launch-banner.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded high-res 1200x630 launch banner (SVG)!");
  };

  return (
    <div className="launch-tool-panel">
      <div className="launch-tool-header">
        <div className="launch-tool-title">
          <ImageIcon size={18} color="#818cf8" />
          <span>Live Social Banner & OpenGraph Generator</span>
          <span className="launch-tool-badge">1200 × 630 Visual Studio</span>
        </div>
        <Button size="sm" variant="outline" onClick={handleDownloadSVG}>
          <Download size={13} /> Download Banner (SVG)
        </Button>
      </div>

      {/* Theme Picker */}
      <div className="pitch-tabs" style={{ marginBottom: "1rem" }}>
        {(Object.keys(THEMES) as ThemeKey[]).map(t => (
          <button
            key={t}
            type="button"
            className={`pitch-tab-btn ${theme === t ? "is-active" : ""}`}
            onClick={() => setTheme(t)}
          >
            {THEMES[t].label}
          </button>
        ))}
      </div>

      {/* Live Visual Banner Preview */}
      <div
        ref={bannerRef}
        style={{
          width: "100%",
          aspectRatio: "1200 / 630",
          background: activeTheme.bg,
          borderRadius: "16px",
          padding: "2.5rem 3rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.1)",
          marginBottom: "1rem",
        }}
      >
        <div>
          <span
            style={{
              display: "inline-block",
              padding: "0.35rem 0.85rem",
              borderRadius: "9999px",
              background: activeTheme.badgeBg,
              border: `1px solid ${activeTheme.accent}`,
              color: activeTheme.accent,
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              marginBottom: "1.5rem",
            }}
          >
            {badgeText}
          </span>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#fff", margin: "0 0 0.75rem 0", lineHeight: 1.15 }}>
            {headline}
          </h2>
          <p style={{ fontSize: "1.2rem", color: "#cbd5e1", margin: 0, maxWidth: "85%", lineHeight: 1.5 }}>
            {tagline}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.75rem",
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.15)",
              padding: "0.6rem 1.2rem",
              borderRadius: "12px",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.95rem",
            }}
          >
            <span>📱 Available on iOS & Android</span>
          </div>
          <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)" }}>
            ⚡ Dispatched via PitchForge
          </span>
        </div>
      </div>

      {/* Real-Time Banner Customizer */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <Input
          placeholder="Banner Headline"
          value={headline}
          onChange={e => setHeadline(e.target.value)}
        />
        <Input
          placeholder="Badge text (e.g. NOW LIVE ON PRODUCT HUNT)"
          value={badgeText}
          onChange={e => setBadgeText(e.target.value)}
        />
      </div>
    </div>
  );
}
