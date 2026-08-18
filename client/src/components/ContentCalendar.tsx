import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CalendarDays, Check, Clipboard, Download, Sparkles } from "lucide-react";
import "./launch-tools.css";

type Context = { name: string; description: string };

type Post = { platform: string; content: string; hashtags: string; time: string; type: string };
type Day = { day: number; label: string; posts: Post[] };

export default function ContentCalendar({ context }: { context?: Context }) {
  const appName = context?.name || "Your App";
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const calendar: Day[] = [
    { day: 1, label: "Launch Day", posts: [
      { platform: "Twitter/X", content: `${appName} is LIVE 🚀 Paste one app store link → get 6 platform-ready launch posts. Free, no sign-up. Try it now:`, hashtags: "#buildinpublic #indiedev #applaunch", time: "9:00 AM", type: "Launch Announcement" },
      { platform: "LinkedIn", content: `After months of building, ${appName} is live. It solves a real problem: writing launch copy for 6 platforms from scratch every time you ship an app.`, hashtags: "#startups #mobileapp #launch", time: "10:30 AM", type: "Launch Story" },
      { platform: "Instagram", content: `Day 1. ${appName} is live. One link. Six platforms. Zero wasted hours. Link in bio 🔗`, hashtags: "#appdev #launch #productlaunch #indiemaker", time: "12:00 PM", type: "Visual Announcement" },
    ]},
    { day: 2, label: "Feature Spotlight", posts: [
      { platform: "Twitter/X", content: `Most ASO tools are black boxes. ${appName} shows every factor that shapes your grade — character budget, keyword density, CTA presence. Transparent scoring you can verify.`, hashtags: "#aso #appstoreoptimization #mobilemarketing", time: "9:00 AM", type: "Feature Spotlight" },
      { platform: "LinkedIn", content: `Why we built transparent ASO scoring into ${appName}: Developers deserve to understand *why* their listing ranks where it does — not just get a mystery number.`, hashtags: "#productdevelopment #aso #transparency", time: "11:00 AM", type: "Behind the Decision" },
    ]},
    { day: 3, label: "Social Proof", posts: [
      { platform: "Twitter/X", content: `"Saved me 3 hours on my last launch" — Early beta tester feedback on ${appName}. What would you do with 3 extra hours on launch day?`, hashtags: "#productivity #indiedev #buildinpublic", time: "9:00 AM", type: "Testimonial" },
      { platform: "Instagram", content: `Real feedback from real builders. ${appName} saves hours of launch prep. What are you building? 👇`, hashtags: "#indiemaker #applaunch #buildandship", time: "1:00 PM", type: "Community Engagement" },
    ]},
    { day: 4, label: "How-To / Education", posts: [
      { platform: "Twitter/X", content: `Quick thread: 5 things most indie devs forget before app launch day:\n\n1. App Store subtitle (30 chars max)\n2. Social preview images\n3. Press kit ready\n4. Webhook auto-publish\n5. QR code for events\n\n${appName} handles all 5.`, hashtags: "#appdev #launch #tips", time: "9:00 AM", type: "Educational Thread" },
      { platform: "LinkedIn", content: `The App Store launch checklist most developers skip: A practical guide to the 10 things that actually matter on launch day.`, hashtags: "#appstore #mobiledev #checklist", time: "10:00 AM", type: "Educational Post" },
    ]},
    { day: 5, label: "Behind the Scenes", posts: [
      { platform: "Twitter/X", content: `Building ${appName} in public:\n\nOur tech stack: React, TypeScript, Node, Drizzle ORM, tRPC.\n\nEvery scoring engine is deterministic — no prompt wrappers. Same input = same output, every time.`, hashtags: "#buildinpublic #techstack #typescript", time: "9:00 AM", type: "Behind the Scenes" },
      { platform: "Instagram", content: `The code behind the magic ✨ Every score in ${appName} is computed with rules engines, not AI prompts. Consistent. Auditable. Trustworthy.`, hashtags: "#coding #techbehindthescenes #developer", time: "12:00 PM", type: "Tech Showcase" },
    ]},
    { day: 6, label: "User Tips", posts: [
      { platform: "Twitter/X", content: `Pro tip: Use ${appName}'s feed mockup studio to preview how your launch post will actually look on Twitter, LinkedIn, and Instagram *before* you post. Catches formatting issues early.`, hashtags: "#apptips #socialmedia #mobilemarketing", time: "9:00 AM", type: "User Tip" },
      { platform: "LinkedIn", content: `3 underrated features in ${appName} that most users discover in week 2: Feed Mockups, Psychological Trigger Scoring, and the iOS Keyword Packer.`, hashtags: "#productmarketing #tips #mobileapp", time: "11:00 AM", type: "Feature Discovery" },
    ]},
    { day: 7, label: "Community & CTA", posts: [
      { platform: "Twitter/X", content: `One week since launch 🎉\n\nWhat we shipped in 7 days based on your feedback:\n• QR code badge studio\n• A/B copy testing\n• Email drip sequence generator\n\nWhat should we build next? 👇`, hashtags: "#buildinpublic #week1 #indiedev", time: "9:00 AM", type: "Week 1 Recap" },
      { platform: "LinkedIn", content: `Week 1 learnings from launching ${appName}: What worked, what didn't, and what we're building next. A transparent post-launch retrospective.`, hashtags: "#startuplessons #launch #retrospective", time: "10:00 AM", type: "Retrospective" },
      { platform: "Instagram", content: `7 days live. Thousands of posts generated. Here's to week 2 🥂 What feature do you want next?`, hashtags: "#milestone #appdev #community #feedback", time: "1:00 PM", type: "Milestone Celebration" },
    ]},
  ];

  const handleCopyDay = (day: Day) => {
    const text = day.posts.map(p => `[${p.platform}] (${p.time} · ${p.type})\n${p.content}\n${p.hashtags}`).join("\n\n");
    navigator.clipboard.writeText(`Day ${day.day} — ${day.label}:\n\n${text}`);
    toast.success(`Copied Day ${day.day} posts!`);
  };

  const handleExportCSV = () => {
    const rows = ["Day,Label,Platform,Time,Type,Content,Hashtags"];
    calendar.forEach(d => d.posts.forEach(p => rows.push(`${d.day},"${d.label}","${p.platform}","${p.time}","${p.type}","${p.content.replace(/"/g, '""')}","${p.hashtags}"`)));
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${appName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-content-calendar.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Exported content calendar as CSV!");
  };

  return (
    <div className="launch-tool-panel">
      <div className="launch-tool-header">
        <div className="launch-tool-title">
          <CalendarDays size={18} color="#818cf8" />
          <span>7-Day Social Media Content Calendar</span>
          <span className="launch-tool-badge">{calendar.reduce((s, d) => s + d.posts.length, 0)} Posts</span>
        </div>
        <Button size="sm" variant="outline" onClick={handleExportCSV}><Download size={13} /> Export CSV</Button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {calendar.map(d => (
          <div key={d.day} style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "0.85rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontWeight: 700, color: "#fff" }}>Day {d.day} — <span style={{ color: "#818cf8" }}>{d.label}</span></span>
              <Button size="sm" variant="ghost" onClick={() => handleCopyDay(d)}><Clipboard size={12} /> Copy Day</Button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "0.5rem" }}>
              {d.posts.map((p, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "0.6rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: "0.3rem" }}>
                    <span style={{ fontWeight: 600, color: "#818cf8" }}>{p.platform}</span>
                    <span style={{ color: "#64748b" }}>{p.time} · {p.type}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#cbd5e1", lineHeight: 1.4 }}>{p.content}</p>
                  <div style={{ marginTop: "0.3rem", fontSize: "0.72rem", color: "#6366f1" }}>{p.hashtags}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
