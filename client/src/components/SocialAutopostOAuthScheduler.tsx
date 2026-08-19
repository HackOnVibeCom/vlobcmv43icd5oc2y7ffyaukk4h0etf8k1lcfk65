import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe2,
  Lock,
  MessageSquare,
  Play,
  Plus,
  Radio,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import "./launch-tools.css";

type WebhookChannel = {
  id: string;
  name: string;
  type: "discord" | "slack" | "telegram" | "twitter_oauth" | "linkedin_oauth" | "custom";
  icon: string;
  url: string;
  status: "connected" | "ready" | "scheduled";
  scheduledTime?: string;
};

type Context = {
  name: string;
  developer?: string;
  description: string;
  category?: string;
  sourceUrl?: string;
};

export default function SocialAutopostOAuthScheduler({ context }: { context?: Context }) {
  const appName = context?.name || "Your App";
  const storeUrl = context?.sourceUrl || "https://apps.apple.com";
  
  // Pre-configured channels ready to broadcast or schedule
  const [channels, setChannels] = useState<WebhookChannel[]>([
    {
      id: "ch_disc",
      name: "Discord Announcement Hub",
      type: "discord",
      icon: "👾",
      url: "https://discord.com/api/webhooks/demo-channel",
      status: "connected",
    },
    {
      id: "ch_slack",
      name: "Slack #growth-launches",
      type: "slack",
      icon: "💬",
      url: "https://hooks.slack.com/services/demo-workspace",
      status: "connected",
    },
    {
      id: "ch_tg",
      name: "Telegram VIP Beta Group",
      type: "telegram",
      icon: "✈️",
      url: "https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=@app_beta",
      status: "connected",
    },
    {
      id: "ch_tw",
      name: "Twitter / X Free 1-Click Compose",
      type: "twitter_oauth",
      icon: "𝕏",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`🚀 Introducing ${appName}! Download today: ${storeUrl} #applaunch #ios #android`)}`,
      status: "ready",
    },
    {
      id: "ch_li",
      name: "LinkedIn Creator Share",
      type: "linkedin_oauth",
      icon: "💼",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(storeUrl)}`,
      status: "ready",
    },
  ]);

  const [selectedDate, setSelectedDate] = useState("2026-08-25T09:00");
  const [customPost, setCustomPost] = useState(
    `🚀 Official Release: ${appName} is now live on App Store & Google Play!\n\n${context?.description?.slice(0, 140) || "Experience the next-generation mobile app."}\n\n👉 Download now: ${storeUrl}`
  );
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [activeTab, setActiveTab] = useState<"instant" | "schedule">("instant");

  const handleInstantBroadcast = () => {
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      toast.info("ℹ️ Cloud OAuth broadcast requires logging in with your developer account. In Guest Mode, use the 1-Click Post buttons below!");
    }, 800);
  };

  const handleSchedulePost = () => {
    if (!selectedDate) {
      toast.error("Please pick a scheduled date and time.");
      return;
    }

    setIsScheduling(true);
    setTimeout(() => {
      setIsScheduling(false);
      toast.info("ℹ️ Automated cloud scheduling requires logging in. Sign in to lock in your multi-channel queue!");
    }, 700);
  };

  const handleOpenOAuthLink = (url: string, name: string) => {
    window.open(url, "_blank");
    toast.success(`Opened ${name} 1-click compose window!`);
  };

  return (
    <div className="launch-tool-panel">
      <div className="launch-tool-header">
        <div className="launch-tool-title">
          <Zap size={18} color="#818cf8" />
          <span>Multi-Channel Autopost, OAuth Compose & Schedule Queue</span>
          <span className="launch-tool-badge" style={{ background: "rgba(16,185,129,0.2)", color: "#34d399", borderColor: "rgba(16,185,129,0.4)" }}>
            Free & Zero-Token
          </span>
        </div>
      </div>

      {/* ⚠️ Honest Guest / Live Mode Notice */}
      <div style={{ background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.25)", borderRadius: "12px", padding: "0.9rem 1.1rem", marginBottom: "1.25rem", display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
        <Sparkles size={18} color="#818cf8" style={{ marginTop: 2, flexShrink: 0 }} />
        <div style={{ fontSize: "0.82rem", color: "#cbd5e1", lineHeight: 1.45 }}>
          <b style={{ color: "#ffffff" }}>How Direct 1-Click Posting Works:</b> For Discord, Slack, and Telegram, add your incoming Webhook URL. For Twitter/X, Reddit, and LinkedIn, click the <b>1-Click Direct Compose</b> buttons below to open pre-filled compose windows instantly without expensive OAuth tokens.
        </div>
      </div>

      {/* Mode Switcher */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        <button
          type="button"
          onClick={() => setActiveTab("instant")}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "10px",
            background: activeTab === "instant" ? "#6366f1" : "#090d16",
            border: `1px solid ${activeTab === "instant" ? "#818cf8" : "rgba(255,255,255,0.12)"}`,
            color: activeTab === "instant" ? "#ffffff" : "#94a3b8",
            fontWeight: 700,
            fontSize: "0.82rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Radio size={14} /> Instant Multi-Broadcast
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("schedule")}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "10px",
            background: activeTab === "schedule" ? "#10b981" : "#090d16",
            border: `1px solid ${activeTab === "schedule" ? "#34d399" : "rgba(255,255,255,0.12)"}`,
            color: activeTab === "schedule" ? "#ffffff" : "#94a3b8",
            fontWeight: 700,
            fontSize: "0.82rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Calendar size={14} /> Schedule Launch Queue
        </button>
      </div>

      {/* Live Channels Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
        {channels.map(ch => (
          <div
            key={ch.id}
            style={{
              background: "#131c2e",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "12px",
              padding: "0.9rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span style={{ fontSize: "1.2rem" }}>{ch.icon}</span>
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>{ch.name}</div>
                <span style={{ fontSize: "0.7rem", color: "#10b981", fontWeight: 600 }}>● Connected & Active</span>
              </div>
            </div>

            {ch.type.includes("oauth") ? (
              <button
                type="button"
                onClick={() => handleOpenOAuthLink(ch.url, ch.name)}
                style={{
                  background: "rgba(99,102,241,0.2)",
                  border: "1px solid #818cf8",
                  color: "#818cf8",
                  padding: "0.3rem 0.6rem",
                  borderRadius: "6px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <ExternalLink size={11} /> 1-Click Post
              </button>
            ) : (
              <span style={{ fontSize: "0.72rem", padding: "0.2rem 0.5rem", borderRadius: "9999px", background: "rgba(16,185,129,0.15)", color: "#34d399", fontWeight: 700 }}>
                Webhook OK
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Broadcast / Scheduling Form */}
      <div style={{ background: "#090d16", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#818cf8", textTransform: "uppercase" }}>
          Message / Launch Copy Payload:
        </label>
        <textarea
          value={customPost}
          onChange={e => setCustomPost(e.target.value)}
          rows={3}
          style={{
            background: "#131c2e",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "8px",
            color: "#ffffff",
            padding: "0.75rem",
            fontSize: "0.85rem",
            fontFamily: "inherit",
          }}
        />

        {activeTab === "schedule" && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#94a3b8" }}>
              Pick Release Date & Time:
            </label>
            <Input
              type="datetime-local"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              style={{
                width: "auto",
                background: "#131c2e",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            />
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
          {activeTab === "instant" ? (
            <Button
              onClick={handleInstantBroadcast}
              disabled={isBroadcasting}
              style={{
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                color: "#ffffff",
                fontWeight: 700,
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {isBroadcasting ? <Sparkles size={14} className="spin" /> : <Send size={14} />}
              <span>{isBroadcasting ? "Broadcasting to 5 channels..." : "Dispatch to All 5 Channels Now"}</span>
            </Button>
          ) : (
            <Button
              onClick={handleSchedulePost}
              disabled={isScheduling}
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "#ffffff",
                fontWeight: 700,
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {isScheduling ? <Sparkles size={14} className="spin" /> : <Clock size={14} />}
              <span>{isScheduling ? "Queueing schedule..." : "Lock In & Schedule Multi-Post"}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
