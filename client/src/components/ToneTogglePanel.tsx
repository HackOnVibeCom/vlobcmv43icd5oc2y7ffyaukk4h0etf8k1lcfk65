import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LoaderCircle, Sliders } from "lucide-react";
import type { SourceContext } from "../../../server/services/source";

type Platform = "appStore" | "googlePlay" | "twitter" | "instagram" | "linkedin" | "productHunt";
type ToneOption = "casual" | "professional" | "developer" | "consumer" | "bold" | "minimal";

const TONES: { id: ToneOption; label: string }[] = [
  { id: "casual", label: "Casual" },
  { id: "professional", label: "Professional" },
  { id: "developer", label: "Developer" },
  { id: "consumer", label: "Consumer" },
  { id: "bold", label: "Bold" },
  { id: "minimal", label: "Minimal" },
];

export default function ToneTogglePanel({
  context,
  platform,
  onApply,
}: {
  context: SourceContext;
  platform: Platform;
  onApply: (content: string) => void;
}) {
  const [selected, setSelected] = useState<ToneOption | null>(null);

  const regen = trpc.generator.regenerateWithTone.useMutation({
    onSuccess: (data) => {
      onApply(data.content);
      toast.success(`Regenerated with ${selected} tone — applied to editor.`);
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="tone-panel">
      <div className="tone-panel__head">
        <Sliders size={13} />
        <span>Tone & audience</span>
      </div>
      <div className="tone-panel__grid">
        {TONES.map(t => (
          <button
            key={t.id}
            className={`tone-btn ${selected === t.id ? "tone-btn--active" : ""}`}
            onClick={() => setSelected(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <Button
        size="sm"
        disabled={!selected || regen.isPending}
        onClick={() => selected && regen.mutate({ context, platform, tone: selected })}
      >
        {regen.isPending ? <LoaderCircle size={12} className="spin" /> : <Sliders size={12} />}
        {regen.isPending ? "Generating…" : "Apply tone"}
      </Button>
    </div>
  );
}
