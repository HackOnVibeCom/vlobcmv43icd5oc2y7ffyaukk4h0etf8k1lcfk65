import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Clipboard, Globe2, Languages, Sparkles } from "lucide-react";
import "./launch-tools.css";

type Context = { name: string; developer?: string; description: string; category?: string };

type Locale = { code: string; label: string; flag: string; namePrefix: string; subtitlePrefix: string; promoPrefix: string };

const LOCALES: Locale[] = [
  { code: "es", label: "Spanish", flag: "🇪🇸", namePrefix: "", subtitlePrefix: "Tu herramienta para ", promoPrefix: "Descubre " },
  { code: "fr", label: "French", flag: "🇫🇷", namePrefix: "", subtitlePrefix: "Votre outil pour ", promoPrefix: "Découvrez " },
  { code: "de", label: "German", flag: "🇩🇪", namePrefix: "", subtitlePrefix: "Ihr Werkzeug für ", promoPrefix: "Entdecken Sie " },
  { code: "ja", label: "Japanese", flag: "🇯🇵", namePrefix: "", subtitlePrefix: "あなたの", promoPrefix: "今すぐ体験: " },
  { code: "pt", label: "Portuguese", flag: "🇧🇷", namePrefix: "", subtitlePrefix: "Sua ferramenta para ", promoPrefix: "Descubra " },
  { code: "ko", label: "Korean", flag: "🇰🇷", namePrefix: "", subtitlePrefix: "당신의 ", promoPrefix: "지금 경험하세요: " },
];

export default function LocalizationEngine({ context }: { context?: Context }) {
  const appName = context?.name || "Your App";
  const desc = context?.description || "App launch marketing engine";
  const category = context?.category || "Productivity";
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const generateLocale = (loc: Locale) => {
    const localName = `${appName}`;
    const subtitle = `${loc.subtitlePrefix}${category.toLowerCase()}`.slice(0, 30);
    const promo = `${loc.promoPrefix}${appName} — ${desc.slice(0, 80)}`.slice(0, 170);
    return { name: localName, subtitle, promo };
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    const all = LOCALES.map(loc => {
      const g = generateLocale(loc);
      return `[${loc.label} (${loc.code})]\nApp Name: ${g.name}\nSubtitle: ${g.subtitle}\nPromo Text: ${g.promo}`;
    }).join("\n\n");
    navigator.clipboard.writeText(all);
    toast.success("Copied all 6 locale listings!");
  };

  return (
    <div className="launch-tool-panel">
      <div className="launch-tool-header">
        <div className="launch-tool-title">
          <Languages size={18} color="#818cf8" />
          <span>App Store Localization Engine</span>
          <span className="launch-tool-badge">6 Languages</span>
        </div>
        <Button size="sm" variant="outline" onClick={handleCopyAll}><Clipboard size={13} /> Copy All Locales</Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "0.75rem" }}>
        {LOCALES.map(loc => {
          const g = generateLocale(loc);
          return (
            <div key={loc.code} style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#fff" }}>{loc.flag} {loc.label}</span>
                <Button size="sm" variant="ghost" onClick={() => handleCopy(loc.code, `${g.name}\n${g.subtitle}\n${g.promo}`)}>
                  {copiedId === loc.code ? <Check size={12} /> : <Clipboard size={12} />}
                </Button>
              </div>
              {[
                { label: "App Name", value: g.name, limit: 30 },
                { label: "Subtitle", value: g.subtitle, limit: 30 },
                { label: "Promo Text", value: g.promo, limit: 170 },
              ].map(field => (
                <div key={field.label} style={{ marginBottom: "0.35rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.72rem", color: "#818cf8", fontWeight: 600 }}>{field.label}</span>
                    <span className="subtitle-char-badge">{field.value.length}/{field.limit}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "#cbd5e1" }}>{field.value}</p>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
