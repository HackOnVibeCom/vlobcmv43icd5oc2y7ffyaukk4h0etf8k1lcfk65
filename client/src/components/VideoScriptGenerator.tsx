import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Clipboard, Download, Film, Play, Sparkles } from "lucide-react";
import "./launch-tools.css";

type Context = { name: string; description: string };

type Scene = { id: number; time: string; visual: string; voiceover: string; onScreen: string; color: string };

export default function VideoScriptGenerator({ context }: { context?: Context }) {
  const appName = context?.name || "Your App";
  const desc = context?.description || "the all-in-one app promotion engine";

  const scenes: Scene[] = [
    { id: 1, time: "0:00 – 0:05", visual: "Close-up of a frustrated user staring at a blank social media post editor. Quick cuts of 6 different platform tabs.", voiceover: `"Launching an app? You need posts for 6 different platforms. That takes hours."`, onScreen: `6 Platforms. 6 Formats. 1 Problem.`, color: "#ef4444" },
    { id: 2, time: "0:05 – 0:10", visual: `Smooth transition: user opens ${appName}. Pastes a single App Store URL into the input field.`, voiceover: `"What if you could do it all from a single link?"`, onScreen: `Paste one URL.`, color: "#f59e0b" },
    { id: 3, time: "0:10 – 0:18", visual: `${appName} generates 6 platform cards simultaneously with a satisfying cascade animation. Cards flip to show Twitter, LinkedIn, Instagram, App Store, Play Store, Product Hunt.`, voiceover: `"${appName} instantly generates tailored, platform-native launch copy — optimized with real ASO scoring."`, onScreen: `6 posts. One click. Done.`, color: "#10b981" },
    { id: 4, time: "0:18 – 0:25", visual: "Quick montage: Feed Mockup preview on iPhone, QR code download, webhook auto-publish animation, A/B testing comparison.", voiceover: `"Preview in realistic feed mockups. Auto-publish to Discord and Slack. Export QR codes for events."`, onScreen: `Mockups · Webhooks · QR Codes · A/B Testing`, color: "#6366f1" },
    { id: 5, time: "0:25 – 0:30", visual: `${appName} logo centered on dark gradient. App Store and Google Play badges fade in below.`, voiceover: `"${appName}. Your entire app launch, handled."`, onScreen: `Download Free Today`, color: "#818cf8" },
  ];

  const handleCopyScript = () => {
    const md = scenes.map(s => `## Scene ${s.id} [${s.time}]\n**Visual**: ${s.visual}\n**Voiceover**: ${s.voiceover}\n**On-Screen Text**: ${s.onScreen}`).join("\n\n---\n\n");
    navigator.clipboard.writeText(`# ${appName} — 30-Second App Store Preview Video Script\n\n${md}`);
    toast.success("Copied full video script!");
  };

  const handleDownloadMD = () => {
    const md = `# ${appName} — 30-Second App Store Preview Video Script\n\n${scenes.map(s => `## Scene ${s.id} [${s.time}]\n**Visual**: ${s.visual}\n**Voiceover**: ${s.voiceover}\n**On-Screen Text**: ${s.onScreen}`).join("\n\n---\n\n")}`;
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${appName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-video-script.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded video script as Markdown!");
  };

  return (
    <div className="launch-tool-panel">
      <div className="launch-tool-header">
        <div className="launch-tool-title">
          <Film size={18} color="#818cf8" />
          <span>30-Second App Demo Video Script</span>
          <span className="launch-tool-badge">5-Scene Storyboard</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button size="sm" variant="outline" onClick={handleCopyScript}><Clipboard size={13} /> Copy Script</Button>
          <Button size="sm" variant="outline" onClick={handleDownloadMD}><Download size={13} /> Export .md</Button>
        </div>
      </div>

      {/* Timeline Strip */}
      <div style={{ display: "flex", gap: 0, marginBottom: "1rem", borderRadius: "10px", overflow: "hidden" }}>
        {scenes.map(s => (
          <div key={s.id} style={{ flex: 1, height: 6, background: s.color }} />
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {scenes.map(s => (
          <div key={s.id} style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "0.85rem", borderLeft: `3px solid ${s.color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: s.color }}>Scene {s.id} · {s.time}</span>
              <Play size={14} color={s.color} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", fontSize: "0.8rem" }}>
              <div><span style={{ color: "#818cf8", fontWeight: 600, fontSize: "0.72rem" }}>VISUAL</span><p style={{ margin: "2px 0 0", color: "#cbd5e1", lineHeight: 1.4 }}>{s.visual}</p></div>
              <div><span style={{ color: "#818cf8", fontWeight: 600, fontSize: "0.72rem" }}>VOICEOVER</span><p style={{ margin: "2px 0 0", color: "#cbd5e1", lineHeight: 1.4, fontStyle: "italic" }}>{s.voiceover}</p></div>
              <div><span style={{ color: "#818cf8", fontWeight: 600, fontSize: "0.72rem" }}>ON-SCREEN</span><p style={{ margin: "2px 0 0", color: "#fff", fontWeight: 600, lineHeight: 1.4 }}>{s.onScreen}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
