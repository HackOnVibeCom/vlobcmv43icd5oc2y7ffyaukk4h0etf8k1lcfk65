import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Clipboard, Mail, Send, Sparkles } from "lucide-react";
import "./launch-tools.css";

type Context = { name: string; developer?: string; description: string };

export default function EmailDripCampaign({ context }: { context?: Context }) {
  const appName = context?.name || "Your App";
  const dev = context?.developer || "The Team";
  const desc = context?.description || "the all-in-one app promotion engine";
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const emails = [
    {
      id: "pre",
      phase: "Pre-Launch (T-3 Days)",
      color: "#818cf8",
      subject: `Something special is coming from ${dev}...`,
      preview: `We've been building ${appName} and can't wait to show you.`,
      body: `Hi there,\n\nWe've been heads-down building something we think you'll love.\n\n${appName} — ${desc}.\n\nIn 3 days, we're launching publicly. As part of our early community, you'll be the first to try it.\n\nHere's a sneak peek of what ${appName} does:\n• One-tap setup with instant results\n• Works on iOS and Android\n• Completely free to get started\n\nMark your calendar — launch day is coming.\n\nBest,\n${dev}`,
    },
    {
      id: "launch",
      phase: "Launch Day 🚀",
      color: "#10b981",
      subject: `${appName} is LIVE — Download Free Today`,
      preview: `It's here! Get ${appName} on the App Store & Google Play.`,
      body: `The day is here! 🎉\n\n${appName} is now live on the App Store and Google Play.\n\n→ Download on iOS: [App Store Link]\n→ Download on Android: [Play Store Link]\n\nWhat you get:\n• ${desc}\n• Beautiful, intuitive interface\n• Free to use — no credit card required\n\nWe built ${appName} because we believe ${desc.toLowerCase().includes("app") ? "every app deserves a great launch" : "this should be easier for everyone"}.\n\nIf you enjoy ${appName}, we'd be incredibly grateful if you:\n1. Leave a quick rating on the store ⭐\n2. Share it with a friend who'd find it useful\n\nThank you for being part of this journey.\n\n— ${dev}`,
    },
    {
      id: "post",
      phase: "Post-Launch (T+3 Days)",
      color: "#f59e0b",
      subject: `3 tips to get the most out of ${appName}`,
      preview: `Quick tips from the team to supercharge your experience.`,
      body: `Hey there,\n\nThanks for trying ${appName}! Here are 3 tips to get the most value:\n\n1. **Tip #1**: Start with a store URL for the fastest results\n2. **Tip #2**: Try the feed mockup previews to see your copy in context\n3. **Tip #3**: Use the export features to save your work as PDF or Markdown\n\nWe're actively shipping improvements based on early feedback. If there's anything you'd like to see, just reply to this email.\n\nAnd if you haven't yet, a quick App Store rating helps us reach more people like you: [Rate ${appName}]\n\nCheers,\n${dev}`,
    },
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied email to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    const all = emails.map(e => `=== ${e.phase} ===\nSubject: ${e.subject}\nPreview: ${e.preview}\n\n${e.body}`).join("\n\n---\n\n");
    navigator.clipboard.writeText(all);
    toast.success("Copied full 3-email drip sequence!");
  };

  return (
    <div className="launch-tool-panel">
      <div className="launch-tool-header">
        <div className="launch-tool-title">
          <Mail size={18} color="#818cf8" />
          <span>Email Drip Campaign Sequence Generator</span>
          <span className="launch-tool-badge">3-Email Funnel</span>
        </div>
        <Button size="sm" variant="outline" onClick={handleCopyAll}><Clipboard size={13} /> Copy Full Sequence</Button>
      </div>

      {/* Timeline */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: "1.25rem", padding: "0 1rem" }}>
        {emails.map((e, i) => (
          <div key={e.id} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: e.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>{i + 1}</div>
              <span style={{ fontSize: "0.72rem", color: e.color, fontWeight: 600, whiteSpace: "nowrap" }}>{e.phase}</span>
            </div>
            {i < emails.length - 1 && <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.1)", margin: "0 0.5rem", marginBottom: "1.2rem" }} />}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {emails.map(e => (
          <div key={e.id} style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1rem", borderLeft: `3px solid ${e.color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
              <div>
                <div style={{ fontSize: "0.72rem", color: e.color, fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>{e.phase}</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#fff" }}>Subject: {e.subject}</div>
                <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: 2 }}>Preview: {e.preview}</div>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: 4 }}>
                  <span className="subtitle-char-badge">{e.subject.length}/60 subject</span>
                  <span className="subtitle-char-badge">{e.preview.length}/90 preview</span>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => handleCopy(e.id, `Subject: ${e.subject}\nPreview: ${e.preview}\n\n${e.body}`)}>
                {copiedId === e.id ? <Check size={12} /> : <Clipboard size={12} />}
                {copiedId === e.id ? "Copied" : "Copy"}
              </Button>
            </div>
            <pre style={{ margin: 0, fontSize: "0.8rem", color: "#cbd5e1", whiteSpace: "pre-wrap", lineHeight: 1.5, maxHeight: 120, overflow: "auto", background: "rgba(0,0,0,0.2)", padding: "0.6rem", borderRadius: "8px" }}>{e.body}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
