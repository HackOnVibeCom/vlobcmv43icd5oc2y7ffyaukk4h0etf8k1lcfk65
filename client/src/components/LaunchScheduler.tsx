import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar, CheckCircle2, Clock, Download, Sparkles } from "lucide-react";
import "./launch-tools.css";

type Milestone = {
  id: string;
  timeframe: string;
  title: string;
  description: string;
  actionItem: string;
  isLaunchDay?: boolean;
  dayOffset: number; // offset from launch day
};

const LAUNCH_MILESTONES: Milestone[] = [
  {
    id: "m1",
    timeframe: "T - 7 Days",
    title: "Asset & Metadata Freeze",
    description: "Finalize App Store promotional text, Play Store description, and verify all screenshots & icons.",
    actionItem: "Pack iOS keyword field (100 char limit) and review ASO score grade in PitchForge.",
    dayOffset: -7,
  },
  {
    id: "m2",
    timeframe: "T - 3 Days",
    title: "Press & Newsletter Embargo Pitches",
    description: "Send personalized pitches to tech curators, newsletter editors, and niche creators with demo credentials.",
    actionItem: "Use PitchForge Press Pitch Drafter to send 5 targeted emails.",
    dayOffset: -3,
  },
  {
    id: "m3",
    timeframe: "T - 1 Day",
    title: "Pre-Launch Warmup & Queue Setup",
    description: "Schedule Twitter/X thread, prep Product Hunt maker comment, and test webhook delivery.",
    actionItem: "Run a test webhook dispatch to your Discord/Slack announcement channels.",
    dayOffset: -1,
  },
  {
    id: "m4",
    timeframe: "Launch Day · 12:01 AM PST",
    title: "Product Hunt Goes Live",
    description: "Post the maker story and first comment. Keep discussion active and respond to every community comment.",
    actionItem: "Copy Product Hunt maker comment directly from PitchForge.",
    isLaunchDay: true,
    dayOffset: 0,
  },
  {
    id: "m5",
    timeframe: "Launch Day · 8:30 AM EST",
    title: "Twitter / X Launch Thread",
    description: "Publish your hook-first announcement thread with video or screenshot asset and direct store link.",
    actionItem: "Use 1-click 'Open in X' compose link prefilled with your thread hook.",
    isLaunchDay: true,
    dayOffset: 0,
  },
  {
    id: "m6",
    timeframe: "Launch Day · 10:00 AM EST",
    title: "LinkedIn & Show HN Launch",
    description: "Publish founder journey story on LinkedIn and submit technical 'Show HN: App Name' to Hacker News.",
    actionItem: "Copy anti-spam scored Show HN copy to Hacker News submit page.",
    isLaunchDay: true,
    dayOffset: 0,
  },
  {
    id: "m7",
    timeframe: "Launch Day · 2:00 PM EST",
    title: "Subreddit & Community Showcase",
    description: "Share in /r/SideProject, /r/IndieHackers, and relevant category Discord communities.",
    actionItem: "Post Reddit pitch and engage in honest feedback discussions.",
    isLaunchDay: true,
    dayOffset: 0,
  },
];

function generateICSFile(appName: string, launchDate: Date) {
  const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  let icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PitchForge//App Launch Roadmap//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${appName} Launch Roadmap`,
  ];

  LAUNCH_MILESTONES.forEach(m => {
    const milestoneDate = new Date(launchDate);
    milestoneDate.setDate(launchDate.getDate() + m.dayOffset);
    milestoneDate.setHours(10, 0, 0, 0);

    const endDate = new Date(milestoneDate);
    endDate.setHours(11, 0, 0, 0);

    icsContent.push(
      "BEGIN:VEVENT",
      `UID:${Date.now()}-${m.id}@pitchforge.app`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(milestoneDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `SUMMARY:🚀 ${appName} Launch: ${m.title}`,
      `DESCRIPTION:${m.description}\\n\\nAction: ${m.actionItem}\\n\\nGenerated via PitchForge`,
      "STATUS:CONFIRMED",
      "END:VEVENT"
    );
  });

  icsContent.push("END:VCALENDAR");

  const blob = new Blob([icsContent.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${appName.toLowerCase().replace(/[^a-z0-9]/g, "-") || "app"}-launch-roadmap.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function LaunchScheduler({ appName = "Your App" }: { appName?: string }) {
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });

  const handleExportICS = () => {
    const launchDate = new Date(targetDate);
    if (isNaN(launchDate.getTime())) {
      toast.error("Please pick a valid launch date");
      return;
    }
    generateICSFile(appName, launchDate);
    toast.success("Downloaded .ics Calendar Roadmap! Import into Apple, Google, or Outlook Calendar.");
  };

  return (
    <div className="launch-tool-panel">
      <div className="launch-tool-header">
        <div className="launch-tool-title">
          <Calendar size={18} color="#818cf8" />
          <span>Launch Day T-Minus Scheduler</span>
          <span className="launch-tool-badge">Strategic Roadmap</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input
            type="date"
            value={targetDate}
            onChange={e => setTargetDate(e.target.value)}
            style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff",
              padding: "0.3rem 0.5rem",
              borderRadius: "6px",
              fontSize: "0.8rem",
            }}
          />
          <Button size="sm" variant="outline" onClick={handleExportICS}>
            <Download size={13} /> Export Calendar (.ics)
          </Button>
        </div>
      </div>

      <div className="scheduler-timeline">
        {LAUNCH_MILESTONES.map(m => (
          <div key={m.id} className={`scheduler-milestone ${m.isLaunchDay ? "is-launch-day" : ""}`}>
            <div className="scheduler-time-tag">
              <Clock size={11} style={{ display: "inline", marginRight: 3 }} />
              {m.timeframe}
            </div>
            <div className="scheduler-content">
              <h5>{m.title}</h5>
              <p>{m.description}</p>
              <div style={{ marginTop: "0.35rem", fontSize: "0.78rem", color: "#818cf8", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <CheckCircle2 size={12} />
                <span><strong>Checklist:</strong> {m.actionItem}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
