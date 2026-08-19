import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  Send,
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

  return createPortal(
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

        {/* Body Content */}
        <div className="mockup-modal__body">
          <div className="mockup-preview-wrap">
            {activePlatform === "twitter" && (
              <div className="mockup-card-twitter">
                <div className="mockup-twitter-header">
                  <div className="mockup-avatar">{appInitial}</div>
                  <div className="mockup-twitter-user">
                    <span className="mockup-name">{appName}</span>
                    <span className="mockup-handle">@{appName.toLowerCase().replace(/[^a-z0-9]/g, "")}</span>
                  </div>
                </div>
                <div className="mockup-twitter-text">{content}</div>
                <div className="mockup-twitter-actions">
                  <span><MessageCircle size={15} /> 12</span>
                  <span><Repeat2 size={15} /> 48</span>
                  <span><Heart size={15} /> 284</span>
                  <span><Share2 size={15} /></span>
                </div>
              </div>
            )}

            {activePlatform === "linkedin" && (
              <div className="mockup-card-linkedin">
                <div className="mockup-linkedin-header">
                  <div className="mockup-avatar">{appInitial}</div>
                  <div>
                    <div className="mockup-name">{appName}</div>
                    <div className="mockup-subtitle">Official Product Announcement • 1h</div>
                  </div>
                </div>
                <div className="mockup-linkedin-text">{content}</div>
                <div className="mockup-linkedin-actions">
                  <span><ThumbsUp size={15} /> Like</span>
                  <span><MessageCircle size={15} /> Comment</span>
                  <span><Repeat2 size={15} /> Repost</span>
                  <span><Send size={15} /> Send</span>
                </div>
              </div>
            )}

            {activePlatform === "instagram" && (
              <div className="mockup-card-instagram">
                <div className="mockup-instagram-header">
                  <div className="mockup-avatar">{appInitial}</div>
                  <span className="mockup-name">{appName.toLowerCase().replace(/[^a-z0-9]/g, "")}</span>
                </div>
                <div className="mockup-instagram-image">
                  <div className="mockup-instagram-placeholder">
                    <Sparkles size={32} color="#818cf8" />
                    <span>{appName} Visual Asset</span>
                  </div>
                </div>
                <div className="mockup-instagram-actions">
                  <div className="mockup-instagram-actions-left">
                    <Heart size={20} />
                    <MessageCircle size={20} />
                    <Send size={20} />
                  </div>
                </div>
                <div className="mockup-instagram-caption">
                  <b>{appName.toLowerCase().replace(/[^a-z0-9]/g, "")}</b> {content}
                </div>
              </div>
            )}

            {activePlatform === "appStore" && (
              <div className="mockup-card-appstore">
                <div className="mockup-appstore-header">
                  <div className="mockup-appstore-icon">{appInitial}</div>
                  <div className="mockup-appstore-meta">
                    <div className="mockup-name">{appName}</div>
                    <div className="mockup-subtitle">{context?.category || "Mobile Application"}</div>
                    <div className="mockup-appstore-btn">GET</div>
                  </div>
                </div>
                <div className="mockup-appstore-promo">
                  <span className="mockup-appstore-badge">PROMOTIONAL TEXT</span>
                  <p>{content}</p>
                </div>
              </div>
            )}

            {activePlatform === "googlePlay" && (
              <div className="mockup-card-googleplay">
                <div className="mockup-googleplay-header">
                  <div className="mockup-googleplay-icon">{appInitial}</div>
                  <div>
                    <div className="mockup-name">{appName}</div>
                    <div className="mockup-subtitle" style={{ color: "#01875f" }}>{context?.developer || "Verified Developer"}</div>
                    <div className="mockup-googleplay-rating">4.8 ★ · 10K+ Downloads</div>
                  </div>
                </div>
                <div className="mockup-googleplay-short">
                  <span className="mockup-googleplay-badge">SHORT DESCRIPTION</span>
                  <p>{content}</p>
                </div>
              </div>
            )}

            {activePlatform === "productHunt" && (
              <div className="mockup-card-producthunt">
                <div className="mockup-producthunt-header">
                  <div className="mockup-producthunt-icon">{appInitial}</div>
                  <div className="mockup-producthunt-info">
                    <div className="mockup-name">{appName}</div>
                    <div className="mockup-subtitle">Featured on Product Hunt</div>
                  </div>
                  <div className="mockup-producthunt-upvote">
                    ▲ <b>412</b>
                  </div>
                </div>
                <div className="mockup-producthunt-tagline">
                  <p>{content}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mockup-modal__footer">
          <div className="mockup-footer-charcount">
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
    </div>,
    document.body
  );
}
