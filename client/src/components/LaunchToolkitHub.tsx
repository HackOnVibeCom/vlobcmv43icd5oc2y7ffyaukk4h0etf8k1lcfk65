import { useState } from "react";
import {
  Award,
  BarChart2,
  Calendar,
  CheckCircle2,
  Code2,
  DollarSign,
  FileText,
  Flame,
  Globe2,
  ImageIcon,
  Layers,
  LayoutGrid,
  MessageSquare,
  Newspaper,
  QrCode,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import SubtitleMatrixPanel from "./SubtitleMatrixPanel";
import LaunchChecklist from "./LaunchChecklist";
import CategoryBenchmark from "./CategoryBenchmark";
import CompetitorMap from "./CompetitorMap";
import KeywordPacker from "./KeywordPacker";
import CommunityLaunchPanel from "./CommunityLaunchPanel";
import PressPitchPanel from "./PressPitchPanel";
import LaunchScheduler from "./LaunchScheduler";
import ChangelogGenerator from "./ChangelogGenerator";
import ReviewResponsePanel from "./ReviewResponsePanel";
import InAppPromotionSDKPanel from "./InAppPromotionSDKPanel";
import SocialBannerStudio from "./SocialBannerStudio";
import ScreenshotStoryboard from "./ScreenshotStoryboard";
import AppStoreBadgeStudio from "./AppStoreBadgeStudio";
import PaidCampaignStudio from "./PaidCampaignStudio";
import ProductHuntPlaybook from "./ProductHuntPlaybook";
import PsychologicalTriggerAnalyzer from "./PsychologicalTriggerAnalyzer";
import "./launch-tools.css";

type HubTab =
  | "sdk"
  | "visuals"
  | "storefront"
  | "paid_ads"
  | "product_hunt"
  | "roadmap"
  | "press"
  | "community"
  | "competitors"
  | "lifecycle";

type CampaignContext = {
  name: string;
  developer?: string;
  description: string;
  category?: string;
  rating?: string;
  sourceUrl?: string;
  screenshots: string[];
  sourceKind: "url" | "brief" | "manual";
};

const TABS: Array<{ id: HubTab; label: string; icon: any; countBadge?: string }> = [
  { id: "sdk", label: "In-App Code SDK", icon: Code2, countBadge: "Swift / Kotlin / RN" },
  { id: "visuals", label: "Banners, QR & Screenshots", icon: ImageIcon, countBadge: "SVG & PNG" },
  { id: "storefront", label: "Storefront & ASO", icon: Target, countBadge: "5 Engines" },
  { id: "paid_ads", label: "Paid Search (ASA / Google)", icon: TrendingUp, countBadge: "Keywords & Copy" },
  { id: "product_hunt", label: "Product Hunt Playbook", icon: Trophy, countBadge: "Velocity Calc" },
  { id: "roadmap", label: "Launch Roadmap", icon: Calendar, countBadge: ".ics Export" },
  { id: "press", label: "PR & Newsletters", icon: Newspaper, countBadge: "3 Pitches" },
  { id: "community", label: "Show HN & Reddit", icon: Flame, countBadge: "Anti-Spam" },
  { id: "competitors", label: "Competitor Map", icon: Globe2, countBadge: "AI Contrast" },
  { id: "lifecycle", label: "Changelogs & Reviews", icon: RefreshCw, countBadge: "Retention" },
];

export default function LaunchToolkitHub({ context }: { context: CampaignContext }) {
  const [activeTab, setActiveTab] = useState<HubTab>("sdk");

  return (
    <section className="launch-toolkit-hub" aria-label="Mobile App Promotion Operating System" style={{ marginTop: "2rem" }}>
      <div className="launch-toolkit-hub__head" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <span className="studio__serial" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Sparkles size={12} color="#818cf8" /> Complete Mobile App Promotion OS
            </span>
            <h3 style={{ margin: "0.2rem 0 0", fontSize: "1.35rem", fontWeight: 700 }}>
              Promotion, Distribution & Growth Toolkit for <span style={{ color: "#818cf8" }}>{context.name}</span>
            </h3>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", color: "#10b981", fontWeight: 600 }}>
              ● 100% Verifiable & Production Ready
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mockup-tabs" style={{ background: "rgba(15, 23, 42, 0.6)", borderRadius: "12px", padding: "0.4rem", marginTop: "1rem", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`mockup-tab-btn ${isActive ? "is-active" : ""}`}
                style={{
                  padding: "0.5rem 0.85rem",
                  fontSize: "0.82rem",
                  fontWeight: isActive ? 600 : 500,
                  background: isActive ? "rgba(99, 102, 241, 0.25)" : "transparent",
                  borderColor: isActive ? "rgba(99, 102, 241, 0.4)" : "transparent",
                  color: isActive ? "#fff" : "#94a3b8",
                }}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={14} style={{ color: isActive ? "#818cf8" : "inherit" }} />
                <span>{tab.label}</span>
                {tab.countBadge && (
                  <span style={{
                    fontSize: "0.68rem",
                    padding: "0.15rem 0.45rem",
                    borderRadius: "9999px",
                    background: isActive ? "rgba(99, 102, 241, 0.3)" : "rgba(255, 255, 255, 0.06)",
                    color: isActive ? "#c7d2fe" : "#64748b",
                    marginLeft: 4,
                  }}>
                    {tab.countBadge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="launch-toolkit-hub__content">
        {activeTab === "sdk" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <InAppPromotionSDKPanel context={context} />
          </div>
        )}

        {activeTab === "visuals" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <SocialBannerStudio context={context} />
            <AppStoreBadgeStudio context={context} />
            <ScreenshotStoryboard context={context} />
          </div>
        )}

        {activeTab === "storefront" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <PsychologicalTriggerAnalyzer context={context} />
            <SubtitleMatrixPanel context={context} />
            <LaunchChecklist context={context} />
            <CategoryBenchmark context={context} />
            <KeywordPacker context={context} />
          </div>
        )}

        {activeTab === "paid_ads" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <PaidCampaignStudio context={context} />
          </div>
        )}

        {activeTab === "product_hunt" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <ProductHuntPlaybook context={context} />
          </div>
        )}

        {activeTab === "roadmap" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <LaunchScheduler appName={context.name} />
          </div>
        )}

        {activeTab === "press" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <PressPitchPanel context={context} />
          </div>
        )}

        {activeTab === "community" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <CommunityLaunchPanel context={context} />
          </div>
        )}

        {activeTab === "competitors" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <CompetitorMap context={context} />
          </div>
        )}

        {activeTab === "lifecycle" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <ChangelogGenerator context={context} />
            <ReviewResponsePanel context={context} />
          </div>
        )}
      </div>
    </section>
  );
}
