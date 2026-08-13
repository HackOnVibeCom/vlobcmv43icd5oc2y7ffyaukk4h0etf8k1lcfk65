import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Check, Clipboard, LoaderCircle, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Platform = "appStore" | "googlePlay" | "twitter" | "instagram" | "linkedin" | "productHunt";
type CampaignOutput = { platform: Platform; content: string; characterCount: number; characterLimit: number };
type CampaignDetail = { id: number; name: string; sourceKind: string; sourceUrl: string | null; sourceText: string; outputs: CampaignOutput[]; images: Array<{ id: number; imageUrl: string }> };

const platformNames: Record<Platform, string> = { appStore: "App Store", googlePlay: "Google Play", twitter: "Twitter / X", instagram: "Instagram", linkedin: "LinkedIn", productHunt: "Product Hunt" };

export default function CampaignReview({ campaign, onClose }: { campaign: CampaignDetail; onClose: () => void }) {
  const [name, setName] = useState(campaign.name);
  const [outputs, setOutputs] = useState<CampaignOutput[]>(campaign.outputs);
  const [editingName, setEditingName] = useState(false);
  const utils = trpc.useUtils();
  const rename = trpc.campaigns.rename.useMutation();
  const remove = trpc.campaigns.remove.useMutation();
  const saveOutput = trpc.campaigns.saveOutput.useMutation();
  const regenerate = trpc.generator.regeneratePlatform.useMutation();

  async function persistName() {
    try {
      await rename.mutateAsync({ campaignId: campaign.id, name });
      setEditingName(false);
      await utils.campaigns.list.invalidate();
      await utils.campaigns.get.invalidate({ campaignId: campaign.id });
      toast.success("Campaign name updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The campaign could not be renamed.");
    }
  }

  async function saveCopy(index: number, content: string) {
    const output = outputs[index];
    const next = { ...output, content, characterCount: content.length };
    setOutputs(current => current.map((item, itemIndex) => itemIndex === index ? next : item));
    try {
      await saveOutput.mutateAsync({ campaignId: campaign.id, platform: output.platform, content, characterLimit: output.characterLimit });
    } catch {
      toast.error("The edit is visible here but could not be saved. Try again.");
    }
  }

  async function refreshCopy(index: number) {
    const output = outputs[index];
    try {
      const next = await regenerate.mutateAsync({ campaignId: campaign.id, platform: output.platform });
      setOutputs(current => current.map((item, itemIndex) => itemIndex === index ? next : item));
      await utils.campaigns.list.invalidate();
      toast.success(`${platformNames[output.platform]} copy refreshed.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The platform copy could not be refreshed.");
    }
  }

  async function deleteCampaign() {
    if (!window.confirm(`Delete “${campaign.name}”? This cannot be undone.`)) return;
    try {
      await remove.mutateAsync({ campaignId: campaign.id });
      await utils.campaigns.list.invalidate();
      toast.success("Campaign deleted.");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The campaign could not be deleted.");
    }
  }

  return (
    <section className="campaign-review" aria-label="Saved campaign review">
      <div className="campaign-review__top">
        <Button variant="outline" onClick={onClose}><ArrowLeft size={15} /> All campaigns</Button>
        <Button variant="outline" className="danger-button" onClick={deleteCampaign} disabled={remove.isPending}>{remove.isPending ? <LoaderCircle size={15} className="spin" /> : <Trash2 size={15} />} Delete</Button>
      </div>
      <div className="campaign-review__title">
        <div><span className="studio__serial">Saved campaign</span>{editingName ? <div className="rename-row"><Input value={name} onChange={event => setName(event.target.value)} aria-label="Campaign name" /><Button onClick={persistName} disabled={rename.isPending}>{rename.isPending ? <LoaderCircle className="spin" size={15} /> : <Check size={15} />} Save</Button></div> : <h2>{name}</h2>}</div>
        {!editingName && <button type="button" className="icon-text-button" onClick={() => setEditingName(true)}><Pencil size={14} /> Rename</button>}
      </div>
      <p className="campaign-review__source">Source: {campaign.sourceKind === "url" ? campaign.sourceUrl : campaign.sourceText.slice(0, 190)}{campaign.sourceText.length > 190 ? "…" : ""}</p>
      <div className="campaign-review__grid">
        {outputs.map((output, index) => <article className="review-output" key={output.platform}><div><h3>{platformNames[output.platform]}</h3><span>{output.characterCount.toLocaleString()} / {output.characterLimit.toLocaleString()} chars</span></div><Textarea value={output.content} onChange={event => saveCopy(index, event.target.value)} onBlur={event => saveCopy(index, event.target.value)} aria-label={`${platformNames[output.platform]} copy`} /><footer><button onClick={() => refreshCopy(index)} disabled={regenerate.isPending}><RefreshCw size={14} /> Regenerate</button><button onClick={() => navigator.clipboard.writeText(output.content).then(() => toast.success("Copy placed on your clipboard."))}><Clipboard size={14} /> Copy</button></footer></article>)}
      </div>
      {campaign.images.length > 0 && <section className="campaign-review__images"><span className="studio__serial">Generated visuals</span><div>{campaign.images.map(image => <img key={image.id} src={image.imageUrl} alt={`Campaign visual for ${campaign.name}`} />)}</div></section>}
    </section>
  );
}
