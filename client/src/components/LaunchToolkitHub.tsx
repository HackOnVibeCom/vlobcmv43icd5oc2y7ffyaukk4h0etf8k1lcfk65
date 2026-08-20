import { useState } from "react";
import {
  Bell,
  CalendarDays,
  Calendar,
  Code2,
  DollarSign,
  Film,
  Flame,
  FlaskConical,
  Gift,
  Globe2,
  ImageIcon,
  Languages,
  Layers,
  Link2,
  Mail,
  Newspaper,
  QrCode,
  RefreshCw,
  Rocket,
  Shield,
  Sparkles,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import SubtitleMatrixPanel from "./SubtitleMatrixPanel";
import LaunchChecklist from "./LaunchChecklist";
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
import LandingPageGenerator from "./LandingPageGenerator";
import UTMCampaignBuilder from "./UTMCampaignBuilder";
import LocalizationEngine from "./LocalizationEngine";
import ABCopySimulator from "./ABCopySimulator";
import EmailDripCampaign from "./EmailDripCampaign";
import PushNotificationCopy from "./PushNotificationCopy";
import VideoScriptGenerator from "./VideoScriptGenerator";
import ContentCalendar from "./ContentCalendar";
import PrivacyPolicyGenerator from "./PrivacyPolicyGenerator";
import ReferralCodeGenerator from "./ReferralCodeGenerator";
import OneClickLaunchPipeline from "./OneClickLaunchPipeline";
import CompetitorReviewAttackEngine from "./CompetitorReviewAttackEngine";
import SocialAutopostOAuthScheduler from "./SocialAutopostOAuthScheduler";
import "./launch-tools.css";

type HubPhase = "prelaunch" | "postlaunch";

type HubTab =
  | "pipeline"
  | "landing"
  | "sdk"
  | "visuals"
  | "storefront"
  | "paid_ads"
  | "product_hunt"
  | "outreach"
  | "content"
  | "community"
  | "competitors"
  | "lifecycle"
  | "legal";

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

const PRELAUNCH_TABS: Array<{ id: HubTab; label: string; icon: any; countBadge?: string }> = [
  { id: "pipeline", label: "🚀 1-Click Launch & Telemetry", icon: Rocket, countBadge: "Autonomous Hero" },
  { id: "landing", label: "Landing Page & UTMs", icon: Globe2, countBadge: "HTML + Fullscreen" },
  { id: "visuals", label: "Visual Director & QR Studio", icon: ImageIcon, countBadge: "SVG & PNG" },
  { id: "paid_ads", label: "Paid Ads (ASA / Google)", icon: TrendingUp, countBadge: "CSV Bulk Upload" },
  { id: "outreach", label: "Multi-Channel Autopost & Schedule", icon: Zap, countBadge: "Direct Compose" },
  { id: "content", label: "Content Calendar & Video", icon: Film, countBadge: "7-Day + Script" },
  { id: "competitors", label: "Competitor Conquest & i18n", icon: Swords, countBadge: "Attack Ads + 6 Langs" },
  { id: "legal", label: "Privacy Policy & Terms", icon: Shield, countBadge: "App Store Req" },
];

const POSTLAUNCH_TABS: Array<{ id: HubTab; label: string; icon: any; countBadge?: string }> = [
  { id: "sdk", label: "In-App Virality & Referral SDK", icon: Code2, countBadge: "Swift / Kotlin / RN / Dart" },
  { id: "lifecycle", label: "Changelogs & Store Reviews", icon: RefreshCw, countBadge: "Retention" },
];

export default function LaunchToolkitHub({ context }: { context: CampaignContext }) {
  const [phase, setPhase] = useState<HubPhase>("prelaunch");
  const [activeTab, setActiveTab] = useState<HubTab>("pipeline");

  const currentTabs = phase === "prelaunch" ? PRELAUNCH_TABS : POSTLAUNCH_TABS;

  const handlePhaseChange = (newPhase: HubPhase) => {
    setPhase(newPhase);
    setActiveTab(newPhase === "prelaunch" ? "pipeline" : "sdk");
  };

  return (
    <section className="launch-toolkit-hub" aria-label="Mobile App Promotion Operating System" style={{ marginTop: "2rem" }}>
      <div className="launch-toolkit-hub__head" style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <span className="studio__serial" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Sparkles size={12} color="#818cf8" /> Mobile App Growth & Distribution Operating System
            </span>
            <h3 style={{ margin: "0.2rem 0 0", fontSize: "1.4rem", fontWeight: 800 }}>
              Autonomous Promotion & In-App Virality for <span style={{ color: "#818cf8" }}>{context.name}</span>
            </h3>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", color: "#10b981", fontWeight: 700 }}>
              ● 20+ Production Engines · 100% Verifiable
            </span>
          </div>
        </div>

        {/* 🌟 Master Phase Switcher (Pre-Launch Acquisition vs Post-Launch Retention) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "1.25rem", marginBottom: "0.75rem" }}>
          <button
            type="button"
            onClick={() => handlePhaseChange("prelaunch")}
            style={{
              padding: "0.9rem 1.25rem",
              borderRadius: "12px",
              background: phase === "prelaunch" ? "#22201d" : "#1a1815",
              border: `1.5px solid ${phase === "prelaunch" ? "#d8d1c5" : "rgba(255,255,255,0.08)"}`,
              color: "#ffffff",
              textAlign: "left",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              boxShadow: phase === "prelaunch" ? "0 8px 25px rgba(0,0,0,0.5)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: "8px", background: phase === "prelaunch" ? "#dc143c" : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Rocket size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: "0.95rem", fontWeight: 800 }}>Phase 1: Pre-Launch & Acquisition</div>
              <div style={{ fontSize: "0.72rem", color: "#a8a29e" }}>Drive initial downloads, directory indexing & launch ads</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handlePhaseChange("postlaunch")}
            style={{
              padding: "0.9rem 1.25rem",
              borderRadius: "12px",
              background: phase === "postlaunch" ? "#22201d" : "#1a1815",
              border: `1.5px solid ${phase === "postlaunch" ? "#d8d1c5" : "rgba(255,255,255,0.08)"}`,
              color: "#ffffff",
              textAlign: "left",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              boxShadow: phase === "postlaunch" ? "0 8px 25px rgba(0,0,0,0.5)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: "8px", background: phase === "postlaunch" ? "#2454d7" : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Code2 size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: "0.95rem", fontWeight: 800 }}>Phase 2: In-App Virality & Retention</div>
              <div style={{ fontSize: "0.72rem", color: "#a8a29e" }}>Native SDK integration, viral share sheets & review boosts</div>
            </div>
          </button>
        </div>

        {/* Tab Navigation for Selected Phase */}
        <div
          className="mockup-tabs"
          style={{
            background: "#1c1917",
            borderRadius: "10px",
            padding: "0.35rem",
            marginTop: "0.5rem",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            overflowX: "auto",
            gap: "0.3rem",
          }}
        >
          {currentTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`mockup-tab-btn ${isActive ? "is-active" : ""}`}
                style={{
                  padding: "0.5rem 0.85rem",
                  fontSize: "0.8rem",
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? (phase === "prelaunch" ? "#dc143c" : "#2454d7") : "transparent",
                  borderColor: "transparent",
                  color: isActive ? "#ffffff" : "#a8a29e",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={14} style={{ color: isActive ? "#ffffff" : "#a8a29e" }} />
                <span>{tab.label}</span>
                {tab.countBadge && (
                  <span
                    style={{
                      fontSize: "0.68rem",
                      padding: "0.15rem 0.45rem",
                      borderRadius: "9999px",
                      background: isActive ? "rgba(255,255,255,0.2)" : "rgba(255, 255, 255, 0.08)",
                      color: isActive ? "#ffffff" : "#94a3b8",
                      marginLeft: 2,
                    }}
                  >
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
        {activeTab === "pipeline" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <OneClickLaunchPipeline context={context} />
          </div>
        )}

        {activeTab === "landing" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <LandingPageGenerator context={context} />
            <UTMCampaignBuilder context={context} />
          </div>
        )}

        {activeTab === "sdk" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <InAppPromotionSDKPanel context={context} />
            <ReferralCodeGenerator context={context} />
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

        {activeTab === "outreach" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <SocialAutopostOAuthScheduler context={context} />
            <EmailDripCampaign context={context} />
            <PushNotificationCopy context={context} />
            <PressPitchPanel context={context} />
            <LaunchScheduler appName={context.name} />
          </div>
        )}

        {activeTab === "content" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <ContentCalendar context={context} />
            <VideoScriptGenerator context={context} />
          </div>
        )}

        {activeTab === "community" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <CommunityLaunchPanel context={context} />
          </div>
        )}

        {activeTab === "competitors" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <CompetitorReviewAttackEngine context={context} />
            <CompetitorMap context={context} />
            <LocalizationEngine context={context} />
          </div>
        )}

        {activeTab === "lifecycle" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <ChangelogGenerator context={context} />
            <ReviewResponsePanel context={context} />
          </div>
        )}

        {activeTab === "legal" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <PrivacyPolicyGenerator context={context} />
          </div>
        )}
      </div>
    </section>
  );
}
