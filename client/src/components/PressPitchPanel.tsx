import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Clipboard, Mail, Newspaper, Send, Sparkles } from "lucide-react";
import "./launch-tools.css";

type PitchType = "journalist" | "newsletter" | "creator";

type Context = {
  name: string;
  developer?: string;
  description: string;
  category?: string;
  sourceUrl?: string;
};

export default function PressPitchPanel({ context }: { context?: Context }) {
  const [pitchType, setPitchType] = useState<PitchType>("journalist");
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  const appName = context?.name || "Your App";
  const desc = context?.description || "A powerful app built for modern users.";
  const category = context?.category || "Productivity & Utilities";
  const url = context?.sourceUrl || "https://pitchforge.app";

  const pitches: Record<PitchType, { label: string; subject: string; body: string }> = {
    journalist: {
      label: "Tech Journalist Pitch",
      subject: `Story Pitch: How ${appName} is reimagining ${category.toLowerCase()}`,
      body: `Hi [Reporter Name],\n\nHope your week is off to a great start. I've been following your coverage of tech and wanted to share an exclusive first look at ${appName}.\n\nWhat it is: ${appName} is designed to solve a major problem for users: ${desc.slice(0, 140)}.\n\nKey Highlights:\n• Solves the core friction in ${category}\n• Built from the ground up for speed, simplicity, and focus\n• Live on App Store & Google Play today\n\nLink to explore: ${url}\nPress Kit & Assets: [Link to Media Kit]\n\nHappy to provide demo access credentials or a short founder comment on why we built this if you're interested in covering it.\n\nBest regards,\n[Your Name]\nFounder, ${appName}`,
    },
    newsletter: {
      label: "Newsletter Curator Pitch",
      subject: `Tool for your next roundup: ${appName} (Fresh Launch)`,
      body: `Hey [Curator Name],\n\nLong-time reader of your newsletter! Thought your readers would love this new release:\n\n🚀 Tool: ${appName}\n💡 One-line pitch: ${desc.slice(0, 120)}\n🔗 Link: ${url}\n\nWhy it fits your audience: Most tools in this space are either overly complex or outdated. We built ${appName} to give users an instant, frictionless experience.\n\nWe'd love to offer an exclusive perk or extended trial for your newsletter community if you feature it!\n\nCheers,\n[Your Name]`,
    },
    creator: {
      label: "Creator / Influencer DM",
      subject: `Quick collaboration idea for ${appName}`,
      body: `Hey [Creator Name]! Love your recent content on ${category.toLowerCase()}.\n\nWe just launched ${appName} (${url}) and think your audience would get huge value from it. ${desc.slice(0, 110)}.\n\nWould love to send you full VIP access to test it out—no strings attached. Let me know if you'd like a code!\n\nBest,\n[Your Name]`,
    },
  };

  const activePitch = pitches[pitchType];

  const handleCopySubject = () => {
    navigator.clipboard.writeText(activePitch.subject);
    setCopiedSubject(true);
    toast.success("Copied subject line to clipboard");
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(activePitch.body);
    setCopiedBody(true);
    toast.success("Copied email body to clipboard");
    setTimeout(() => setCopiedBody(false), 2000);
  };

  const handleOpenMailto = () => {
    const mailto = `mailto:?subject=${encodeURIComponent(activePitch.subject)}&body=${encodeURIComponent(activePitch.body)}`;
    window.open(mailto, "_blank");
  };

  return (
    <div className="launch-tool-panel">
      <div className="launch-tool-header">
        <div className="launch-tool-title">
          <Newspaper size={18} color="#818cf8" />
          <span>Press & Newsletter Outreach Pitch Drafter</span>
          <span className="launch-tool-badge">PR Studio</span>
        </div>
        <Button size="sm" variant="outline" onClick={handleOpenMailto}>
          <Mail size={13} /> Open in Email App
        </Button>
      </div>

      <div className="pitch-tabs">
        {(Object.keys(pitches) as PitchType[]).map(t => (
          <button
            key={t}
            type="button"
            className={`pitch-tab-btn ${pitchType === t ? "is-active" : ""}`}
            onClick={() => setPitchType(t)}
          >
            {pitches[t].label}
          </button>
        ))}
      </div>

      <div className="pitch-subject-box">
        <div>
          <strong style={{ color: "#818cf8", fontSize: "0.78rem", textTransform: "uppercase", display: "block" }}>Subject Line:</strong>
          <span>{activePitch.subject}</span>
        </div>
        <Button size="sm" variant="ghost" onClick={handleCopySubject}>
          {copiedSubject ? <Check size={13} /> : <Clipboard size={13} />}
          {copiedSubject ? "Copied" : "Copy Subject"}
        </Button>
      </div>

      <div className="pitch-body-box">{activePitch.body}</div>

      <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "flex-end" }}>
        <Button size="sm" onClick={handleCopyBody}>
          {copiedBody ? <Check size={14} /> : <Clipboard size={14} />}
          {copiedBody ? "Copied Full Pitch" : "Copy Full Pitch"}
        </Button>
      </div>
    </div>
  );
}
