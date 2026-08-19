import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Check,
  Clipboard,
  ExternalLink,
  Eye,
  Heart,
  MessageCircle,
  Repeat2,
  Share2,
  Sparkles,
  Star,
  ThumbsUp,
  X,
  Zap,
} from "lucide-react";
import "./feed-mockup.css";

export type Platform = "appStore" | "googlePlay" | "twitter" | "instagram" | "linkedin" | "productHunt";

type Output = {
  platform: Platform;
  content: string;
  characterCount: number;
  characterLimit: number;
};

type CampaignContext = {
  name: string;
  developer?: string;
  description: string;
  category?: string;
  rating?: string;
  sourceUrl?: string;
  screenshots: string[];
};

const PLATFORMS_META: Array<{ id: Platform; label: string; limit: number }> = [
  { id: "twitter", label: "Twitter / X", limit: 280 },
  { id: "linkedin", label: "LinkedIn", limit: 1300 },
  { id: "instagram", label: "Instagram", limit: 2200 },
  { id: "appStore", label: "App Store", limit: 170 },
  { id: "googlePlay", label: "Google Play", limit: 80 },
  { id: "productHunt", label: "Product Hunt", limit: 500 },
];

export default function FeedMockupModal({
  isOpen,
  onClose,
  initialPlatform = "twitter",
  outputs,
  context,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialPlatform?: Platform;
  outputs: Partial<Record<Platform, Output>>;
  context?: CampaignContext;
}) {
  const [activePlatform, setActivePlatform] = useState<Platform>(initialPlatform);
  const [copied, setCopied] = useState(false);

  // Lock background body scroll so only the modal scrolls
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentOutput = outputs[activePlatform];
  const appName = context?.name || "Your App";
  const appInitial = appName.charAt(0).toUpperCase() || "P";
  const content = currentOutput?.content || "No generated copy yet for this channel.";
  const meta = PLATFORMS_META.find(p => p.id === activePlatform);
  const charLimit = meta?.limit || 280;
  const charCount = content.length;
  const isOverLimit = charCount > charLimit;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success(`Copied ${meta?.label} copy to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mockup-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="mockup-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="mockup-modal__header">
          <div className="mockup-modal__header-left">
            <span className="mockup-modal__badge">
              <Eye size={13} /> Live Store & Feed Mockups
            </span>
            <h3 className="mockup-modal__title">{appName}</h3>
          </div>
          <button className="mockup-modal__close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Platform Tabs */}
        <div className="mockup-tabs">
          {PLATFORMS_META.map(p => {
            const hasData = !!outputs[p.id];
            return (
              <button
                key={p.id}
                type="button"
                className={`mockup-tab-btn ${activePlatform === p.id ? "is-active" : ""}`}
                onClick={() => setActivePlatform(p.id)}
              >
                {hasData && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />}
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Mockup Preview Body */}
        <div className="mockup-modal__body">
          <div className="mockup-preview-wrap">
            {/* 1. Twitter / X */}
            {activePlatform === "twitter" && (
              <div className="mockup-card-twitter">
                <div className="mockup-twitter-header">
                  <div className="mockup-avatar">{appInitial}</div>
                  <div className="mockup-twitter-user">
                    <div className="mockup-twitter-names">
                      <span>{appName}</span>
                      <span className="mockup-verified">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      </span>
                    </div>
                    <span className="mockup-twitter-handle">@{appName.toLowerCase().replace(/[^a-z0-9]/g, "")} · 1m</span>
                  </div>
                </div>

                <div className="mockup-twitter-text">{content}</div>

                <div className="mockup-twitter-media">
                  <Sparkles size={24} color="#818cf8" />
                  <span>Launch Visual / Store Preview Card</span>
                </div>

                <div className="mockup-twitter-metrics">
                  <span><MessageCircle size={15} /> 12</span>
                  <span><Repeat2 size={15} /> 28</span>
                  <span><Heart size={15} /> 142</span>
                  <span><Share2 size={15} /></span>
                </div>
              </div>
            )}

            {/* 2. LinkedIn */}
            {activePlatform === "linkedin" && (
              <div className="mockup-card-linkedin">
                <div className="mockup-linkedin-header">
                  <div className="mockup-avatar" style={{ background: "linear-gradient(135deg, #0077b5, #00a0dc)" }}>
                    {appInitial}
                  </div>
                  <div className="mockup-linkedin-author">
                    <h5>{appName}</h5>
                    <p>Founder & Creator · 1st · Just now · 🌐</p>
                  </div>
                </div>

                <div className="mockup-linkedin-body">{content}</div>

                <div className="mockup-linkedin-footer">
                  <span><ThumbsUp size={15} /> Like</span>
                  <span><MessageCircle size={15} /> Comment</span>
                  <span><Repeat2 size={15} /> Repost</span>
                  <span><Share2 size={15} /> Send</span>
                </div>
              </div>
            )}

            {/* 3. Instagram */}
            {activePlatform === "instagram" && (
              <div className="mockup-card-instagram">
                <div className="mockup-instagram-header">
                  <div className="mockup-instagram-profile">
                    <div className="mockup-avatar" style={{ background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}>
                      {appInitial}
                    </div>
                    <span>{appName.toLowerCase().replace(/[^a-z0-9]/g, "_")}</span>
                  </div>
                  <span style={{ fontSize: "1.2rem", letterSpacing: "2px" }}>•••</span>
                </div>

                <div className="mockup-instagram-image-box">
                  <Sparkles size={36} />
                  <strong style={{ fontSize: "1.25rem" }}>{appName}</strong>
                  <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>Official Launch Showcase</span>
                </div>

                <div className="mockup-instagram-actions">
                  <div className="mockup-instagram-actions-left">
                    <Heart size={20} />
                    <MessageCircle size={20} />
                    <Share2 size={20} />
                  </div>
                  <span>🔖</span>
                </div>

                <div className="mockup-instagram-caption">
                  <strong>{appName.toLowerCase().replace(/[^a-z0-9]/g, "_")} </strong>
                  {content}
                </div>
              </div>
            )}

            {/* 4. App Store */}
            {activePlatform === "appStore" && (
              <div className="mockup-card-appstore">
                <div className="mockup-appstore-top">
                  <div className="mockup-app-icon">{appInitial}</div>
                  <div className="mockup-appstore-meta">
                    <h4>{appName}</h4>
                    <p>{context?.category || "Productivity & Utilities"}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ color: "#ffd60a", display: "inline-flex", alignItems: "center", gap: 2, fontSize: "0.85rem" }}>
                        <Star size={13} fill="#ffd60a" /> {context?.rating || "4.9"}
                      </span>
                      <span style={{ color: "#8e8e93", fontSize: "0.8rem" }}>#1 in Category</span>
                    </div>
                  </div>
                  <button type="button" className="mockup-appstore-btn">GET</button>
                </div>

                <div className="mockup-appstore-promo-box">
                  <h6>Promotional Text (App Store Connect)</h6>
                  <p>{content}</p>
                </div>
              </div>
            )}

            {/* 5. Google Play Store */}
            {activePlatform === "googlePlay" && (
              <div className="mockup-card-playstore">
                <div className="mockup-playstore-head">
                  <div className="mockup-app-icon" style={{ borderRadius: "18px", background: "linear-gradient(135deg, #01875f, #00a86b)" }}>
                    {appInitial}
                  </div>
                  <div className="mockup-playstore-info">
                    <h4>{appName}</h4>
                    <p>{context?.developer || "Verified Developer"}</p>
                    <div className="mockup-playstore-chips">
                      <span>4.8 ★</span>
                      <span>50K+ Downloads</span>
                      <span>Everyone</span>
                    </div>
                  </div>
                </div>

                <div className="mockup-playstore-desc-box">
                  <h6>Short description (Google Play Console)</h6>
                  <p>{content}</p>
                </div>
              </div>
            )}

            {/* 6. Product Hunt */}
            {activePlatform === "productHunt" && (
              <div className="mockup-card-producthunt">
                <div className="mockup-ph-top">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div className="mockup-app-icon" style={{ width: 48, height: 48, fontSize: "1.2rem", background: "#ff6154" }}>
                      {appInitial}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "1.1rem" }}>{appName}</h4>
                      <span className="mockup-ph-badge">FEATURED TODAY</span>
                    </div>
                  </div>
                  <div className="mockup-ph-upvote">
                    ▲ <span>142</span>
                  </div>
                </div>

                <div className="mockup-ph-comment-box">
                  <div className="mockup-ph-author">
                    <div className="mockup-avatar" style={{ width: 28, height: 28, fontSize: "0.75rem" }}>M</div>
                    <strong style={{ fontSize: "0.88rem" }}>Maker Pitch</strong>
                    <span className="mockup-ph-maker-tag">MAKER</span>
                  </div>
                  <div className="mockup-ph-comment-body">{content}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="mockup-modal__footer">
          <div className="mockup-footer-info">
            <span style={{ color: isOverLimit ? "#ef4444" : "#94a3b8", fontWeight: 500 }}>
              {charCount} / {charLimit} characters {isOverLimit && "(Over platform limit)"}
            </span>
          </div>
          <div className="mockup-footer-actions">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check size={14} /> : <Clipboard size={14} />}
              {copied ? "Copied" : "Copy text"}
            </Button>
            <Button size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
