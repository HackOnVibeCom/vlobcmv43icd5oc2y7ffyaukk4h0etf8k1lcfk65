import { buildShareLinks, openShareLink, platformUploadUrl } from "@/lib/shareLinks";
import { MessageCircle, Send, Linkedin, Facebook, Mail, ArrowUpRight, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import type { ReactNode } from "react";

type Props = {
  text: string;
  url?: string;
  subject?: string;
  /** When set, renders a single "Upload to <platform>" button scoped to this card's own text. Only rendered for platforms with a real compose intent (Twitter/X, LinkedIn). */
  platform?: string;
};

export default function ShareLinks({ text, url, subject, platform }: Props) {
  const links = buildShareLinks(text, url, subject);

  async function handleUpload() {
    if (!platform) return;
    const upload = await platformUploadUrl(platform, text, url);
    if (!upload) return;
    if (upload.copiedFirst) toast.success("Copy copied — paste it into the LinkedIn post box.");
    openShareLink(upload.href);
  }

  const showUpload = platform === "twitter" || platform === "linkedin";
  const uploadLabel = platform === "twitter" ? "Upload to X / Twitter" : "Upload to LinkedIn";

  const targets: Array<{ key: string; label: string; href?: string; icon: ReactNode }> = [
    { key: "twitter", label: "X / Twitter", href: links.twitter, icon: <ArrowUpRight size={13} /> },
    { key: "linkedin", label: "LinkedIn", href: links.linkedin, icon: <Linkedin size={13} /> },
    { key: "whatsapp", label: "WhatsApp", href: links.whatsapp, icon: <MessageCircle size={13} /> },
    { key: "telegram", label: "Telegram", href: links.telegram, icon: <Send size={13} /> },
    { key: "facebook", label: "Facebook", href: links.facebook, icon: <Facebook size={13} /> },
    { key: "email", label: "Email", href: links.email, icon: <Mail size={13} /> },
  ].filter(t => Boolean(t.href));

  return (
    <div className="share-links">
      <span className="share-links__label">Share now</span>
      <div className="share-links__row">
        {showUpload && (
          <button
            type="button"
            className="share-links__btn share-links__btn--upload"
            onClick={handleUpload}
            title={uploadLabel}
          >
            <UploadCloud size={13} />
            {uploadLabel}
          </button>
        )}
        {targets.map(t => (
          <button
            key={t.key}
            type="button"
            className="share-links__btn"
            onClick={() => openShareLink(t.href!)}
            title={`Share on ${t.label}`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
