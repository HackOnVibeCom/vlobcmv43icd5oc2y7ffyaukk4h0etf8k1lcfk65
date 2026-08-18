import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Award, Calculator, Check, Clipboard, Flame, HelpCircle, Sparkles, Trophy } from "lucide-react";
import "./launch-tools.css";

type Context = {
  name: string;
  developer?: string;
  description: string;
  category?: string;
};

export default function ProductHuntPlaybook({ context }: { context?: Context }) {
  const [hoursElapsed, setHoursElapsed] = useState(4);
  const [currentUpvotes, setCurrentUpvotes] = useState(85);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const appName = context?.name || "Your App";

  // Velocity calculations
  const hourlyRate = hoursElapsed > 0 ? (currentUpvotes / hoursElapsed).toFixed(1) : "0";
  const projectedTotal = Math.round(Number(hourlyRate) * 24);
  const targetTop1 = 350;
  const targetTop5 = 180;

  const responses = [
    {
      id: "r1",
      topic: "Tech Stack & Architecture",
      text: `Thanks for checking out ${appName}! Under the hood, we built it with TypeScript, React, and Node. Rather than using fragile prompt wrappers, we implemented deterministic rules engines for our ASO grading and iOS keyword packer so that the scores are 100% consistent and verifiable.`,
    },
    {
      id: "r2",
      topic: "Pricing & Free Tier",
      text: `Great question! You can use ${appName} 100% free with zero sign-in required to generate 6-platform copy, test feed mockups, and export Markdown and PDF files. We believe indie builders should be able to get their launch assets without hitting paywalls.`,
    },
    {
      id: "r3",
      topic: "Feature Request Response",
      text: `Love this suggestion! Adding multi-channel webhook dispatching and live feed mockups was our first priority, but we're actively looking at additional platform integrations. Would love to hear how you'd use that in your launch workflow!`,
    },
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied discussion response to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="launch-tool-panel">
      <div className="launch-tool-header">
        <div className="launch-tool-title">
          <Trophy size={18} color="#ff6154" />
          <span>Product Hunt Launch Day Velocity Simulator & Playbook</span>
          <span className="launch-tool-badge" style={{ background: "rgba(255, 97, 84, 0.15)", color: "#ff6154", borderColor: "rgba(255, 97, 84, 0.3)" }}>
            Launch Day Strategy
          </span>
        </div>
      </div>

      {/* Upvote Velocity Calculator */}
      <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "14px", padding: "1.25rem", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.85rem" }}>
          <Calculator size={16} color="#ff6154" />
          <strong style={{ color: "#fff", fontSize: "0.95rem" }}>Live Upvote Velocity & Leaderboard Projector</strong>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.78rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>
              Hours Since Launch (0-24):
            </label>
            <input
              type="number"
              min="1"
              max="24"
              value={hoursElapsed}
              onChange={e => setHoursElapsed(Math.max(1, Math.min(24, Number(e.target.value))))}
              style={{ width: "100%", background: "#0b0f19", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "0.4rem 0.6rem", borderRadius: "8px" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.78rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>
              Current Upvote Count:
            </label>
            <input
              type="number"
              min="0"
              value={currentUpvotes}
              onChange={e => setCurrentUpvotes(Math.max(0, Number(e.target.value)))}
              style={{ width: "100%", background: "#0b0f19", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "0.4rem 0.6rem", borderRadius: "8px" }}
            />
          </div>

          <div style={{ background: "rgba(255, 97, 84, 0.1)", border: "1px solid rgba(255, 97, 84, 0.25)", borderRadius: "10px", padding: "0.6rem 0.85rem", textAlign: "center" }}>
            <span style={{ fontSize: "0.72rem", color: "#ff6154", fontWeight: 700, textTransform: "uppercase" }}>Velocity Pace</span>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#fff" }}>{hourlyRate} <small style={{ fontSize: "0.75rem", color: "#94a3b8" }}>votes/hr</small></div>
          </div>
        </div>

        {/* Milestone Targets Status */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem" }}>
            <Award size={16} color={projectedTotal >= targetTop5 ? "#10b981" : "#f59e0b"} />
            <span>Top 5 Badge: Projected <strong>{projectedTotal}</strong> / {targetTop5} votes ({projectedTotal >= targetTop5 ? "✅ On Track" : "⚠️ Needs Boost"})</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem" }}>
            <Trophy size={16} color={projectedTotal >= targetTop1 ? "#10b981" : "#f59e0b"} />
            <span>#1 Product of Day: Projected <strong>{projectedTotal}</strong> / {targetTop1} votes</span>
          </div>
        </div>
      </div>

      {/* Discussion Response Scripts */}
      <div>
        <strong style={{ color: "#fff", fontSize: "0.88rem", display: "block", marginBottom: "0.6rem" }}>
          💬 Fast Discussion Response Scripts for Maker:
        </strong>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {responses.map(r => (
            <div key={r.id} className="subtitle-item" style={{ alignItems: "flex-start" }}>
              <div style={{ flex: 1, paddingRight: "1rem" }}>
                <span className="subtitle-label">{r.topic}</span>
                <p style={{ margin: "0.3rem 0 0", fontSize: "0.85rem", color: "#cbd5e1", lineHeight: 1.5 }}>
                  {r.text}
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => handleCopy(r.id, r.text)}>
                {copiedId === r.id ? <Check size={13} /> : <Clipboard size={13} />}
                {copiedId === r.id ? "Copied" : "Copy"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
