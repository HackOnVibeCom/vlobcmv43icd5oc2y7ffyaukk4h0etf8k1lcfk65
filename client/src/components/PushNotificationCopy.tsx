import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bell, Check, Clipboard, Smartphone, Sparkles } from "lucide-react";
import "./launch-tools.css";

type Context = { name: string; description: string };

type Notif = { title: string; body: string };

export default function PushNotificationCopy({ context }: { context?: Context }) {
  const appName = context?.name || "Your App";
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories: { id: string; label: string; color: string; icon: string; notifications: Notif[] }[] = [
    {
      id: "onboard", label: "Onboarding Welcome", color: "#6366f1", icon: "👋",
      notifications: [
        { title: `Welcome to ${appName}! 🎉`, body: `You're all set up. Tap here to create your first project and see ${appName} in action.` },
        { title: `${appName} tip: Start here`, body: `The fastest way to get value: paste your app store link and generate launch copy in seconds.` },
        { title: `Your ${appName} toolkit is ready`, body: `Explore 10+ launch tools waiting for you — from ASO scoring to social feed mockups.` },
      ],
    },
    {
      id: "feature", label: "Feature Discovery", color: "#10b981", icon: "✨",
      notifications: [
        { title: `New: Feed Mockup Previews`, body: `See your launch copy live on Twitter, LinkedIn, Instagram, and 3 more platforms. Try it now.` },
        { title: `Have you tried the QR Studio?`, body: `Generate branded download QR codes for events, flyers, and business cards. One tap to export.` },
        { title: `Your ASO score is ready`, body: `We graded your store listing A–F across 6 ranking factors. See how you compare.` },
      ],
    },
    {
      id: "reengage", label: "Re-engagement", color: "#f59e0b", icon: "🔔",
      notifications: [
        { title: `Your launch copy misses you`, body: `You started 3 campaigns last week. Come back and finish them — your drafts are saved.` },
        { title: `It's launch season 🚀`, body: `Top indie makers are shipping this week. Generate your launch copy before the crowd.` },
        { title: `Quick win: 2 minutes`, body: `Paste one URL. Get 6 platform-ready posts. It takes less time than reading this notification.` },
      ],
    },
    {
      id: "rating", label: "Rating Request", color: "#ec4899", icon: "⭐",
      notifications: [
        { title: `Enjoying ${appName}?`, body: `You've created ${Math.floor(Math.random() * 5) + 3} campaigns! If ${appName} saved you time, a quick rating helps us grow.` },
        { title: `A moment of your time?`, body: `Your feedback shapes ${appName}'s future. Leave a quick rating — it takes 10 seconds.` },
        { title: `Thanks for using ${appName}!`, body: `We'd love to hear how your launch went. Rate us on the App Store — every star counts.` },
      ],
    },
  ];

  const handleCopy = (id: string, n: Notif) => {
    navigator.clipboard.writeText(`Title: ${n.title}\nBody: ${n.body}`);
    setCopiedId(id);
    toast.success("Copied notification!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    const all = categories.map(c => `[${c.label}]\n${c.notifications.map((n, i) => `${i + 1}. Title: ${n.title}\n   Body: ${n.body}`).join("\n")}`).join("\n\n");
    navigator.clipboard.writeText(all);
    toast.success("Copied all 12 push notifications!");
  };

  return (
    <div className="launch-tool-panel">
      <div className="launch-tool-header">
        <div className="launch-tool-title">
          <Bell size={18} color="#818cf8" />
          <span>Push Notification Copy Generator</span>
          <span className="launch-tool-badge">12 Notifications</span>
        </div>
        <Button size="sm" variant="outline" onClick={handleCopyAll}><Clipboard size={13} /> Copy All</Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.75rem" }}>
        {categories.map(cat => (
          <div key={cat.id} style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "0.85rem" }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: cat.color, marginBottom: "0.6rem" }}>{cat.icon} {cat.label}</div>
            {cat.notifications.map((n, i) => {
              const nid = `${cat.id}-${i}`;
              return (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "0.6rem", marginBottom: "0.4rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#fff" }}>{n.title}</div>
                      <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: 2 }}>{n.body}</div>
                      <div style={{ display: "flex", gap: "0.4rem", marginTop: 4 }}>
                        <span className="subtitle-char-badge">{n.title.length}/65 title</span>
                        <span className="subtitle-char-badge">{n.body.length}/240 body</span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleCopy(nid, n)} style={{ flexShrink: 0 }}>
                      {copiedId === nid ? <Check size={11} /> : <Clipboard size={11} />}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
