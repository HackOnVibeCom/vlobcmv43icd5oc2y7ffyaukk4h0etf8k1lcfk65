import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Clipboard, DollarSign, Search, Sparkles, TrendingUp } from "lucide-react";
import "./launch-tools.css";

type PlatformAd = "asa" | "google_app";

type Context = {
  name: string;
  developer?: string;
  description: string;
  category?: string;
};

export default function PaidCampaignStudio({ context }: { context?: Context }) {
  const [platform, setPlatform] = useState<PlatformAd>("asa");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const appName = context?.name || "Your App";
  const desc = context?.description || "App launch marketing engine";

  const asaData = {
    brandKeywords: [`[${appName.toLowerCase()}]`, `[${appName.toLowerCase()} app]`, `"${appName.toLowerCase()} download"`],
    categoryKeywords: [
      `"${context?.category?.toLowerCase() || "productivity"} tool"`,
      `"app store copy generator"`,
      `"launch copy"`,
      `"aso ranking optimizer"`,
    ],
    headlines: [
      { id: "asa1", text: `${appName} — Fast App Launch`, limit: 30 },
      { id: "asa2", text: "One App Link, Six Posts", limit: 30 },
      { id: "asa3", text: "Auditable ASO Scoring", limit: 30 },
    ],
  };

  const googleData = {
    headlines: [
      { id: "g1", text: `${appName} — Launch Studio`, limit: 30 },
      { id: "g2", text: "One Link. Six Posts.", limit: 30 },
      { id: "g3", text: "Instant ASO Store Ranking", limit: 30 },
      { id: "g4", text: "Free Launch Copy Generator", limit: 30 },
      { id: "g5", text: "Auto-Publish to Discord & Slack", limit: 30 },
    ],
    descriptions: [
      { id: "d1", text: `Generate tailored launch copy for 6 platforms with deterministic ASO scoring.`, limit: 90 },
      { id: "d2", text: `Turn your mobile app store link into launch-ready posts. No account needed.`, limit: 90 },
      { id: "d3", text: `10-point launch checklist and keyword optimizer for indie developers.`, limit: 90 },
      { id: "d4", text: `Craft authentic Show HN, Reddit, and press pitches for your new app.`, limit: 90 },
    ],
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="launch-tool-panel">
      <div className="launch-tool-header">
        <div className="launch-tool-title">
          <TrendingUp size={18} color="#818cf8" />
          <span>Apple Search Ads (ASA) & Google App Campaigns Studio</span>
          <span className="launch-tool-badge">Paid Acquisition</span>
        </div>
      </div>

      <div className="pitch-tabs">
        <button
          type="button"
          className={`pitch-tab-btn ${platform === "asa" ? "is-active" : ""}`}
          onClick={() => setPlatform("asa")}
        >
           Apple Search Ads (ASA)
        </button>
        <button
          type="button"
          className={`pitch-tab-btn ${platform === "google_app" ? "is-active" : ""}`}
          onClick={() => setPlatform("google_app")}
        >
          ▶ Google App Campaigns (UAC)
        </button>
      </div>

      {platform === "asa" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Keyword Clusters */}
          <div style={{ background: "rgba(0,0,0,0.25)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <strong style={{ color: "#818cf8", fontSize: "0.85rem" }}>Brand & Exact-Match Keyword Cluster:</strong>
              <Button size="sm" variant="ghost" onClick={() => handleCopy("asa_kw", asaData.brandKeywords.concat(asaData.categoryKeywords).join("\n"))}>
                {copiedKey === "asa_kw" ? <Check size={12} /> : <Clipboard size={12} />}
                {copiedKey === "asa_kw" ? "Copied All" : "Copy Keywords"}
              </Button>
            </div>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {asaData.brandKeywords.concat(asaData.categoryKeywords).map((kw, i) => (
                <span key={i} style={{ background: "rgba(99, 102, 241, 0.15)", border: "1px solid rgba(99, 102, 241, 0.3)", color: "#c7d2fe", padding: "0.2rem 0.5rem", borderRadius: "6px", fontSize: "0.82rem", fontFamily: "monospace" }}>
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Headlines */}
          <div className="subtitle-matrix-grid">
            {asaData.headlines.map(h => (
              <div key={h.id} className="subtitle-item">
                <div className="subtitle-text-info">
                  <span className="subtitle-label">ASA Headline (30 char limit)</span>
                  <span className="subtitle-copy">"{h.text}"</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span className="subtitle-char-badge">{h.text.length} / {h.limit} chars</span>
                  <Button size="sm" variant="ghost" onClick={() => handleCopy(h.id, h.text)}>
                    {copiedKey === h.id ? <Check size={12} /> : <Clipboard size={12} />}
                    {copiedKey === h.id ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {platform === "google_app" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.78rem", color: "#818cf8", fontWeight: 600, textTransform: "uppercase" }}>Google App Campaign Headlines (30 chars max):</span>
            <div className="subtitle-matrix-grid">
              {googleData.headlines.map(h => (
                <div key={h.id} className="subtitle-item">
                  <span className="subtitle-copy">"{h.text}"</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span className="subtitle-char-badge">{h.text.length} / {h.limit} chars</span>
                    <Button size="sm" variant="ghost" onClick={() => handleCopy(h.id, h.text)}>
                      {copiedKey === h.id ? <Check size={12} /> : <Clipboard size={12} />}
                      {copiedKey === h.id ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.78rem", color: "#818cf8", fontWeight: 600, textTransform: "uppercase" }}>Google App Campaign Descriptions (90 chars max):</span>
            <div className="subtitle-matrix-grid">
              {googleData.descriptions.map(d => (
                <div key={d.id} className="subtitle-item">
                  <span className="subtitle-copy">"{d.text}"</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span className="subtitle-char-badge">{d.text.length} / {d.limit} chars</span>
                    <Button size="sm" variant="ghost" onClick={() => handleCopy(d.id, d.text)}>
                      {copiedKey === d.id ? <Check size={12} /> : <Clipboard size={12} />}
                      {copiedKey === d.id ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
