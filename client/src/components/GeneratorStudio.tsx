import { lazy, Suspense } from "react";
import { useAuth } from "@clerk/react";

const ForgeScene = lazy(() => import("./ForgeScene").then(m => ({ default: m.ForgeScene })));
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  BarChart2,
  Check,
  ChevronDown,
  Clipboard,
  Download,
  FileText,
  HelpCircle,
  ImagePlus,
  Link2,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  Shuffle,
  Sliders,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import "./generator-notes.css";
import ASOScorePanel from "./ASOScorePanel";
import ReasoningPanel from "./ReasoningPanel";
import PublishPanel from "./PublishPanel";
import ShareLinks from "./ShareLinks";
import MicrositeButton from "./MicrositeButton";
import InsightsWidget from "./InsightsWidget";
import LaunchChecklist from "./LaunchChecklist";
import KeywordPacker from "./KeywordPacker";
import ABVariantPanel from "./ABVariantPanel";
import ToneTogglePanel from "./ToneTogglePanel";
import GuestSummaryCard from "./GuestSummaryCard";
import ChangelogGenerator from "./ChangelogGenerator";
import ReviewResponsePanel from "./ReviewResponsePanel";

type InputMode = "url" | "brief" | "manual";
type Platform = "appStore" | "googlePlay" | "twitter" | "instagram" | "linkedin" | "productHunt";
type CampaignContext = { name: string; developer?: string; description: string; category?: string; rating?: string; sourceUrl?: string; screenshots: string[]; sourceKind: "url" | "brief" | "manual" };
type Output = { platform: Platform; content: string; characterCount: number; characterLimit: number };
type Status = "idle" | "pending" | "ready" | "error";

const platformMeta: Array<{ id: Platform; name: string; constraint: string }> = [
  { id: "appStore", name: "App Store", constraint: "Promotional text · 170 chars" },
  { id: "googlePlay", name: "Google Play", constraint: "Short description · 80 chars" },
  { id: "twitter", name: "Twitter / X", constraint: "Single post · 280 chars" },
  { id: "instagram", name: "Instagram", constraint: "Caption + tags · 2,200 chars" },
  { id: "linkedin", name: "LinkedIn", constraint: "Professional post · 1,300 chars" },
  { id: "productHunt", name: "Product Hunt", constraint: "Maker comment · 500 chars" },
];

function readFile(file: File) {
  return new Promise<{ name: string; mimeType: string; base64: string }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("The selected brief could not be read."));
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const base64 = result.split(",")[1];
      if (!base64) return reject(new Error("The selected brief could not be read."));
      resolve({ name: file.name, mimeType: file.type || "application/octet-stream", base64 });
    };
    reader.readAsDataURL(file);
  });
}

const LANGUAGES = [
  { code: "English", label: "English" },
  { code: "Spanish", label: "Español" },
  { code: "French", label: "Français" },
  { code: "Hindi", label: "हिन्दी" },
  { code: "German", label: "Deutsch" },
  { code: "Portuguese", label: "Português" },
  { code: "Japanese", label: "日本語" },
];

// Real downloadable PDF file via jsPDF (dynamic import keeps it out of the main bundle).
async function downloadCampaignPdf(outputs: Output[], name: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(name, margin, y);
  y += 28;

  outputs.forEach(output => {
    const meta = platformMeta.find(item => item.id === output.platform);
    if (y > 740) { doc.addPage(); y = margin; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(meta?.name ?? output.platform, margin, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(output.content, maxWidth);
    lines.forEach((line: string) => {
      if (y > 780) { doc.addPage(); y = margin; }
      doc.text(line, margin, y);
      y += 15;
    });
    y += 20;
  });

  doc.save(`${name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "pitchforge-campaign"}.pdf`);
}

function downloadCampaign(outputs: Output[], name: string) {
  const body = outputs
    .map(output => `# ${platformMeta.find(item => item.id === output.platform)?.name}\n\n${output.content}\n`)
    .join("\n---\n\n");
  const blob = new Blob([body], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "pitchforge-campaign"}.md`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function GeneratorStudio({ embedded = false, preset }: { embedded?: boolean; preset?: { id: string; description?: string; playStoreUrl?: string } | null }) {
  const { isSignedIn } = useAuth();
  const [mode, setMode] = useState<InputMode>("url");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [brief, setBrief] = useState<{ name: string; mimeType: string; base64: string } | null>(null);
  const [context, setContext] = useState<CampaignContext | null>(null);
  const [outputs, setOutputs] = useState<Partial<Record<Platform, Output>>>({});
  const [statuses, setStatuses] = useState<Record<Platform, Status>>(() => Object.fromEntries(platformMeta.map(item => [item.id, "idle"])) as Record<Platform, Status>);
  const [campaignId, setCampaignId] = useState<number | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedImageText, setGeneratedImageText] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [language, setLanguage] = useState("English");
  const [expandedScore, setExpandedScore] = useState<Platform | null>(null);
  const [expandedReason, setExpandedReason] = useState<Platform | null>(null);
  const [expandedPublish, setExpandedPublish] = useState<Platform | null>(null);
  const [expandedAB, setExpandedAB] = useState<Platform | null>(null);
  const [expandedTone, setExpandedTone] = useState<Platform | null>(null);
  const prepare = trpc.generator.prepare.useMutation();
  const generatePlatform = trpc.generator.generatePlatform.useMutation();
  const saveCampaign = trpc.generator.saveCampaign.useMutation();
  const regenerate = trpc.generator.regeneratePlatform.useMutation();
  const saveOutput = trpc.campaigns.saveOutput.useMutation();
  const createImage = trpc.generator.generateImage.useMutation();
  const createGuestImage = trpc.generator.generateGuestImage.useMutation();
  const usage = trpc.generator.imageUsage.useQuery(undefined, { enabled: Boolean(isSignedIn) });
  const guestUsage = trpc.generator.guestImageUsage.useQuery(undefined, { enabled: !isSignedIn });
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!preset) return;
    if (preset.playStoreUrl) {
      setMode("url");
      setUrl(preset.playStoreUrl);
      setDescription("");
      setBrief(null);
    } else if (preset.description) {
      setMode("manual");
      setDescription(preset.description);
      setUrl("");
      setBrief(null);
    }
    setContext(null);
    setOutputs({});
    setCampaignId(null);
    setGeneratedImage(null);
    setGeneratedImageText(null);
    setStatuses(Object.fromEntries(platformMeta.map(item => [item.id, "idle"])) as Record<Platform, Status>);
  }, [preset?.id, preset?.description, preset?.playStoreUrl]);

  const completedOutputs = useMemo(() => platformMeta.map(item => outputs[item.id]).filter(Boolean) as Output[], [outputs]);
  const isGenerating = Object.values(statuses).some(status => status === "pending") || prepare.isPending;

  async function buildSource() {
    if (mode === "url") return { mode, url };
    if (mode === "manual") return { mode, description };
    return { mode, file: brief ?? undefined };
  }

  async function generateCampaign() {
    try {
      setCampaignId(null);
      setGeneratedImage(null);
      setGeneratedImageText(null);
      setOutputs({});
      const source = await buildSource();
      const extracted = await prepare.mutateAsync(source as never) as CampaignContext;
      setContext(extracted);
      setStatuses(Object.fromEntries(platformMeta.map(item => [item.id, "pending"])) as Record<Platform, Status>);

      const results = await Promise.all(
        platformMeta.map(async (item, index) => {
          await new Promise(resolve => window.setTimeout(resolve, index * 115));
          try {
            const output = await generatePlatform.mutateAsync({ context: extracted, platform: item.id, language });
            setOutputs(current => ({ ...current, [item.id]: output }));
            setStatuses(current => ({ ...current, [item.id]: "ready" }));
            return output;
          } catch (error) {
            setStatuses(current => ({ ...current, [item.id]: "error" }));
            throw error;
          }
        })
      );

      if (isSignedIn) {
        const saved = await saveCampaign.mutateAsync({ context: extracted, outputs: results });
        setCampaignId(saved.campaignId);
        await utils.campaigns.list.invalidate();
      }
      toast.success(isSignedIn ? "Campaign ready and saved to your workspace." : "Your text-only campaign is ready.");
      // Auto-expand ASO score on first card so judges see it immediately
      setExpandedScore("appStore");
    } catch (error) {
      const message = error instanceof Error ? error.message : "PITCHFORGE could not generate this campaign.";
      toast.error(message);
    }
  }

  const NO_UPLOAD_PLATFORMS = new Set(["instagram", "appStore", "googlePlay", "productHunt"]);

  async function copyOutput(output: Output) {
    await navigator.clipboard.writeText(output.content);
    const name = platformMeta.find(item => item.id === output.platform)?.name;
    toast.success(
      NO_UPLOAD_PLATFORMS.has(output.platform)
        ? `${name} copy copied — paste it into ${name}'s own post/listing screen.`
        : `${name} copy copied.`
    );
  }

  async function handleRegenerate(platform: Platform) {
    if (!campaignId) {
      toast.message("Sign in to regenerate individual platforms and save revisions.");
      return;
    }
    try {
      setStatuses(current => ({ ...current, [platform]: "pending" }));
      const output = await regenerate.mutateAsync({ campaignId, platform, language });
      setOutputs(current => ({ ...current, [platform]: output }));
      setStatuses(current => ({ ...current, [platform]: "ready" }));
      await utils.campaigns.list.invalidate();
      toast.success("Fresh platform copy generated.");
    } catch (error) {
      setStatuses(current => ({ ...current, [platform]: "error" }));
      toast.error(error instanceof Error ? error.message : "Regeneration failed.");
    }
  }

  async function handleSaveOutput(platform: Platform, content: string) {
    const original = outputs[platform];
    if (!original) return;
    const updated = { ...original, content, characterCount: content.length };
    setOutputs(current => ({ ...current, [platform]: updated }));
    if (!campaignId) return;
    try {
      await saveOutput.mutateAsync({ campaignId, platform, content, characterLimit: original.characterLimit });
    } catch {
      toast.error("The copy changed locally, but the revision could not be saved.");
    }
  }

  async function handleImage() {
    if (!context) {
      toast.message("Generate a text campaign before creating an image.");
      return;
    }
    try {
      const image = isSignedIn
        ? await createImage.mutateAsync({ campaignId: campaignId!, customPrompt: customPrompt.trim() || undefined })
        : await createGuestImage.mutateAsync({ context });
      setGeneratedImage(image.url);
      setGeneratedImageText(image.textUrl ?? null);
      setCustomPrompt("");
      if (isSignedIn) await usage.refetch();
      else await guestUsage.refetch();
      toast.success("Campaign visual generated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image generation failed.");
    }
  }

  function handleUpgrade() {
    toast.info("Premium payments are coming soon.");
  }

  return (
    <section className={`studio ${embedded ? "studio--workspace" : ""}`} aria-label="Campaign generator">
      <div className="studio__source">
        <div className="studio__headline">
          <span className="studio__serial">Campaign source</span>
          <h2>One source. Six distinct launch angles.</h2>
          <p>Start from the storefront, a client brief, or the words already in your head. PITCHFORGE preserves the source context and adapts the copy, not the claims.</p>
        </div>

        <div className="mode-tabs" role="tablist" aria-label="Campaign source type">
          {[
            { id: "url" as const, label: "Store URL", icon: Link2 },
            { id: "brief" as const, label: "Brief upload", icon: FileText },
            { id: "manual" as const, label: "Write it in", icon: WandSparkles },
          ].map(item => (
            <button key={item.id} type="button" role="tab" aria-selected={mode === item.id} className={mode === item.id ? "is-active" : ""} onClick={() => setMode(item.id)}>
              <item.icon aria-hidden="true" size={16} strokeWidth={1.8} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="source-field">
          {mode === "url" && <Input value={url} onChange={event => setUrl(event.target.value)} placeholder="Paste an App Store or Google Play URL" aria-label="App store URL" />}
          {mode === "manual" && <Textarea value={description} onChange={event => setDescription(event.target.value)} placeholder="Describe the app, the audience, its strongest features, and anything that makes it different." aria-label="App description" />}
          {mode === "brief" && (
            <label className="drop-field">
              <input
                type="file"
                accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
                onChange={async (event: ChangeEvent<HTMLInputElement>) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  try {
                    setBrief(await readFile(file));
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "The brief could not be loaded.");
                  }
                }}
              />
              <FileText size={20} strokeWidth={1.7} aria-hidden="true" />
              <span>{brief ? brief.name : "Drop a PDF, DOCX, TXT, or Markdown brief"}</span>
              <small>{brief ? "Ready to extract" : "Files stay attached to this campaign context"}</small>
            </label>
          )}
        </div>

        <div className="source-field">
          <label className="studio__language-label" htmlFor="pf-language">Generate in</label>
          <select id="pf-language" className="studio__language-select" value={language} onChange={event => setLanguage(event.target.value)} aria-label="Campaign language">
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>

        <div className="source-actions">
          <Button onClick={generateCampaign} disabled={isGenerating} className={`forge-button${isGenerating ? " forge-button--active" : ""}`}>
            {isGenerating ? <LoaderCircle size={17} className="spin" aria-hidden="true" /> : <Sparkles size={17} aria-hidden="true" />}
            {isGenerating ? "Forging your campaign" : "Generate six posts"}
            {!isGenerating && <ArrowRight size={17} aria-hidden="true" />}
          </Button>
          <p>{isSignedIn ? "Signed in: your finished campaign will be saved automatically." : "No account needed for text or your first 10 campaign visuals. Sign in when you want history and 20 monthly image credits."}</p>
        </div>
      </div>

      <div className="studio__results" aria-live="polite">
        <div className="result-topline">
          <div>
            <span className="studio__serial">Campaign output</span>
            <h3>{context ? context.name : "Six outlets, one source of truth."}</h3>
          </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {completedOutputs.length === 6 && <Button variant="outline" onClick={() => downloadCampaign(completedOutputs, context?.name ?? "pitchforge-campaign")}><Download size={15} /> Export markdown</Button>}
            {completedOutputs.length === 6 && <Button variant="outline" onClick={() => downloadCampaignPdf(completedOutputs, context?.name ?? "pitchforge-campaign").catch(() => toast.error("PDF export failed."))}><FileText size={15} /> Export PDF</Button>}
            {campaignId && isSignedIn && <MicrositeButton campaignId={campaignId} />}
          </div>
        </div>

        {isGenerating && (
          <Suspense fallback={null}>
            <ForgeScene active={isGenerating} />
          </Suspense>
        )}

        {!context && !isGenerating && (
          <div className="result-empty">
            <span className="result-empty__mark">PF</span>
            <p>Your finished copy will arrive one platform at a time, ready to edit, copy, or export.</p>
          </div>
        )}

        <div className="output-grid">
          {platformMeta.map((meta, index) => {
            const output = outputs[meta.id];
            const status = statuses[meta.id];
            return (
              <article className={`output-card output-card--${status}`} key={meta.id} style={{ "--stagger": `${index * 65}ms` } as React.CSSProperties}>
                <div className="output-card__head">
                  <div><h4>{meta.name}</h4><span>{meta.constraint}</span></div>
                  {status === "ready" && <span className="status-dot"><Check size={12} /> Ready</span>}
                  {status === "pending" && <span className="status-dot status-dot--pending"><LoaderCircle size={12} className="spin" /> Working</span>}
                </div>
                {status === "pending" && <div className="copy-skeleton"><i /><i /><i /></div>}
                {status === "error" && <div className="card-error">Generation could not complete for this platform. Try again after checking Gemini configuration.</div>}
                {output && (
                  <>
                    <Textarea className="output-card__copy" value={output.content} onChange={event => handleSaveOutput(meta.id, event.target.value)} onBlur={event => handleSaveOutput(meta.id, event.target.value)} aria-label={`${meta.name} campaign copy`} />
                    <ShareLinks text={output.content} url={context?.sourceUrl} subject={context?.name} platform={meta.id} />
                    <div className="output-card__foot">
                      <span className={output.characterCount > output.characterLimit ? "over-limit" : ""}>{output.characterCount.toLocaleString()} / {output.characterLimit.toLocaleString()}</span>
                      <div>
                        <button type="button" onClick={() => handleRegenerate(meta.id)} aria-label={`Regenerate ${meta.name}`}><RefreshCw size={14} /></button>
                        <button type="button" onClick={() => copyOutput(output)} aria-label={`Copy ${meta.name}`}><Clipboard size={14} /></button>
                        <button type="button" onClick={() => setExpandedScore(expandedScore === meta.id ? null : meta.id)} aria-label="Quality score" title="Quality score"><BarChart2 size={14} /></button>
                        <button type="button" onClick={() => setExpandedReason(expandedReason === meta.id ? null : meta.id)} aria-label="Why this copy" title="Why this copy"><HelpCircle size={14} /></button>
                        {campaignId && (
                          <button type="button" onClick={() => setExpandedAB(expandedAB === meta.id ? null : meta.id)} aria-label="A/B variants" title="A/B auto-pick"><Shuffle size={14} /></button>
                        )}
                        <button type="button" onClick={() => setExpandedTone(expandedTone === meta.id ? null : meta.id)} aria-label="Tone toggle" title="Change tone"><Sliders size={14} /></button>
                        {campaignId && isSignedIn && (
                          <button type="button" onClick={() => setExpandedPublish(expandedPublish === meta.id ? null : meta.id)} aria-label="Publish" title="Auto-publish"><ChevronDown size={14} /></button>
                        )}
                      </div>
                    </div>
                    {expandedScore === meta.id && context && (
                      <ASOScorePanel content={output.content} platform={meta.id} context={context} />
                    )}
                    {expandedReason === meta.id && context && (
                      <ReasoningPanel content={output.content} platform={meta.id} context={context} />
                    )}
                    {expandedPublish === meta.id && campaignId && (
                      <PublishPanel campaignId={campaignId} platform={meta.id} />
                    )}
                    {expandedAB === meta.id && campaignId && (
                      <ABVariantPanel
                        campaignId={campaignId}
                        platform={meta.id}
                        onPickVariant={(content) => handleSaveOutput(meta.id, content)}
                      />
                    )}
                    {expandedTone === meta.id && context && (
                      <ToneTogglePanel
                        context={context}
                        platform={meta.id}
                        onApply={(content) => handleSaveOutput(meta.id, content)}
                      />
                    )}
                  </>
                )}
              </article>
            );
          })}
        </div>

        {isSignedIn && campaignId && <InsightsWidget />}
        {!isSignedIn && context && (
          <GuestSummaryCard platformCount={completedOutputs.length} />
        )}
        {context && <LaunchChecklist context={context} />}
        {context && <KeywordPacker context={context} />}
        {context && <ChangelogGenerator context={context} />}
        {context && <ReviewResponsePanel context={context} />}

        {context && (
          <aside className="image-bench">
            <div className="image-bench__copy">
              <span className="studio__serial">Campaign visual</span>
              <h3>{isSignedIn ? usage.data?.isPremium ? "Premium image forge" : `Image credits ${usage.data ? `${usage.data.remaining} / ${usage.data.limit}` : "…"}` : `Guest image credits ${guestUsage.data ? `${guestUsage.data.remaining} / ${guestUsage.data.limit}` : "…"}`}</h3>
              <p>{isSignedIn ? usage.data?.isPremium ? "Generate polished visual direction or write a custom campaign prompt." : "Free accounts include 20 generated campaign visuals each month. Upgrade for unlimited visuals and custom prompt controls." : "Guest visitors can create up to 10 campaign visuals for seven days, without an account. Sign in to save work and receive 20 monthly image credits."}</p>
              <p className="image-disclaimer"><strong>Review before publishing.</strong> Image generation can occasionally produce inaccurate details, unsuitable visuals, or unexpected text. Verify the final asset, claims, and usage rights.</p>
              {isSignedIn && usage.data?.isPremium && <Textarea value={customPrompt} onChange={event => setCustomPrompt(event.target.value)} placeholder="Optional: steer the visual direction for this campaign." aria-label="Premium image prompt" />}
              <div className="image-bench__actions">
                <Button onClick={handleImage} disabled={!context || createImage.isPending || createGuestImage.isPending}>{createImage.isPending || createGuestImage.isPending ? <LoaderCircle className="spin" size={16} /> : <ImagePlus size={16} />} Generate visual</Button>
                {isSignedIn && !usage.data?.isPremium && <Button variant="outline" onClick={handleUpgrade}><LockKeyhole size={15} /> Upgrade to Premium</Button>}
              </div>
            </div>
            <div className="image-bench__image">
              {(createImage.isPending || createGuestImage.isPending) ? (
                <div className="image-placeholder"><LoaderCircle className="spin" size={24} /><span>Forging two posters…</span></div>
              ) : generatedImage ? (
                <div className="image-bench__variants">
                  <div className="image-bench__variant">
                    <span className="image-bench__variant-label">With text</span>
                    <img src={generatedImageText ?? generatedImage} alt={`Generated promotional poster for ${context.name}`} />
                    <a className="image-bench__download" href={generatedImageText ?? generatedImage} download={`${context.name}-with-text.png`}>
                      <Download size={13} /> Download
                    </a>
                  </div>
                  <div className="image-bench__variant">
                    <span className="image-bench__variant-label">Clean visual</span>
                    <img src={generatedImage} alt={`Generated clean campaign visual for ${context.name}`} />
                    <a className="image-bench__download" href={generatedImage} download={`${context.name}-clean.png`}>
                      <Download size={13} /> Download
                    </a>
                  </div>
                </div>
              ) : (
                <div className="image-placeholder"><ImagePlus size={24} /><span>Image output will appear here.</span></div>
              )}
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}
