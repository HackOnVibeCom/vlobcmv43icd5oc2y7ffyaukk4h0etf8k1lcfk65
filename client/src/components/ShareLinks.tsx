import { openShareLink, platformUploadUrl } from "@/lib/shareLinks";
import {
  ArrowUpRight,
  Clipboard,
  ExternalLink,
  Facebook,
  KeyRound,
  Linkedin,
  Lock,
  Mail,
  MessageCircle,
  Send,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";

type Props = {
  text: string;
  url?: string;
  subject?: string;
  platform?: string;
  isSignedIn?: boolean;
};

const PLATFORM_DISPATCH_LINKS: Record<string, { label: string; url: string; note?: string }> = {
  twitter: { label: "1-Click Post to X", url: "https://twitter.com/intent/tweet" },
  linkedin: { label: "1-Click Post to LinkedIn", url: "https://www.linkedin.com/sharing/share-offsite/" },
  reddit: { label: "1-Click Submit to Reddit", url: "https://www.reddit.com/submit" },
  instagram: { label: "Open Instagram Web", url: "https://www.instagram.com/" },
  appStore: { label: "Open App Store Connect", url: "https://appstoreconnect.apple.com/" },
  googlePlay: { label: "Open Google Play Console", url: "https://play.google.com/console" },
  productHunt: { label: "Open Product Hunt Post", url: "https://www.producthunt.com/posts/new" },
};

export default function ShareLinks({ text, url, subject, platform = "twitter", isSignedIn = false }: Props) {
  const currentMeta = PLATFORM_DISPATCH_LINKS[platform] || { label: "Manual Upload", url: "https://twitter.com" };

  const handleManualUpload = async () => {
    // Copy the specific card text to clipboard first
    await navigator.clipboard.writeText(text).catch(() => {});
    toast.success(`Copied ${platform} copy to clipboard! Opening upload window...`);

    const upload = await platformUploadUrl(platform, text, url);
    if (upload?.href) {
      openShareLink(upload.href);
    } else {
      openShareLink(currentMeta.url);
    }
  };

  const handleOAuthAutoPost = () => {
    if (!isSignedIn) {
      toast.error("Cloud OAuth Autopost requires signing in. In guest mode, use 1-Click Manual Upload below!");
    } else {
      toast.info("Please connect your OAuth account in Settings → Integrations.");
    }
  };

  return (
    <div className="share-links" style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.5rem" }}>
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
        {/* 1. Manual Upload (Copies text & opens target platform) */}
        <button
          type="button"
          className="share-links__btn share-links__btn--upload"
          onClick={handleManualUpload}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "0.4rem 0.75rem",
            fontSize: "0.75rem",
            fontWeight: 700,
            background: "#131c2e",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "6px",
            cursor: "pointer",
          }}
          title={`Copy copy and open ${platform}`}
        >
          <UploadCloud size={13} color="#818cf8" />
          <span>Manual Upload ({platform})</span>
        </button>

        {/* 2. Cloud OAuth Autopost Button (Warns guest users cleanly) */}
        <button
          type="button"
          onClick={handleOAuthAutoPost}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "0.4rem 0.65rem",
            fontSize: "0.72rem",
            fontWeight: 600,
            background: "rgba(255,255,255,0.04)",
            color: "#94a3b8",
            border: "1px dashed rgba(255,255,255,0.15)",
            borderRadius: "6px",
            cursor: "pointer",
          }}
          title="Automated cloud dispatch"
        >
          <KeyRound size={11} color="#f59e0b" />
          <span>Auto-Post (OAuth required)</span>
        </button>
      </div>
    </div>
  );
}
