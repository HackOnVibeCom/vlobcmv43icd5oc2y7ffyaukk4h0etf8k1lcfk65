import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Clipboard, LayoutGrid, Smartphone, Sparkles } from "lucide-react";
import "./launch-tools.css";

type Slide = {
  id: number;
  slideRole: string;
  headline: string;
  subline: string;
  color: string;
};

type Context = {
  name: string;
  developer?: string;
  description: string;
  category?: string;
  sourceUrl?: string;
};

export default function ScreenshotStoryboard({ context }: { context?: Context }) {
  const appName = context?.name || "Your App";
  const desc = context?.description || "An all-in-one launch marketing engine for mobile applications.";

  const [slides, setSlides] = useState<Slide[]>([
    {
      id: 1,
      slideRole: "Slide 1 · Hero Hook",
      headline: `${appName}: Reimagined`,
      subline: desc.slice(0, 45),
      color: "linear-gradient(135deg, #4f46e5, #06b6d4)",
    },
    {
      id: 2,
      slideRole: "Slide 2 · Core Magic",
      headline: "Instant 6-Platform Copy",
      subline: "From 1 store link to launch-ready posts",
      color: "linear-gradient(135deg, #059669, #10b981)",
    },
    {
      id: 3,
      slideRole: "Slide 3 · ASO Quality Grade",
      headline: "Deterministic ASO Engine",
      subline: "Auditable A-F scoring & launch checks",
      color: "linear-gradient(135deg, #d97706, #f59e0b)",
    },
    {
      id: 4,
      slideRole: "Slide 4 · Multi-Channel Dispatch",
      headline: "1-Click Auto-Publish",
      subline: "Direct delivery to Discord, Slack & webhooks",
      color: "linear-gradient(135deg, #7c3aed, #a855f7)",
    },
    {
      id: 5,
      slideRole: "Slide 5 · Call To Action",
      headline: "Launch Your App Today",
      subline: "100% Free demo — no account required",
      color: "linear-gradient(135deg, #dc2626, #f43f5e)",
    },
  ]);

  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopySlide = (s: Slide) => {
    const text = `Screenshot Slide ${s.id} (${s.slideRole}):\nHeadline: "${s.headline}"\nSubline: "${s.subline}"`;
    navigator.clipboard.writeText(text);
    setCopiedId(s.id);
    toast.success(`Copied Slide ${s.id} copy for design export!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    const all = slides
      .map(s => `Slide ${s.id} [${s.slideRole}]:\n• Headline: ${s.headline}\n• Subline: ${s.subline}`)
      .join("\n\n");
    navigator.clipboard.writeText(all);
    toast.success("Copied all 5 screenshot graphic specs to clipboard!");
  };

  return (
    <div className="launch-tool-panel">
      <div className="launch-tool-header">
        <div className="launch-tool-title">
          <LayoutGrid size={18} color="#818cf8" />
          <span>App Store Screenshot Storyboard & Graphic Spec</span>
          <span className="launch-tool-badge">5-Slide Sequence</span>
        </div>
        <Button size="sm" variant="outline" onClick={handleCopyAll}>
          <Clipboard size={13} /> Copy All 5 Slide Specs
        </Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        {slides.map(s => (
          <div
            key={s.id}
            style={{
              background: "#0c101d",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "260px",
            }}
          >
            <div>
              <span style={{ fontSize: "0.72rem", color: "#818cf8", fontWeight: 700, textTransform: "uppercase" }}>
                {s.slideRole}
              </span>
              <h4 style={{ margin: "0.5rem 0 0.25rem 0", fontSize: "1.05rem", fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
                {s.headline}
              </h4>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#94a3b8", lineHeight: 1.4 }}>
                {s.subline}
              </p>
            </div>

            {/* Mobile Graphic Simulator Box */}
            <div
              style={{
                width: "100%",
                height: "90px",
                borderRadius: "10px",
                background: s.color,
                marginTop: "0.75rem",
                marginBottom: "0.75rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              <Smartphone size={22} />
              <span style={{ fontSize: "0.7rem", fontWeight: 600, marginTop: 2 }}>Device Mockup</span>
            </div>

            <Button size="sm" variant="ghost" onClick={() => handleCopySlide(s)}>
              {copiedId === s.id ? <Check size={12} /> : <Clipboard size={12} />}
              {copiedId === s.id ? "Copied" : "Copy Spec"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
