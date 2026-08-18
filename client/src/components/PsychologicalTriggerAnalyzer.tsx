import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, Flame, HeartHandshake, Lightbulb, ShieldCheck, Sparkles, Target, Zap } from "lucide-react";
import "./launch-tools.css";

type TriggerResult = {
  name: string;
  icon: any;
  score: number; // 0 to 100
  foundWords: string[];
  recommendation: string;
};

const TRIGGER_LEXICON = {
  curiosity: ["discover", "reveal", "how to", "why", "secret", "unlock", "inside", "new way", "finally"],
  painPoint: ["tired of", "stop", "wasting", "frustrating", "manual", "repetitive", "struggle", "friction", "problem", "hours"],
  socialProof: ["developers", "builders", "trusted", "community", "studios", "thousands", "rated", "users", "featured"],
  urgency: ["now", "today", "instant", "seconds", "get started", "limited", "launching", "first look"],
  quantValue: ["1", "2", "3", "4", "5", "6", "10", "100%", "24/7", "zero", "free", "all-in-one", "x faster"],
};

function analyzeTriggers(text: string): {
  overallScore: number;
  triggers: TriggerResult[];
} {
  const lower = text.toLowerCase();

  const triggers: TriggerResult[] = [
    {
      name: "Curiosity & Hook",
      icon: Lightbulb,
      score: 0,
      foundWords: [],
      recommendation: "Use intrigue words like 'finally', 'discover', or 'new way' to stop feed scrolling.",
    },
    {
      name: "Pain-Point Agitation",
      icon: Flame,
      score: 0,
      foundWords: [],
      recommendation: "Clearly call out the frustrating manual problem your app eliminates.",
    },
    {
      name: "Social Proof & Credibility",
      icon: ShieldCheck,
      score: 0,
      foundWords: [],
      recommendation: "Mention target audience identity (e.g. 'for indie hackers and developers').",
    },
    {
      name: "Urgency & Call to Action",
      icon: Zap,
      score: 0,
      foundWords: [],
      recommendation: "End with an active, friction-free CTA (e.g. 'Try free in seconds').",
    },
    {
      name: "Quantifiable Value & Metrics",
      icon: Target,
      score: 0,
      foundWords: [],
      recommendation: "Include concrete numbers (e.g. '6 platforms from 1 link', '100% free').",
    },
  ];

  // 1. Curiosity
  const foundCuriosity = TRIGGER_LEXICON.curiosity.filter(w => lower.includes(w));
  triggers[0].foundWords = foundCuriosity;
  triggers[0].score = Math.min(100, Math.max(30, foundCuriosity.length * 40));

  // 2. Pain point
  const foundPain = TRIGGER_LEXICON.painPoint.filter(w => lower.includes(w));
  triggers[1].foundWords = foundPain;
  triggers[1].score = Math.min(100, Math.max(25, foundPain.length * 40));

  // 3. Social proof
  const foundProof = TRIGGER_LEXICON.socialProof.filter(w => lower.includes(w));
  triggers[2].foundWords = foundProof;
  triggers[2].score = Math.min(100, Math.max(35, foundProof.length * 45));

  // 4. Urgency
  const foundUrgency = TRIGGER_LEXICON.urgency.filter(w => lower.includes(w));
  triggers[3].foundWords = foundUrgency;
  triggers[3].score = Math.min(100, Math.max(30, foundUrgency.length * 40));

  // 5. Value
  const foundValue = TRIGGER_LEXICON.quantValue.filter(w => lower.includes(w));
  triggers[4].foundWords = foundValue;
  triggers[4].score = Math.min(100, Math.max(40, foundValue.length * 35));

  const total = Math.round(triggers.reduce((sum, t) => sum + t.score, 0) / triggers.length);

  return { overallScore: total, triggers };
}

type Context = {
  name: string;
  developer?: string;
  description: string;
};

export default function PsychologicalTriggerAnalyzer({ context }: { context?: Context }) {
  const [copyText, setCopyText] = useState(
    context?.description ||
      "Stop wasting hours rewriting the same story for 6 different app stores and social platforms. PitchForge turns 1 app link into launch-ready posts with deterministic ASO scoring. Try free today in seconds."
  );

  const analysis = useMemo(() => analyzeTriggers(copyText), [copyText]);

  return (
    <div className="launch-tool-panel">
      <div className="launch-tool-header">
        <div className="launch-tool-title">
          <Sparkles size={18} color="#818cf8" />
          <span>Psychological Conversion Trigger Analyzer</span>
          <span className="launch-tool-badge">CTR Optimizer</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Conversion Power:</span>
          <span style={{ fontSize: "1rem", fontWeight: 800, color: analysis.overallScore >= 80 ? "#10b981" : "#f59e0b" }}>
            {analysis.overallScore} / 100
          </span>
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ fontSize: "0.78rem", color: "#94a3b8", display: "block", marginBottom: 4 }}>
          Live Copy Under Analysis (Edit in real-time to watch trigger scores adjust):
        </label>
        <Textarea
          value={copyText}
          onChange={e => setCopyText(e.target.value)}
          rows={3}
          style={{ background: "#0b0f19", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "0.88rem" }}
        />
      </div>

      {/* 5 Psychological Drivers Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
        {analysis.triggers.map((t, idx) => {
          const Icon = t.icon;
          const isHigh = t.score >= 70;
          return (
            <div
              key={idx}
              style={{
                background: "rgba(0,0,0,0.25)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                padding: "0.85rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.82rem", fontWeight: 600, color: "#fff" }}>
                    <Icon size={14} color="#818cf8" /> {t.name}
                  </span>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: isHigh ? "#10b981" : "#f59e0b" }}>
                    {t.score}%
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden", marginBottom: "0.5rem" }}>
                  <div style={{ width: `${t.score}%`, height: "100%", background: isHigh ? "#10b981" : "#f59e0b", transition: "width 0.3s ease" }} />
                </div>

                {t.foundWords.length > 0 ? (
                  <div style={{ fontSize: "0.72rem", color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
                    <Check size={11} /> Matched: {t.foundWords.join(", ")}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8", lineHeight: 1.35 }}>
                    💡 {t.recommendation}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
