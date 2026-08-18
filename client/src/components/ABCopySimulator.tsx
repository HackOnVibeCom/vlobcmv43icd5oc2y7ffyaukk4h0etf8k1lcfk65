import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Clipboard, FlaskConical, Sparkles, Trophy } from "lucide-react";
import "./launch-tools.css";

type Context = { name: string; description: string };

const METRICS = ["Clarity", "Emotion", "Specificity", "CTA Strength", "Hook Power"] as const;

const LEXICONS: Record<string, string[]> = {
  Clarity: ["simple", "easy", "clear", "straightforward", "just", "one", "single", "tap"],
  Emotion: ["love", "amazing", "beautiful", "wow", "delight", "joy", "exciting", "finally", "hate", "frustrating"],
  Specificity: ["6", "1", "30", "100%", "seconds", "platforms", "channels", "app store", "google play"],
  "CTA Strength": ["try", "download", "get", "start", "free", "sign up", "click", "join", "launch", "grab"],
  "Hook Power": ["stop", "imagine", "what if", "tired of", "introducing", "meet", "discover", "secret", "never"],
};

function scoreText(text: string): Record<string, number> {
  const lower = text.toLowerCase();
  const scores: Record<string, number> = {};
  for (const metric of METRICS) {
    const matches = LEXICONS[metric].filter(w => lower.includes(w)).length;
    scores[metric] = Math.min(100, Math.max(20, matches * 30 + 15));
  }
  return scores;
}

export default function ABCopySimulator({ context }: { context?: Context }) {
  const appName = context?.name || "Your App";

  const [variantA, setVariantA] = useState(
    `${appName} turns 1 app store link into 6 launch-ready social posts. Try free in seconds — no sign-up needed.`
  );
  const [variantB, setVariantB] = useState(
    `Stop wasting hours rewriting the same pitch for every platform. ${appName} generates all your launch copy from a single URL.`
  );

  const scoresA = useMemo(() => scoreText(variantA), [variantA]);
  const scoresB = useMemo(() => scoreText(variantB), [variantB]);

  const avgA = Math.round(METRICS.reduce((s, m) => s + scoresA[m], 0) / METRICS.length);
  const avgB = Math.round(METRICS.reduce((s, m) => s + scoresB[m], 0) / METRICS.length);
  const winner = avgA >= avgB ? "A" : "B";
  const confidence = Math.min(95, Math.abs(avgA - avgB) * 3 + 55);

  return (
    <div className="launch-tool-panel">
      <div className="launch-tool-header">
        <div className="launch-tool-title">
          <FlaskConical size={18} color="#818cf8" />
          <span>A/B Copy Testing Simulator</span>
          <span className="launch-tool-badge">Predicted Engagement</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {/* Variant A */}
        <div style={{ background: "rgba(0,0,0,0.25)", border: `1px solid ${winner === "A" ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: "12px", padding: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontWeight: 700, color: "#fff" }}>Variant A <small style={{ color: "#94a3b8" }}>(Benefit-Led)</small></span>
            <span style={{ fontWeight: 700, color: winner === "A" ? "#10b981" : "#94a3b8" }}>{avgA}%</span>
          </div>
          <Textarea value={variantA} onChange={e => setVariantA(e.target.value)} rows={3} style={{ background: "#0b0f19", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "0.85rem", marginBottom: "0.75rem" }} />
          {METRICS.map(m => (
            <div key={m} style={{ marginBottom: "0.3rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#94a3b8" }}>
                <span>{m}</span><span>{scoresA[m]}%</span>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${scoresA[m]}%`, height: "100%", background: "#6366f1", transition: "width .3s" }} />
              </div>
            </div>
          ))}
          <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(variantA); toast.success("Copied Variant A!"); }} style={{ marginTop: "0.5rem" }}>
            <Clipboard size={12} /> Use Variant A
          </Button>
        </div>

        {/* Variant B */}
        <div style={{ background: "rgba(0,0,0,0.25)", border: `1px solid ${winner === "B" ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: "12px", padding: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontWeight: 700, color: "#fff" }}>Variant B <small style={{ color: "#94a3b8" }}>(Problem-Led)</small></span>
            <span style={{ fontWeight: 700, color: winner === "B" ? "#10b981" : "#94a3b8" }}>{avgB}%</span>
          </div>
          <Textarea value={variantB} onChange={e => setVariantB(e.target.value)} rows={3} style={{ background: "#0b0f19", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "0.85rem", marginBottom: "0.75rem" }} />
          {METRICS.map(m => (
            <div key={m} style={{ marginBottom: "0.3rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#94a3b8" }}>
                <span>{m}</span><span>{scoresB[m]}%</span>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${scoresB[m]}%`, height: "100%", background: "#f59e0b", transition: "width .3s" }} />
              </div>
            </div>
          ))}
          <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(variantB); toast.success("Copied Variant B!"); }} style={{ marginTop: "0.5rem" }}>
            <Clipboard size={12} /> Use Variant B
          </Button>
        </div>
      </div>

      {/* Winner Declaration */}
      <div style={{ marginTop: "1rem", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "10px", padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <Trophy size={18} color="#10b981" />
        <span style={{ color: "#fff", fontWeight: 600 }}>
          Variant {winner} wins with {confidence}% confidence ({winner === "A" ? avgA : avgB}% vs {winner === "A" ? avgB : avgA}%)
        </span>
      </div>
    </div>
  );
}
