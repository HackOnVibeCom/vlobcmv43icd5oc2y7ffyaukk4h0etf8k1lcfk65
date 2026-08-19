import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Download,
  Eye,
  ImageIcon,
  Layers,
  Palette,
  Ratio,
  Sparkles,
  Wand2,
} from "lucide-react";
import "./launch-tools.css";

type VisualStyle = "apple_glass" | "claymorphic_3d" | "cyber_dark" | "editorial_bold" | "isometric_mockup";
type AspectRatio = "16_9" | "1_1" | "9_16";

type Context = {
  name: string;
  developer?: string;
  description: string;
  category?: string;
  sourceUrl?: string;
};

const STYLES: Record<VisualStyle, { label: string; icon: string; promptDesc: string; bgGradient: string; accent: string; previewBadge: string }> = {
  apple_glass: {
    label: "Apple Minimal Glassmorphism",
    icon: "🍏",
    promptDesc: "Clean frosted glass UI cards, soft diffuse studio lighting, subtle depth blur, ultra-crisp titanium accents, sophisticated Helvetica typography.",
    bgGradient: "linear-gradient(135deg, #090d16 0%, #1e293b 100%)",
    accent: "#38bdf8",
    previewBadge: "Minimal & Premium",
  },
  claymorphic_3d: {
    label: "3D Claymorphic Tech",
    icon: "🎨",
    promptDesc: "Playful tactile 3D rounded clay shapes, vibrant volumetric studio rim light, isometric layout, floating icons, high gloss specular highlights.",
    bgGradient: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
    accent: "#818cf8",
    previewBadge: "Modern 3D Studio",
  },
  cyber_dark: {
    label: "Cyberpunk Dark Mode",
    icon: "⚡",
    promptDesc: "Deep obsidian carbon background, neon laser grid reflections, glowing chromatic aberration edge lines, futuristic HUD holographic metrics.",
    bgGradient: "linear-gradient(135deg, #050508 0%, #0f172a 50%, #1e1035 100%)",
    accent: "#f43f5e",
    previewBadge: "High-Energy Tech",
  },
  editorial_bold: {
    label: "Editorial Typography & Swiss Grid",
    icon: "📰",
    promptDesc: "Bold oversized architectural typography, high-contrast monochrome layout with intense single-color accent, magazine cover aesthetic.",
    bgGradient: "linear-gradient(135deg, #0f172a 0%, #022c22 100%)",
    accent: "#34d399",
    previewBadge: "Design Forward",
  },
  isometric_mockup: {
    label: "Isometric App Device Showcase",
    icon: "📱",
    promptDesc: "Floating 45-degree angle iPhone 15 Pro mockup displaying app UI, dynamic drop shadows, floating feature pill tags, studio spotlight backdrop.",
    bgGradient: "linear-gradient(135deg, #180828 0%, #3b0764 50%, #581c87 100%)",
    accent: "#c084fc",
    previewBadge: "App Store Ready",
  },
};

const FORMATS: Record<AspectRatio, { label: string; width: number; height: number; ratioClass: string; desc: string }> = {
  "16_9": { label: "X / Twitter & LinkedIn Card", width: 1200, height: 675, ratioClass: "16/9", desc: "1200 x 675 (16:9 Landscape)" },
  "1_1": { label: "Instagram & Product Hunt Square", width: 1080, height: 1080, ratioClass: "1/1", desc: "1080 x 1080 (1:1 Square)" },
  "9_16": { label: "TikTok & Stories / Reels", width: 1080, height: 1920, ratioClass: "9/16", desc: "1080 x 1920 (9:16 Vertical)" },
};

export default function SocialBannerStudio({ context }: { context?: Context }) {
  const appName = context?.name || "Your App";
  const [style, setStyle] = useState<VisualStyle>("apple_glass");
  const [format, setFormat] = useState<AspectRatio>("16_9");
  const [headline, setHeadline] = useState(`Introducing ${appName}`);
  const [tagline, setTagline] = useState(context?.description ? context.description.slice(0, 90) : "The all-in-one mobile app experience.");
  const [badgeText, setBadgeText] = useState("NOW AVAILABLE ON APP STORE & GOOGLE PLAY");
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const activeStyle = STYLES[style];
  const activeFormat = FORMATS[format];

  // Deep Prompt Engineering output for AI Image models (Flux / Stable Diffusion / Imagen)
  const masterEngineeredPrompt = `A commercial studio promotional ad graphic for mobile app "${appName}". Style: ${activeStyle.promptDesc} Layout: ${activeFormat.desc}. Main headline text: "${headline}". Subtitle text: "${tagline}". Category: ${context?.category || "Mobile Application"}. High resolution 8k, professional graphic design, award-winning typography layout, perfect color grading.`;

  const handleDownloadSVG = () => {
    const w = activeFormat.width;
    const h = activeFormat.height;
    const isPortrait = format === "9_16";
    const isSquare = format === "1_1";

    const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="50%" stop-color="#111827" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="30" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <rect width="${w}" height="${h}" fill="url(#bgGrad)" />

  <!-- Ambient Glow Ball -->
  <circle cx="${w * 0.7}" cy="${h * 0.3}" r="${w * 0.25}" fill="${activeStyle.accent}" opacity="0.15" filter="url(#glow)" />

  <!-- Badge Pill -->
  <rect x="${w * 0.08}" y="${h * 0.12}" width="${isPortrait ? w * 0.84 : 420}" height="42" rx="21" fill="${activeStyle.accent}" fill-opacity="0.15" stroke="${activeStyle.accent}" stroke-width="1.5" />
  <text x="${w * 0.08 + 20}" y="${h * 0.12 + 26}" fill="${activeStyle.accent}" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="bold" letter-spacing="1.5">${badgeText}</text>

  <!-- Main Headline -->
  <text x="${w * 0.08}" y="${h * (isPortrait ? 0.32 : isSquare ? 0.35 : 0.42)}" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="${isPortrait ? 52 : isSquare ? 58 : 64}" font-weight="900" letter-spacing="-1">${headline}</text>

  <!-- Tagline / Body -->
  <text x="${w * 0.08}" y="${h * (isPortrait ? 0.42 : isSquare ? 0.46 : 0.54)}" fill="#cbd5e1" font-family="system-ui, -apple-system, sans-serif" font-size="${isPortrait ? 26 : 28}" font-weight="normal">${tagline}</text>

  <!-- Store Platform Badges -->
  <g transform="translate(${w * 0.08}, ${h * (isPortrait ? 0.72 : isSquare ? 0.76 : 0.74)})">
    <rect width="210" height="60" rx="12" fill="#000000" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
    <text x="30" y="38" fill="#ffffff" font-family="system-ui, sans-serif" font-size="18" font-weight="bold"> App Store</text>

    <rect x="230" width="210" height="60" rx="12" fill="#000000" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
    <text x="260" y="38" fill="#ffffff" font-family="system-ui, sans-serif" font-size="18" font-weight="bold">▶ Google Play</text>
  </g>

  <!-- Footer Tag -->
  <text x="${w * 0.92}" y="${h * 0.92}" fill="rgba(255,255,255,0.4)" font-family="system-ui, sans-serif" font-size="14" text-anchor="end">Engineered with PitchForge Studio</text>
</svg>`;

    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${appName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${format}-launch-card.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${activeFormat.label} Banner (SVG)!`);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(masterEngineeredPrompt);
    toast.success("Copied Midjourney/Flux master prompt!");
  };

  return (
    <div className="launch-tool-panel">
      <div className="launch-tool-header">
        <div className="launch-tool-title">
          <ImageIcon size={18} color="#818cf8" />
          <span>High-End Social Banner & Visual Director Studio</span>
          <span className="launch-tool-badge">Multi-Style & Multi-Ratio</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button size="sm" variant="outline" onClick={handleCopyPrompt}>
            <Wand2 size={13} /> Copy AI Image Prompt
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownloadSVG}>
            <Download size={13} /> Download Banner (SVG)
          </Button>
        </div>
      </div>

      {/* Style Presets */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
          1. Art Direction & Style Presets:
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.5rem" }}>
          {Object.entries(STYLES).map(([k, s]) => (
            <button
              key={k}
              type="button"
              onClick={() => setStyle(k as VisualStyle)}
              style={{
                padding: "0.65rem 0.8rem",
                borderRadius: "10px",
                background: style === k ? "rgba(99,102,241,0.25)" : "#090d16",
                border: `1px solid ${style === k ? "#818cf8" : "rgba(255,255,255,0.1)"}`,
                color: style === k ? "#ffffff" : "#cbd5e1",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 3,
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", fontWeight: 700 }}>
                <span>{s.icon}</span>
                <span>{s.label.split(" ")[0]}</span>
              </div>
              <span style={{ fontSize: "0.68rem", color: style === k ? "#a5b4fc" : "#64748b" }}>{s.previewBadge}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Format & Ratio Selector */}
      <div style={{ marginBottom: "1.25rem" }}>
        <label style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
          2. Platform Aspect Ratio & Dimensions:
        </label>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {Object.entries(FORMATS).map(([k, f]) => (
            <button
              key={k}
              type="button"
              onClick={() => setFormat(k as AspectRatio)}
              style={{
                padding: "0.5rem 0.9rem",
                borderRadius: "8px",
                background: format === k ? "#6366f1" : "#090d16",
                border: `1px solid ${format === k ? "#818cf8" : "rgba(255,255,255,0.12)"}`,
                color: format === k ? "#ffffff" : "#94a3b8",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {f.label} ({f.ratioClass})
            </button>
          ))}
        </div>
      </div>

      {/* Visual Canvas Live Preview */}
      <div
        style={{
          width: "100%",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          background: activeStyle.bgGradient,
          padding: "2.5rem 2rem",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          marginBottom: "1.25rem",
        }}
      >
        <div style={{ position: "absolute", top: -80, right: -80, width: 260, height: 260, background: `radial-gradient(circle, ${activeStyle.accent}30 0%, transparent 70%)`, pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 650 }}>
          <div style={{ display: "inline-flex", padding: "0.3rem 0.8rem", borderRadius: "9999px", background: activeStyle.accent + "20", border: `1px solid ${activeStyle.accent}50`, color: activeStyle.accent, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "1rem" }}>
            {badgeText}
          </div>
          <h2 style={{ fontSize: "2.2rem", fontWeight: 900, color: "#ffffff", margin: "0 0 0.75rem 0", lineHeight: 1.15 }}>
            {headline}
          </h2>
          <p style={{ color: "#cbd5e1", fontSize: "1.05rem", margin: "0 0 1.5rem 0", lineHeight: 1.5 }}>
            {tagline}
          </p>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ background: "#000", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "10px", padding: "0.5rem 1rem", fontSize: "0.82rem", fontWeight: 700, color: "#fff" }}>
               App Store
            </div>
            <div style={{ background: "#000", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "10px", padding: "0.5rem 1rem", fontSize: "0.82rem", fontWeight: 700, color: "#fff" }}>
              ▶ Google Play
            </div>
          </div>
        </div>
      </div>

      {/* Inputs for Customization */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0.75rem" }}>
        <div>
          <label style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 4 }}>
            Headline:
          </label>
          <Input value={headline} onChange={e => setHeadline(e.target.value)} style={{ background: "#090d16", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" }} />
        </div>
        <div>
          <label style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 4 }}>
            Subtitle / Hook:
          </label>
          <Input value={tagline} onChange={e => setTagline(e.target.value)} style={{ background: "#090d16", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" }} />
        </div>
      </div>
    </div>
  );
}
