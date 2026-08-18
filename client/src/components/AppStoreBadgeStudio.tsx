import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Download, ExternalLink, QrCode, Smartphone, Sparkles } from "lucide-react";
import "./launch-tools.css";

type Context = {
  name: string;
  developer?: string;
  description: string;
  category?: string;
  sourceUrl?: string;
};

export default function AppStoreBadgeStudio({ context }: { context?: Context }) {
  const appName = context?.name || "Your App";
  const [storeUrl, setStoreUrl] = useState(context?.sourceUrl || "https://play.google.com/store/apps/details?id=com.iwaskidnapped.app");
  const [frameTitle, setFrameTitle] = useState(`Scan to Download ${appName}`);
  const [frameSubtitle, setFrameSubtitle] = useState("Available on iOS & Android");

  // Real live QR Code image URL via public QR API encoded directly with the storeUrl
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(storeUrl)}&color=ffffff&bgcolor=00000000&margin=0`;
  const qrDownloadUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(storeUrl)}&margin=10`;

  // Generate SVG QR Code representation with clean pixel grid and store badges
  const handleDownloadCardSVG = () => {
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750">
  <defs>
    <linearGradient id="qrBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
  </defs>
  <rect width="600" height="750" fill="url(#qrBg)" rx="28" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
  
  <!-- Header -->
  <text x="300" y="80" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="bold" text-anchor="middle">${frameTitle}</text>
  <text x="300" y="115" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="16" text-anchor="middle">${frameSubtitle}</text>

  <!-- QR Frame Box -->
  <rect x="150" y="160" width="300" height="300" fill="#ffffff" rx="20" />
  
  <!-- QR Image Embedding -->
  <image href="${qrDownloadUrl}" x="165" y="175" width="270" height="270" />

  <!-- Center App Icon -->
  <circle cx="300" cy="310" r="28" fill="#6366f1" />
  <text x="300" y="318" fill="#ffffff" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" text-anchor="middle">${appName.charAt(0)}</text>

  <!-- Store Badges Box -->
  <rect x="110" y="500" width="180" height="54" fill="#000000" rx="10" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" />
  <text x="175" y="522" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10">Download on the</text>
  <text x="175" y="540" fill="#ffffff" font-family="system-ui, sans-serif" font-size="16" font-weight="bold">App Store</text>

  <rect x="310" y="500" width="180" height="54" fill="#000000" rx="10" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" />
  <text x="375" y="522" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10">GET IT ON</text>
  <text x="375" y="540" fill="#ffffff" font-family="system-ui, sans-serif" font-size="16" font-weight="bold">Google Play</text>

  <!-- URL Tag Footer -->
  <text x="300" y="610" fill="#818cf8" font-family="system-ui, monospace" font-size="13" text-anchor="middle">${storeUrl}</text>
  <text x="300" y="690" fill="rgba(255,255,255,0.4)" font-family="system-ui, sans-serif" font-size="13" text-anchor="middle">Generated with PitchForge App Promotion Engine</text>
</svg>`;

    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${appName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-store-qr-card.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Downloaded Store QR & Download Badge Card (SVG)!");
  };

  const handleDownloadPNG = () => {
    window.open(qrDownloadUrl, "_blank");
    toast.success("Opening high-res QR code image!");
  };

  return (
    <div className="launch-tool-panel">
      <div className="launch-tool-header">
        <div className="launch-tool-title">
          <QrCode size={18} color="#818cf8" />
          <span>App Store Real Scannable QR Code & Store Badge Studio</span>
          <span className="launch-tool-badge">Live Scannable QR</span>
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
            padding: "1.5rem",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 15px 30px rgba(0,0,0,0.5)",
          }}
        >
          <h4 style={{ margin: "0 0 0.25rem 0", color: "#fff", fontSize: "1.1rem", fontWeight: 700 }}>{frameTitle}</h4>
          <p style={{ margin: "0 0 1rem 0", color: "#94a3b8", fontSize: "0.85rem" }}>{frameSubtitle}</p>

          {/* Real Live QR Code Box */}
          <div
            style={{
              width: "180px",
              height: "180px",
              background: "#ffffff",
              borderRadius: "16px",
              padding: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem",
              position: "relative",
              boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            }}
          >
            <img
              src={qrApiUrl}
              alt={`Scannable QR code linking to ${storeUrl}`}
              style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "8px" }}
              onError={(e) => {
                // Fallback visual if offline
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            {/* Center Brand Badge */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#6366f1",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 14,
                boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                border: "2px solid #fff",
              }}
            >
              {appName.charAt(0)}
            </div>
          </div>

          <div style={{ fontSize: "0.72rem", color: "#818cf8", fontFamily: "monospace", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "0.75rem" }}>
            {storeUrl}
          </div>

          {/* Badges preview */}
          <div style={{ display: "flex", gap: "0.5rem", width: "100%", justifyContent: "center" }}>
            <div style={{ background: "#000", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", padding: "0.4rem 0.7rem", fontSize: "0.75rem", color: "#fff", display: "flex", alignItems: "center", gap: 4 }}>
              <span></span> <span>App Store</span>
            </div>
            <div style={{ background: "#000", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", padding: "0.4rem 0.7rem", fontSize: "0.75rem", color: "#fff", display: "flex", alignItems: "center", gap: 4 }}>
              <span>▶</span> <span>Google Play</span>
            </div>
          </div>
        </div>

        {/* Customization Inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div>
            <label style={{ fontSize: "0.78rem", color: "#94a3b8", marginBottom: 4, display: "block" }}>
              Live Store URL / Universal Link (Encodes directly to QR):
            </label>
            <Input value={storeUrl} onChange={e => setStoreUrl(e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: "0.78rem", color: "#94a3b8", marginBottom: 4, display: "block" }}>
              Frame Header:
            </label>
            <Input value={frameTitle} onChange={e => setFrameTitle(e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: "0.78rem", color: "#94a3b8", marginBottom: 4, display: "block" }}>
              Frame Subtitle:
            </label>
            <Input value={frameSubtitle} onChange={e => setFrameSubtitle(e.target.value)} />
          </div>

          <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#10b981", display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles size={15} /> Real live QR code updates as you type — scan with your phone camera right now!
          </div>
        </div>
      </div>
    </div>
  );
}
