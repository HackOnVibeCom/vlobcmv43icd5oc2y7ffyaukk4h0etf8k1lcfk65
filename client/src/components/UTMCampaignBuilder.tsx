import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, Clipboard, Link2, Sparkles } from "lucide-react";
import "./launch-tools.css";

type Context = { name: string; developer?: string; description: string; category?: string; sourceUrl?: string };

const CHANNELS = [
  { id: "twitter", label: "Twitter / X", source: "twitter", medium: "social" },
  { id: "linkedin", label: "LinkedIn", source: "linkedin", medium: "social" },
  { id: "instagram", label: "Instagram Bio", source: "instagram", medium: "social" },
  { id: "email", label: "Email Newsletter", source: "newsletter", medium: "email" },
  { id: "producthunt", label: "Product Hunt", source: "producthunt", medium: "community" },
  { id: "press", label: "Press / PR", source: "press", medium: "referral" },
  { id: "reddit", label: "Reddit", source: "reddit", medium: "community" },
  { id: "discord", label: "Discord", source: "discord", medium: "community" },
];

export default function UTMCampaignBuilder({ context }: { context?: Context }) {
  const appName = context?.name || "your-app";
  const [baseUrl, setBaseUrl] = useState(context?.sourceUrl || "https://apps.apple.com/app/your-app");
  const [campaign, setCampaign] = useState(`${appName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-launch`);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const buildUTM = (ch: typeof CHANNELS[0]) =>
    `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}utm_source=${ch.source}&utm_medium=${ch.medium}&utm_campaign=${campaign}`;

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success(`Copied ${id} UTM link!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    const all = CHANNELS.map(ch => `${ch.label}: ${buildUTM(ch)}`).join("\n");
    navigator.clipboard.writeText(all);
    toast.success("Copied all UTM links to clipboard!");
  };

  return (
    <div className="launch-tool-panel">
      <div className="launch-tool-header">
        <div className="launch-tool-title">
          <Link2 size={18} color="#818cf8" />
          <span>UTM Campaign Link Builder & Attribution Tracker</span>
          <span className="launch-tool-badge">{CHANNELS.length} Channels</span>
        </div>
        <Button size="sm" variant="outline" onClick={handleCopyAll}><Clipboard size={13} /> Copy All Links</Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
        <Input placeholder="Base URL (App Store / Play Store / Website)" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} />
        <Input placeholder="Campaign Name" value={campaign} onChange={e => setCampaign(e.target.value)} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {CHANNELS.map(ch => {
          const url = buildUTM(ch);
          return (
            <div key={ch.id} className="subtitle-item" style={{ alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#818cf8", textTransform: "uppercase" }}>{ch.label}</span>
                <div style={{ fontSize: "0.82rem", color: "#cbd5e1", fontFamily: "monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 }}>{url}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                <span style={{ fontSize: "0.7rem", padding: "0.15rem 0.4rem", borderRadius: "6px", background: "rgba(99,102,241,0.15)", color: "#a5b4fc" }}>{ch.medium}</span>
                <Button size="sm" variant="ghost" onClick={() => handleCopy(ch.id, url)}>
                  {copiedId === ch.id ? <Check size={12} /> : <Clipboard size={12} />}
                  {copiedId === ch.id ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
