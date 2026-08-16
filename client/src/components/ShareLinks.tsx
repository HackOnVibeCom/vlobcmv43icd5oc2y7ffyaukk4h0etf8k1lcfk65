import { buildShareLinks, openShareLink } from "@/lib/shareLinks";
import { MessageCircle, Send, Linkedin, Facebook, Mail, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  text: string;
  url?: string;
  subject?: string;
};

export default function ShareLinks({ text, url, subject }: Props) {
  const links = buildShareLinks(text, url, subject);

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
