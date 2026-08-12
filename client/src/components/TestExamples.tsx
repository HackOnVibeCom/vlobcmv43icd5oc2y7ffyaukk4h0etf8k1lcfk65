import { ArrowDownRight, ImageIcon, Info } from "lucide-react";
import "./test-examples.css";

export type CampaignExample = {
  id: "messaging" | "networking" | "sharing";
  label: string;
  subtitle: string;
  promo: string;
  description: string;
  playStoreUrl: string;
  visual: string;
  icon: string;
};

export const campaignExamples: CampaignExample[] = [
  {
    id: "messaging",
    label: "WhatsApp · unofficial demo",
    subtitle: "Keep the group close, even when life moves fast.",
    promo: "One place for the plans, the punchlines, and the people who matter.",
    description: "This independent demo uses WhatsApp as a familiar reference point for private group messaging. The app context is focused on helping friends, families, hobby groups, and local communities keep everyday conversations, plans, and updates together. Create original launch copy that emphasizes closeness, immediacy, and useful group coordination without implying official affiliation.",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.whatsapp&hl=en_US",
    visual: "/assets/pitchforge-whatsapp-demo_d974885d.png",
    icon: "/assets/whatsapp-play-icon_58d71556.png",
  },
  {
    id: "networking",
    label: "LinkedIn · unofficial demo",
    subtitle: "Turn the work you do into the opportunities you want.",
    promo: "Share the progress. Start the right conversation. Keep moving.",
    description: "This independent demo uses LinkedIn as a familiar reference point for professional networking. The app context is focused on helping professionals share work, build trusted connections, discover useful opportunities, and keep their career story current. Create original launch copy that emphasizes momentum and professional relationships without implying official affiliation.",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.linkedin.android&hl=en_US",
    visual: "/assets/pitchforge-linkedin-demo_4e777163.png",
    icon: "/assets/linkedin-play-icon_1907c6c9.png",
  },
  {
    id: "sharing",
    label: "Instagram · unofficial demo",
    subtitle: "Make the moment worth sharing, then keep it moving.",
    promo: "A little more color for the everyday stories you want to remember.",
    description: "This independent demo uses Instagram as a familiar reference point for visual sharing. The app context is focused on helping people capture small moments, share creative work, and connect through images and short-form stories. Create original launch copy that emphasizes visual expression and connection without implying official affiliation.",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.instagram.android&hl=en_US",
    visual: "/assets/pitchforge-instagram-demo_df0caf6c.png",
    icon: "/assets/instagram-play-icon_4683c78b.png",
  },
];

export default function TestExamples({ onSelect }: { onSelect: (example: CampaignExample) => void }) {
  return <section className="test-examples" aria-labelledby="test-examples-title">
    <div className="test-examples__heading"><div><h2 id="test-examples-title">Live demo sources</h2></div><p>Choose a preset to place its verified app source into the real generator.</p></div>
    <div className="test-examples__grid">
      {campaignExamples.map((example, index) => <article className="test-example" key={example.id}>
        <div className="test-example__image"><img src={example.visual} alt="Illustrative campaign visual example" /><span>EXAMPLE {String(index + 1).padStart(2, "0")}</span></div>
        <div className="test-example__copy"><div className="test-example__identity"><img src={example.icon} alt={`${example.label.replace(" · unofficial demo", "")} app icon`} /><span>{example.label}</span></div><h3>{example.subtitle}</h3><p>{example.promo}</p><button type="button" onClick={() => onSelect(example)}>Try This App <ArrowDownRight size={15} /></button></div>
      </article>)}
    </div>
    <aside className="test-examples__notice"><Info size={16} aria-hidden="true" /><p><strong>Unofficial test demos.</strong> “Try This App” inserts the verified Google Play URL into PITCHFORGE’s source extractor. The names above are familiar testing references only; the sample copy is original and the visuals are independent illustrations—not official advertising, approved brand assets, or real product claims. AI-generated images can occasionally be inaccurate or unsuitable; always review facts, visual details, permissions, and final copy before publishing.</p><ImageIcon size={16} aria-hidden="true" /></aside>
  </section>;
}
