import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Clipboard, Hash, Sparkles, Tag, Zap } from "lucide-react";
import "./launch-tools.css";

type PlatformFormat = "app_store_subtitle" | "product_hunt_tagline" | "play_store_tagline";

type Context = {
  name: string;
  developer?: string;
  description: string;
  category?: string;
};

type TaglineAngle = {
  id: string;
  angleLabel: string;
  text: string;
};

export default function SubtitleMatrixPanel({ context }: { context?: Context }) {
  const [format, setFormat] = useState<PlatformFormat>("app_store_subtitle");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const appName = context?.name || "Your App";
  const desc = context?.description || "Smart app launch studio";

  const formats: Record<PlatformFormat, { label: string; limit: number; items: TaglineAngle[] }> = {
    app_store_subtitle: {
      label: "App Store Subtitle (30 Chars Max)",
      limit: 30,
      items: [
        { id: "s1", angleLabel: "Benefit First", text: "Fast & Focused Launch Copy" },
        { id: "s2", angleLabel: "Feature Led", text: "One App Link, Six Posts" },
        { id: "s3", angleLabel: "Action Oriented", text: "Craft, Score & Publish Copy" },
        { id: "s4", angleLabel: "Audience Focused", text: "Indie Hacker Launch Studio" },
        { id: "s5", angleLabel: "Minimalist", text: "Launch Copy in Seconds" },
      ],
    },
    product_hunt_tagline: {
      label: "Product Hunt Punchline (60 Chars Max)",
      limit: 60,
      items: [
        { id: "p1", angleLabel: "The Hook", text: "One app link. Six launch-ready posts. Auto-published." },
        { id: "p2", angleLabel: "Problem/Solution", text: "Stop rewriting launch copy: ASO score & post in 1-click." },
        { id: "p3", angleLabel: "Value Prop", text: "Launch-ready copy for 6 platforms with zero login needed." },
        { id: "p4", angleLabel: "Speed Angle", text: "From store URL to multi-platform campaign in 10 seconds." },
        { id: "p5", angleLabel: "Indie Focus", text: "The all-in-one launch marketing engine for indie developers." },
      ],
    },
    play_store_tagline: {
      label: "Play Store Hero Line (80 Chars Max)",
      limit: 80,
      items: [
        { id: "g1", angleLabel: "Feature Rich", text: "Generate, grade, and auto-dispatch launch posts to all major social channels." },
        { id: "g2", angleLabel: "Deterministic Score", text: "Auditable ASO grading and launch checklist to rank higher on day one." },
        { id: "g3", angleLabel: "Frictionless", text: "Turn your app brief into 6 tailored platform posts without any account." },
        { id: "g4", angleLabel: "High Impact", text: "Maximize day-one store impressions with ASO-optimized descriptions." },
        { id: "g5", angleLabel: "All-in-One", text: "Complete launch toolkit: Copy, ASO scores, keyword packer, and scheduler." },
      ],
    },
  };

  const activeFormat = formats[format];

  const handleCopy = (item: TaglineAngle) => {
    navigator.clipboard.writeText(item.text);
    setCopiedId(item.id);
    toast.success(`Copied: "${item.text}"`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="launch-tool-panel">
      <div className="launch-tool-header">
        <div className="launch-tool-title">
          <Tag size={18} color="#818cf8" />
          <span>App Store Subtitle & Tagline Matrix</span>
          <span className="launch-tool-badge">Micro-Copy Studio</span>
        </div>
      </div>

      <div className="pitch-tabs">
        {(Object.keys(formats) as PlatformFormat[]).map(f => (
          <button
            key={f}
            type="button"
            className={`pitch-tab-btn ${format === f ? "is-active" : ""}`}
            onClick={() => setFormat(f)}
          >
            {formats[f].label}
          </button>
        ))}
      </div>

      <div className="subtitle-matrix-grid">
        {activeFormat.items.map(item => {
          const charCount = item.text.length;
          const isOver = charCount > activeFormat.limit;
          return (
            <div key={item.id} className="subtitle-item">
              <div className="subtitle-text-info">
                <span className="subtitle-label">{item.angleLabel}</span>
                <span className="subtitle-copy">"{item.text}"</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span className={`subtitle-char-badge ${isOver ? "over" : ""}`}>
                  {charCount} / {activeFormat.limit} chars
                </span>
                <Button size="sm" variant="ghost" onClick={() => handleCopy(item)}>
                  {copiedId === item.id ? <Check size={13} /> : <Clipboard size={13} />}
                  {copiedId === item.id ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
