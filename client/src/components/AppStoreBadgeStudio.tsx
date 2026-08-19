import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Download, ExternalLink, QrCode, Smartphone, Sparkles, Wand2 } from "lucide-react";
import "./launch-tools.css";

type Context = {
  name: string;
  developer?: string;
  description: string;
  category?: string;
  sourceUrl?: string;
  screenshots?: string[];
};

export default function AppStoreBadgeStudio({ context }: { context?: Context }) {
  const appName = context?.name || "I Was Kidnapped";
  const [storeUrl, setStoreUrl] = useState(context?.sourceUrl || "https://play.google.com/store/apps/details?id=com.iwaskidnapped.app");
  const [frameTitle, setFrameTitle] = useState(`Scan to Download ${appName}`);
  const [frameSubtitle, setFrameSubtitle] = useState("Available on iOS & Android");

  // If a screenshot or app icon is available from scraping, use it in the center; otherwise use verified app icon emblem
  const appLogoUrl = context?.screenshots?.[0] || "/assets/pitchforge-logo-final.png";

  // Use high-reliability SVG & PNG QR code generator endpoint
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(storeUrl)}&format=svg`;
  const qrDownloadUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(storeUrl)}&margin=12`;

  const handleDownloadPNG = () => {
    window.open(qrDownloadUrl, "_blank");
    toast.success("Downloaded High-Resolution QR Code PNG!");
  };

  const handleDownloadCardSVG = () => {
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="760" viewBox="0 0 600 760">
  <defs>
    <linearGradient id="qrBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
  </defs>
  <rect width="600" height="760" fill="url(#qrBg)" rx="28" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
  
  <!-- Header -->
  <text x="300" y="80" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="bold" text-anchor="middle">${frameTitle}</text>
  <text x="300" y="115" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="16" text-anchor="middle">${frameSubtitle}</text>

  <!-- QR Frame Box -->
  <rect x="140" y="155" width="320" height="320" fill="#ffffff" rx="22" />
  
  <!-- QR Image Embedding -->
  <image href="${qrDownloadUrl}" x="155" y="170" width="290" height="290" />

  <!-- Center App Emblem -->
  <circle cx="300" cy="315" r="30" fill="#0f172a" stroke="#6366f1" stroke-width="3" />
  <text x="300" y="322" fill="#ffffff" font-family="system-ui, sans-serif" font-size="18" font-weight="900" text-anchor="middle">APP</text>

  <!-- Store Badges Box -->
  <rect x="105" y="520" width="185" height="56" fill="#000000" rx="12" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" />
  <text x="175" y="544" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10">Download on the</text>
  <text x="175" y="562" fill="#ffffff" font-family="system-ui, sans-serif" font-size="16" font-weight="bold">App Store</text>

  <rect x="310" y="520" width="185" height="56" fill="#000000" rx="12" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" />
  <text x="375" y="544" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10">GET IT ON</text>
  <text x="375" y="562" fill="#ffffff" font-family="system-ui, sans-serif" font-size="16" font-weight="bold">Google Play</text>

  <!-- URL Tag Footer -->
  <text x="300" y="630" fill="#818cf8" font-family="system-ui, monospace" font-size="13" text-anchor="middle">${storeUrl}</text>
  <text x="300" y="700" fill="rgba(255,255,255,0.4)" font-family="system-ui, sans-serif" font-size="13" text-anchor="middle">Generated with PitchForge Studio</text>
</svg>`;

    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${appName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-qr-standee.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded Vector QR Promo Card (SVG)!");
  };

  return (
    <div className="launch-tool-panel">
      <div className="launch-tool-header">
        <div className="launch-tool-title">
          <QrCode size={18} color="#818cf8" />
          <span>Live Scannable QR Code Studio & Standee Generator</span>
          <span className="launch-tool-badge">Direct Store Link</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button size="sm" variant="outline" onClick={handleDownloadPNG}>
            <Download size={13} /> Download QR PNG
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownloadCardSVG}>
            <Download size={13} /> Download Card (SVG)
          </Button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", alignItems: "center" }}>
        {/* Visual Card Preview */}
        <div
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.15)",
            padding: "1.75rem",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 15px 30px rgba(0,0,0,0.5)",
          }}
        >
          <h4 style={{ margin: "0 0 0.25rem 0", color: "#fff", fontSize: "1.15rem", fontWeight: 800 }}>{frameTitle}</h4>
          <p style={{ margin: "0 0 1.25rem 0", color: "#94a3b8", fontSize: "0.85rem" }}>{frameSubtitle}</p>

          {/* Real Live QR Code Box */}
          <div
            style={{
              width: "200px",
              height: "200px",
              background: "#ffffff",
              borderRadius: "18px",
              padding: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem",
              position: "relative",
              boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
            }}
          >
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(storeUrl)}&margin=2`}
              alt={`Scannable QR code linking to ${storeUrl}`}
              style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "8px" }}
            />
            {/* Center Logo Emblem */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 36,
                height: 36,
                borderRadius: "10px",
                background: "#0f172a",
                color: "#818cf8",
                border: "2px solid #6366f1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 11,
                boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
              }}
            >
              APP
            </div>
          </div>

          <div style={{ fontSize: "0.72rem", color: "#818cf8", fontFamily: "monospace", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "0.9rem" }}>
            {storeUrl}
          </div>

          {/* Badges preview */}
          <div style={{ display: "flex", gap: "0.5rem", width: "100%", justifyContent: "center" }}>
            <div style={{ background: "#000", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", padding: "0.45rem 0.8rem", fontSize: "0.75rem", color: "#fff", fontWeight: 700 }}>
               App Store
            </div>
            <div style={{ background: "#000", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", padding: "0.45rem 0.8rem", fontSize: "0.75rem", color: "#fff", fontWeight: 700 }}>
              ▶ Google Play
            </div>
          </div>
        </div>

        {/* Customization Inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 4 }}>
              App Store or Google Play URL:
            </label>
            <Input
              value={storeUrl}
              onChange={e => setStoreUrl(e.target.value)}
              placeholder="https://play.google.com/store/apps/details?id=..."
              style={{ background: "#090d16", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 4 }}>
              Header Title:
            </label>
            <Input
              value={frameTitle}
              onChange={e => setFrameTitle(e.target.value)}
              style={{ background: "#090d16", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 4 }}>
              Subheader Text:
            </label>
            <Input
              value={frameSubtitle}
              onChange={e => setFrameSubtitle(e.target.value)}
              style={{ background: "#090d16", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" }}
            />
          </div>

          <div style={{ background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.25)", borderRadius: "10px", padding: "0.75rem", fontSize: "0.78rem", color: "#cbd5e1" }}>
            📸 <b>Hardware Proof:</b> Test by pointing your smartphone camera directly at the QR code above — it resolves instantly to your app listing.
          </div>
        </div>
      </div>
    </div>
  );
}
