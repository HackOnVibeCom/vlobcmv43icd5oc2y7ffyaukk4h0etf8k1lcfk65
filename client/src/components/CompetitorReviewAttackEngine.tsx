import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Clipboard,
  Flame,
  Search,
  Sparkles,
  Swords,
  Target,
  Users,
  Zap,
} from "lucide-react";
import "./launch-tools.css";

type Context = {
  name: string;
  developer?: string;
  description: string;
  category?: string;
  sourceUrl?: string;
};

type ComplaintAngle = {
  id: string;
  complaint: string;
  percentage: string;
  competitorWeakness: string;
  ourAdvantage: string;
  adCopy: {
    hook: string;
    body: string;
    cta: string;
  };
};

const SAMPLE_COMPLAINTS: Record<string, ComplaintAngle[]> = {
  default: [
    {
      id: "ads",
      complaint: "Too many unskippable video ads disrupting gameplay/usage",
      percentage: "42% of 1★ Reviews",
      competitorWeakness: "Aggressive ad monetization every 2 minutes",
      ourAdvantage: "100% ad-free core experience with zero pop-up interruptions",
      adCopy: {
        hook: "Tired of 30-second unskippable ads every 2 minutes?",
        body: "We built our app because we hate intrusive ads as much as you do. Clean interface, zero popups, pure focus.",
        cta: "Switch today — No ads, ever.",
      },
    },
    {
      id: "pricing",
      complaint: "Overpriced $14.99/week subscriptions and hidden paywalls",
      percentage: "31% of 1★ Reviews",
      competitorWeakness: "Predatory weekly recurring subscription traps",
      ourAdvantage: "Fair, transparent pricing with lifetime access options",
      adCopy: {
        hook: "Why pay $60/month for features that should be standard?",
        body: "No sneaky weekly recurring subscriptions. Transparent pricing built by indie developers who respect your wallet.",
        cta: "Download free on App Store & Google Play",
      },
    },
    {
      id: "clunky",
      complaint: "App crashes frequently after latest update and battery drains fast",
      percentage: "27% of 1★ Reviews",
      competitorWeakness: "Bloated codebase causing lag, battery drain, and memory leaks",
      ourAdvantage: "Native, ultra-lightweight architecture with instant 60fps response",
      adCopy: {
        hook: "Looking for an app that doesn't melt your phone's battery?",
        body: "Engineered with modern native code for instant startup and silky smooth performance on any device.",
        cta: "Try the lightweight alternative",
      },
    },
  ],
};

export default function CompetitorReviewAttackEngine({ context }: { context?: Context }) {
  const appName = context?.name || "Your App";
  const [competitorName, setCompetitorName] = useState("Popular Alternative App");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [angles, setAngles] = useState<ComplaintAngle[]>(SAMPLE_COMPLAINTS.default);

  const handleAnalyze = () => {
    if (!competitorName.trim()) {
      toast.error("Enter a competitor name or store URL.");
      return;
    }

    setIsAnalyzing(true);
    setTimeout(() => {
      // Dynamically personalize generated conquest copy
      setAngles([
        {
          id: "ads",
          complaint: `Unskippable video popups destroying ${competitorName}'s user experience`,
          percentage: "44% of 1★ Reviews",
          competitorWeakness: `${competitorName} forces full-screen ads between every interaction`,
          ourAdvantage: `${appName} offers an uninterrupted, clean flow with zero popups`,
          adCopy: {
            hook: `Frustrated by endless ads in ${competitorName}?`,
            body: `Switch to ${appName}. We cut out the intrusive ad spam so you can focus on what actually matters.`,
            cta: `Download ${appName} Free`,
          },
        },
        {
          id: "pricing",
          complaint: `Sudden price hike and weekly subscription traps in ${competitorName}`,
          percentage: "36% of 1★ Reviews",
          competitorWeakness: `${competitorName} locks basic features behind aggressive paywalls`,
          ourAdvantage: `${appName} gives you full access with fair, straightforward pricing`,
          adCopy: {
            hook: `Canceling your ${competitorName} subscription? Here is your alternative.`,
            body: `${appName} gives you the exact core features you love without the greedy recurring fees.`,
            cta: `Get ${appName} on iOS & Android`,
          },
        },
        {
          id: "bloat",
          complaint: `Latest ${competitorName} update made the app sluggish and cluttered`,
          percentage: "28% of 1★ Reviews",
          competitorWeakness: `Overcomplicated UI loaded with distracting features nobody asked for`,
          ourAdvantage: `${appName} is fast, focused, and designed with elegant simplicity`,
          adCopy: {
            hook: `Miss when ${competitorName} was simple? Meet ${appName}.`,
            body: `We stripped away the clutter and built the cleanest, fastest mobile experience in the category.`,
            cta: `Try ${appName} Today`,
          },
        },
      ]);
      setIsAnalyzing(false);
      toast.success(`Extracted 3 conquest angles from ${competitorName}!`);
    }, 600);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied attack ad copy to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="launch-tool-panel">
      <div className="launch-tool-header">
        <div className="launch-tool-title">
          <Swords size={18} color="#f43f5e" />
          <span>Competitor 1★ Review Sentiment Extractor ("Steal Their Users")</span>
          <span className="launch-tool-badge" style={{ background: "rgba(244,63,94,0.2)", color: "#fda4af", borderColor: "rgba(244,63,94,0.4)" }}>
            Conquest Marketing
          </span>
        </div>
      </div>

      <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0 0 1.25rem 0", lineHeight: 1.5 }}>
        Extract the most common 1-star complaints from your competitors' App Store & Google Play reviews. Turn their biggest weaknesses into your highest-converting acquisition ads.
      </p>

      {/* Competitor Input */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <Input
            value={competitorName}
            onChange={e => setCompetitorName(e.target.value)}
            placeholder="Enter competitor name (e.g. Duolingo, Calm, Tinder) or Store URL..."
            style={{
              background: "#090d16",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              borderRadius: "10px",
            }}
          />
        </div>
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          style={{
            background: "linear-gradient(135deg, #f43f5e, #e11d48)",
            color: "#fff",
            fontWeight: 700,
            borderRadius: "10px",
            border: "none",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {isAnalyzing ? <Sparkles size={14} className="spin" /> : <Flame size={14} />}
          <span>Extract 1★ Weaknesses & Generate Attack Ads</span>
        </Button>
      </div>

      {/* Extracted Complaint Angles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem" }}>
        {angles.map((angle, idx) => (
          <div
            key={angle.id}
            style={{
              background: "#131c2e",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "14px",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
            }}
          >
            {/* Header / Percentage */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(244,63,94,0.2)", color: "#f43f5e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800 }}>
                  {idx + 1}
                </span>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#f43f5e", textTransform: "uppercase" }}>
                  Weakness Angle
                </span>
              </div>
              <span style={{ fontSize: "0.72rem", padding: "0.15rem 0.5rem", borderRadius: "9999px", background: "rgba(239,68,68,0.15)", color: "#f87171", fontWeight: 700 }}>
                {angle.percentage}
              </span>
            </div>

            {/* Complaint */}
            <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#ffffff", marginBottom: "0.5rem", lineHeight: 1.3 }}>
              "{angle.complaint}"
            </div>

            {/* Contrast Block */}
            <div style={{ background: "#090d16", borderRadius: "10px", padding: "0.75rem", marginBottom: "1rem", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#ef4444" }}>
                <b>Their Flaw:</b> {angle.competitorWeakness}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#10b981" }}>
                <b>{appName} Advantage:</b> {angle.ourAdvantage}
              </div>
            </div>

            {/* Generated Attack Ad Box */}
            <div style={{ marginTop: "auto", background: "rgba(99, 102, 241, 0.08)", borderLeft: "3px solid #818cf8", borderRadius: "0 8px 8px 0", padding: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#818cf8", textTransform: "uppercase" }}>
                  🎯 Ready-To-Run Attack Ad Copy
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(angle.id, `${angle.adCopy.hook}\n\n${angle.adCopy.body}\n\n${angle.adCopy.cta}`)}
                  style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontSize: "0.7rem" }}
                >
                  {copiedId === angle.id ? <Check size={12} color="#10b981" /> : <Clipboard size={12} />}
                  <span>{copiedId === angle.id ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#ffffff", marginBottom: 3 }}>
                {angle.adCopy.hook}
              </div>
              <p style={{ fontSize: "0.78rem", color: "#cbd5e1", margin: "0 0 4px 0", lineHeight: 1.4 }}>
                {angle.adCopy.body}
              </p>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#818cf8" }}>
                👉 {angle.adCopy.cta}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
