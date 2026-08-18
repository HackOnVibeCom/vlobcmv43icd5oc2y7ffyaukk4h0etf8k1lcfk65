import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertTriangle, Check, CheckCircle, Clipboard, Flame, ShieldAlert, ShieldCheck, Sparkles } from "lucide-react";
import "./launch-tools.css";

type CommunityPlatform = "hn" | "reddit_sideproject" | "reddit_indiehackers";

type Context = {
  name: string;
  developer?: string;
  description: string;
  category?: string;
  sourceUrl?: string;
};

// Deterministic Anti-Spam / Hype Word Detector Engine
const HYPE_WORDS = [
  "revolutionary",
  "disruptive",
  "game-changer",
  "best app",
  "10x faster",
  "guaranteed",
  "unbelievable",
  "miracle",
  "secret sauce",
  "never seen before",
  "ultimate tool",
  "magic",
];

function analyzeSpamScore(text: string): {
  score: number;
  warnings: string[];
  passedChecks: string[];
} {
  const warnings: string[] = [];
  const passedChecks: string[] = [];
  let score = 95;

  const lower = text.toLowerCase();

  // 1. Check for hype words
  const foundHype = HYPE_WORDS.filter(w => lower.includes(w));
  if (foundHype.length > 0) {
    score -= foundHype.length * 15;
    warnings.push(`Contains promotional buzzwords (${foundHype.join(", ")}). Hacker News / Reddit mods often flag these.`);
  } else {
    passedChecks.push("Zero hype buzzwords detected — reads as authentic builder copy.");
  }

  // 2. Check for technical context / tech stack mention
  if (lower.includes("built with") || lower.includes("stack") || lower.includes("tech") || lower.includes("react") || lower.includes("node") || lower.includes("api")) {
    score += 5;
    passedChecks.push("Includes technical details / stack disclosure.");
  } else {
    warnings.push("Consider mentioning your tech stack — HN and Reddit developers appreciate engineering insights.");
  }

  // 3. Check for feedback solicitation
  if (lower.includes("feedback") || lower.includes("thoughts") || lower.includes("questions") || lower.includes("roast")) {
    passedChecks.push("Actively invites community feedback and critical discussion.");
  } else {
    score -= 10;
    warnings.push("Add a direct question asking for feedback or critique.");
  }

  const finalScore = Math.max(20, Math.min(100, score));

  return { score: finalScore, warnings, passedChecks };
}

export default function CommunityLaunchPanel({ context }: { context?: Context }) {
  const [platform, setPlatform] = useState<CommunityPlatform>("hn");
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  const appName = context?.name || "Your App";
  const desc = context?.description || "An intuitive new tool designed to solve key workflow friction.";
  const url = context?.sourceUrl || "https://pitchforge.app";

  const posts: Record<CommunityPlatform, { label: string; title: string; body: string }> = {
    hn: {
      label: "Hacker News (Show HN)",
      title: `Show HN: ${appName} – ${desc.slice(0, 70)}`,
      body: `Hey HN,\n\nI built ${appName} (${url}) to solve a specific problem I kept running into: ${desc}\n\nWhy I built this:\nExisting options felt either bloated with enterprise features or required too much manual setup. I wanted something fast, focused, and lightweight.\n\nTechnical Details & Stack:\n• Built with TypeScript, React, and Node\n• Prioritized deterministic rules engines to ensure zero-hallucination accuracy\n• Designed for instant guest usage without mandatory login barriers\n\nI'd love to hear your thoughts, critique on the architecture, and what features you'd want to see next. Happy to answer any questions about the build!`,
    },
    reddit_sideproject: {
      label: "Reddit /r/SideProject",
      title: `I built ${appName} — a tool that ${desc.slice(0, 60)} (Feedback appreciated!)`,
      body: `Hey everyone in r/SideProject!\n\nOver the past few weeks, I've been working on ${appName}.\n\nDemo link: ${url}\n\nWhat it does:\n${desc}\n\nWhy I made it:\nLike many of you, I noticed that doing this manually was taking hours of repetitive effort. I wanted to build a focused solution that does one thing exceptionally well.\n\nKey features:\n1. 100% free to test without creating an account\n2. Real-time feedback and deterministic quality scoring\n3. Export to Markdown and downloadable PDF\n\nWould really appreciate any honest feedback or brutal roasts on the UI/UX! Thanks!`,
    },
    reddit_indiehackers: {
      label: "Reddit /r/IndieHackers",
      title: `From idea to live launch: How I built and launched ${appName}`,
      body: `Hi Indie Hackers!\n\nJust shipped the first public version of ${appName}: ${url}\n\nContext & Problem:\n${desc}\n\nLessons learned during the build:\n• Keeping onboarding to zero required fields massively boosts conversion.\n• Building deterministic rules engines gives users much higher confidence than plain prompt wrappers.\n\nNext steps for growth:\nFocusing on community launch channels and gathering early user feedback.\n\nHow do you handle your launch workflows? Would love your thoughts!`,
    },
  };

  const activePost = posts[platform];
  const spamAnalysis = useMemo(() => analyzeSpamScore(activePost.body), [activePost.body]);

  const handleCopyTitle = () => {
    navigator.clipboard.writeText(activePost.title);
    setCopiedTitle(true);
    toast.success("Copied post title");
    setTimeout(() => setCopiedTitle(false), 2000);
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(activePost.body);
    setCopiedBody(true);
    toast.success("Copied community post body");
    setTimeout(() => setCopiedBody(false), 2000);
  };

  return (
    <div className="launch-tool-panel">
      <div className="launch-tool-header">
        <div className="launch-tool-title">
          <Flame size={18} color="#f97316" />
          <span>Hacker News (Show HN) & Reddit Launch Studio</span>
          <span className="launch-tool-badge" style={{ background: "rgba(249, 115, 22, 0.15)", color: "#fb923c", borderColor: "rgba(249, 115, 22, 0.3)" }}>
            Community Native
          </span>
        </div>
      </div>

      <div className="pitch-tabs">
        {(Object.keys(posts) as CommunityPlatform[]).map(p => (
          <button
            key={p}
            type="button"
            className={`pitch-tab-btn ${platform === p ? "is-active" : ""}`}
            onClick={() => setPlatform(p)}
          >
            {posts[p].label}
          </button>
        ))}
      </div>

      {/* Anti-Spam Scorer Card */}
      <div className={`spam-meter-card ${spamAnalysis.warnings.length > 0 ? "has-warnings" : ""}`}>
        <div className="spam-meter-title">
          {spamAnalysis.score >= 80 ? (
            <ShieldCheck size={18} color="#10b981" />
          ) : (
            <ShieldAlert size={18} color="#f59e0b" />
          )}
          <span>Anti-Self-Promotion & Authenticity Score</span>
        </div>
        <div className="spam-score-pill" style={{ background: spamAnalysis.score >= 80 ? "#10b981" : "#f59e0b" }}>
          {spamAnalysis.score}/100 Grade {spamAnalysis.score >= 90 ? "A+" : spamAnalysis.score >= 80 ? "A" : "B"}
        </div>
      </div>

      {/* Passed Checks & Warnings */}
      <div style={{ marginBottom: "0.85rem", fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        {spamAnalysis.passedChecks.map((msg, i) => (
          <div key={i} style={{ color: "#10b981", display: "flex", alignItems: "center", gap: 5 }}>
            <Check size={12} /> {msg}
          </div>
        ))}
        {spamAnalysis.warnings.map((msg, i) => (
          <div key={i} style={{ color: "#f59e0b", display: "flex", alignItems: "center", gap: 5 }}>
            <AlertTriangle size={12} /> {msg}
          </div>
        ))}
      </div>

      {/* Title Box */}
      <div className="pitch-subject-box">
        <div>
          <strong style={{ color: "#f97316", fontSize: "0.78rem", textTransform: "uppercase", display: "block" }}>Post Title:</strong>
          <span>{activePost.title}</span>
        </div>
        <Button size="sm" variant="ghost" onClick={handleCopyTitle}>
          {copiedTitle ? <Check size={13} /> : <Clipboard size={13} />}
          {copiedTitle ? "Copied" : "Copy Title"}
        </Button>
      </div>

      {/* Body Box */}
      <div className="pitch-body-box">{activePost.body}</div>

      <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "flex-end" }}>
        <Button size="sm" onClick={handleCopyBody}>
          {copiedBody ? <Check size={14} /> : <Clipboard size={14} />}
          {copiedBody ? "Copied Post" : "Copy Post Body"}
        </Button>
      </div>
    </div>
  );
}
