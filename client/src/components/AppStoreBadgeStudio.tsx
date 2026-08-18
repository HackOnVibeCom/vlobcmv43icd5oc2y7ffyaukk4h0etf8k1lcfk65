import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Download, QrCode, Smartphone, Sparkles } from "lucide-react";
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
  const [storeUrl, setStoreUrl] = useState(context?.sourceUrl || "https://pitchforge.app/demo");
  const [frameTitle, setFrameTitle] = useState(`Scan to Download ${appName}`);
  const [frameSubtitle, setFrameSubtitle] = useState("Available on iOS & Android");

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
  
  <!-- QR Code Matrix Graphic -->
  <rect x="175" y="185" width="70" height="70" fill="#000000" rx="8" />
  <rect x="190" y="200" width="40" height="40" fill="#ffffff" rx="4" />
  <rect x="200" y="210" width="20" height="20" fill="#000000" rx="2" />

  <rect x="355" y="185" width="70" height="70" fill="#000000" rx="8" />
  <rect x="370" y="200" width="40" height="40" fill="#ffffff" rx="4" />
  <rect x="380" y="210" width="20" height="20" fill="#000000" rx="2" />

  <rect x="175" y="365" width="70" height="70" fill="#000000" rx="8" />
  <rect x="190" y="380" width="40" height="40" fill="#ffffff" rx="4" />
  <rect x="200" y="390" width="20" height="20" fill="#000000" rx="2" />

  <!-- Center App Icon -->
  <circle cx="300" cy="310" r="32" fill="#6366f1" />
  <text x="300" y="318" fill="#ffffff" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" text-anchor="middle">${appName.charAt(0)}</text>

  <!-- QR Alignment Grid Lines -->
  <path d="M 270 200 L 330 200 M 270 230 L 330 230 M 270 260 L 330 260 M 355 280 L 420 280 M 355 310 L 420 310 M 175 280 L 250 280 M 270 360 L 420 360 M 270 390 L 420 390 M 270 420 L 420 420" stroke="#000000" stroke-width="6" stroke-linecap="round" />

  <!-- Store Badges Box -->
  <!-- App Store Button -->
  <rect x="110" y="500" width="180" height="54" fill="#000000" rx="10" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" />
  <text x="175" y="522" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10">Download on the</text>
  <text x="175" y="540" fill="#ffffff" font-family="system-ui, sans-serif" font-size="16" font-weight="bold">App Store</text>

  <!-- Google Play Button -->
  <rect x="310" y="500" width="180" height="54" fill="#000000" rx="10" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" />
  <text x="375" y="522" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10">GET IT ON</text>
  <text x="375" y="540" fill="#ffffff" font-family="system-ui, sans-serif" font-size="16" font-weight="bold">Google Play</text>

  <!-- URL Tag Footer -->
  <text x="300" y="610" fill="#818cf8" font-family="system-ui, monospace" font-size="14" text-anchor="middle">${storeUrl}</text>
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

  return (
    <div className="launch-tool-panel">
      <div className="launch-tool-header">
        <div className="launch-tool-title">
          <QrCode size={18} color="#818cf8" />
          <span>App Store Smart QR Code & Store Badge Studio</span>
          <span className="launch-tool-badge">Print & Digital Assets</span>
        </div>
        <Button size="sm" variant="outline" onClick={handleDownloadCardSVG}>
          <Download size={13} /> Download QR Card (SVG)
        </Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "center" }}>
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
          <h4 style={{ margin: "0 0 0.25rem 0", color: "#fff", fontSize: "1.1rem" }}>{frameTitle}</h4>
          <p style={{ margin: "0 0 1rem 0", color: "#94a3b8", fontSize: "0.85rem" }}>{frameSubtitle}</p>

          {/* QR Box Visual */}
          <div
            style={{
              width: "160px",
              height: "160px",
              background: "#fff",
              borderRadius: "16px",
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
              position: "relative",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <div style={{ width: 36, height: 36, background: "#000", borderRadius: 4 }} />
              <div style={{ width: 36, height: 36, background: "#000", borderRadius: 4 }} />
            </div>
            {/* Center Logo */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#6366f1",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: 14,
              }}
            >
              {appName.charAt(0)}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <div style={{ width: 36, height: 36, background: "#000", borderRadius: 4 }} />
              <div style={{ width: 28, height: 28, border: "4px solid #000", borderRadius: 4 }} />
            </div>
          </div>

          {/* Badges preview */}
          <div style={{ display: "flex", gap: "0.5rem", width: "100%", justifyContent: "center" }}>
            <div style={{ background: "#000", border: "1px solid #333", borderRadius: "8px", padding: "0.35rem 0.6rem", fontSize: "0.75rem", color: "#fff" }}>
               App Store
            </div>
            <div style={{ background: "#000", border: "1px solid #333", borderRadius: "8px", padding: "0.35rem 0.6rem", fontSize: "0.75rem", color: "#fff" }}>
              ▶ Google Play
            </div>
          </div>
        </div>

        {/* Customization Inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div>
            <label style={{ fontSize: "0.78rem", color: "#94a3b8", marginBottom: 4, display: "block" }}>
              Store URL / Universal Link:
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

          <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#10b981", display: "flex", alignItems: "center", gap: 5 }}>
            <Sparkles size={14} /> Ready for physical launch flyers, roll-up banners, and press events.
          </div>
        </div>
      </div>
    </div>
  );
}
